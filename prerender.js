var fs = require('fs'),
	_ = require('underscore');

// prerender angular routes
// ** to run
// node angular-prerender/prerender

String.prototype.includes = function(str) {
	return (this.indexOf(str) > -1);
}

// config file to load that the user creates.
var configFile = 'prerender-config.json';
// front end portion to deal with routing.
var angularPrerenderRoutesFile = 'angular-prerender/angular-prerender-routes.js';
var config = {};
var template = '';
var routes = [];
var tab = '\t\t';

init();

function init() {
	// check if the config file exists. 
	fs.exists(configFile, function(exists) {
		if (!exists) return console.log(configFile + ' file not found');

    	// if it does then load it.
		config = require('../' + configFile) || {};
		// console.log(prernederRoutes);
		// if (!validateConfig(config)) {
		// 	return;
		// }
		validateConfig(config);
		routes = config.routes || [];
		template = config.template || '';
		// update template. 
		updateTemplate(template, routes, function() {
			// create routes. 
			_.each(routes, function(route) {
				console.log('prerendering: ' + route.name);
				readFile(route, routes, template);
			});
		});
	});
}

function validateConfig(config) {
	var errors = [];
	if (!_.has(config, 'template')) {
		config['template'] = 'index.html';
		errors.push('No template. Set to index.html');
	}
	if (!_.has(config, 'routes') || !_.isArray(config['routes'])) {
		config['routes'] = [];
		errors.push('No routes');
	}
	var seen = {};
	var dupes = {};
	_.each(config.routes, function(route) {
		if (_.has(seen, route.name)) {
			// found a dupe in the routes.
			dupes[route.name] = route.name;
		} else {
			seen[route.name] = route.name;
		}
	});
	var dupeValues = _.values(dupes);
	if (dupeValues.length > 0) {
		errors.push('Found dupes: ' + dupeValues.join(', '));
	}
	if (errors.length > 0) {
		// if we found any errors. 
		console.log(errors);
		return false;
	}
	return true;
}

// update the template file with the config variables. 
function updateTemplate(template, routes, cb) {
	var loadedScripts = {};
	var loadedStyles = {};
	var prerenderedHTML = '';
	var scripts = false;
	var prerenderScriptMarker = '';
	var styles = false;
	var prerenderStyleMarker = '';

	var rl = require('readline').createInterface({
		input: fs.createReadStream(template)
	});

	rl.on('line', function (line) {
		var newLine = '';
		if (line.includes("prerender-scripts") && !line.includes("prerender-scripts-end")) {
			prerenderScriptMarker = line;
			scripts = true;
		} else if (line.includes("prerender-scripts-end")) {
			scripts = false;
			newLine += prerenderScriptMarker + '\n' + addScript(angularPrerenderRoutesFile) + '\n';
			_.each(routes, function(route) {
				newLine += addRouteScripts(route.scripts, loadedScripts);
			})
			newLine += addConfig() + '\n' + line;
		} else if (line.includes("prerender-style") && !line.includes("prerender-style-end")) {
			prerenderStyleMarker = line;
			styles = true;
		} else if (line.includes("prerender-style-end")) {
			styles = false;
			newLine += prerenderStyleMarker + '\n';
			_.each(routes, function(route) {
				newLine += addRouteStyles(route.style, loadedStyles);
			})
			newLine += line;
		} else {
			newLine = line;
		}
		if (newLine && newLine !== '') {
			if (!scripts && !styles) {
				prerenderedHTML += newLine + '\n';
			}
		}
	});

	rl.on('close', function () {
	  	console.log('updating template: ' + template);
	  	writeRenderer(template, prerenderedHTML, function() {
	  		if (cb) return cb();
	  	});
	});

}


function readFile(route, routes, template) {

	var prerenderedHTML = '';
	var scripts = false;
	var prerenderScriptMarker = '';
	var styles = false;
	var prerenderStyleMarker = '';

	var rl = require('readline').createInterface({
		input: fs.createReadStream(template)
	});

	rl.on('line', function (line) {

		// console.log(line);
		var newLine = '';
		if (line.includes("prerender-scripts") && !line.includes("prerender-scripts-end")) {
			prerenderScriptMarker = line;
			scripts = true;
		} else if (line.includes("prerender-scripts-end")) {
			// newLine = addConfig();
			scripts = false;
			newLine += prerenderScriptMarker + '\n' + addScript(angularPrerenderRoutesFile) + '\n';
			newLine += addRouteScripts(route.scripts);
			newLine += addConfig() + '\n' + line;
		} else if (line.includes("prerender-style") && !line.includes("prerender-style-end")) {
			prerenderStyleMarker = line;
			styles = true;
		} else if (line.includes("prerender-style-end")) {
			styles = false;
			newLine += prerenderStyleMarker + '\n';
			newLine += addRouteStyles(route.styles);
			newLine += line;
		} else if (line.includes('name="description"') || line.includes("name='description'")) {
			// change the description of the page.
			// <meta name="description" content="Project">
			newLine = (route.description) ? tab + '<meta name="description" content="' + route.description + '">' : line;
		} else if (line.includes('name="author"') || line.includes("name='author'")) {
			// change the author of the page.
			// <meta name="author" content="jjbskir">
			newLine = (route.author) ? tab + '<meta name="author" content="' + route.author + '">' : line;
		} else if (line.includes('name="keyphrases"')) {
			// change the title of the page.
			// <keyphrases>Project</keyphrases>
			newLine = (route.keyphrases) ? tab + '<meta name="keyphrases" content="' + route.keyphrases + '">' : line;
		} else if (line.includes("<title>")) {
			// change the title of the page.
			// <title>Project</title>
			newLine = (route.title) ? tab + '<title>' + route.title + '</title>' : line;
		} else if (line.includes('ng-view') || line.includes('ui-view')) {
			console.log(line);
			newLine = addView(line, route);
		} else {
			newLine = line;
			// if (scripts) {
			// 	newLine = addAsset("src=", line, route);
			// } else if (styles) {
			// 	console.log('updating style');
			// 	// in the middle of processing styles.
			// 	newLine = addAsset("href=", line, route);
			// 	console.log(newLine);
			// } else {
			// 	// just a normal line.
			// 	newLine = line;
			// }
		}
		if (newLine && newLine !== '') {
			if (newLine && newLine !== '') {
				if (!scripts && !styles) {
					prerenderedHTML += newLine + '\n';
				}
			}
		}

	});

	rl.on('close', function () {
	  	console.log('done processing: ' + route.name);
	  	// console.log(prerenderedHTML);
	  	writeRenderer(route.name+'.html', prerenderedHTML);
	});

	function addAsset(searchFor, line, route) {
		var search = searchFor || "src=";
		var scriptStart = line.indexOf(search);
		var lineScript = line.substring(scriptStart+search.length+1);
		if (lineScript.indexOf("'") !== -1) {
			scriptEnd = lineScript.indexOf("'");
		} else {
			scriptEnd = lineScript.indexOf('"');
		}
		lineScript = lineScript.substring(0, scriptEnd);
		// we are in the middle of processing scripts.
		if (_.contains(route.scripts, lineScript)) {
			// if this route contains this script.
			return line;
		}		
		return false;
	}

}

// Add config variable to the page.
// return: Html to add to the page. <script type="text/javascript">window.prerenderConfig={}</script>
function addConfig() {
	return tab + '<script type="text/javascript">window.prerenderConfig=' + JSON.stringify(config) + '</script>';
}

// Add a script to the page.
// script: Script path. app/js/test.js
// return: Html to add to the page. <script type="text/javascript" src="app/js/test.js"></script>
function addScript(script) {
	return tab + '<script type="text/javascript" src="' + script + '"></script>';
}

// add all of the scripts for a route.
function addRouteScripts(scripts, loadedScripts) {
	loadedScripts = loadedScripts || {};
	var line = '';
	_.each(scripts, function(script) {
		// only add the script if it has not been added yet.
		if (!_.has(loadedScripts, script)) {
			// if we have not added this script in yet.
			line += addScript(script) + '\n';
			loadedScripts[script] = true;
		}
	});
	return line;
}

// Add a style to the page.
// style: Style path. app/css/test.css
// return: Html to add to the page. <link rel="stylesheet" type="text/css" href="app/css/test.css"/>
function addStyle(style) {
	return tab + '<link rel="stylesheet" type="text/css" href="' + style + '"/>';
}

// add all of the scripts for a route.
function addRouteStyles(styles, loadedStyles) {
	loadedStyles = loadedStyles || {};
	var line = '';
	_.each(styles, function(style) {
		if (!_.has(loadedStyles, style)) {
			line += addStyle(style) + '\n';
			loadedStyles[style] = true;
		}
	});
	return line;
}

// add the html of the view to the page.
// <section id="app-layout" class="index" ng-view></section>
// <section id="app-layout" class="index" ng-controller="HomeCtrl"></section>
function addView(line, route) {
	var searches = ['ng-view', 'ui-view'];
	for (var i = 0; i < searches.length; i++) {
		var search = searches[i];
		// if we found the angular rout to search for. 
		if (line.includes(search)) break;
	}
	var newController = 'ng-controller="' + route.controller + '"';
	// remove closing tag. Add in later.
	var closeTag = findClosingTag(line);
	line = line.replace(closeTag, '');
	line = line.replace(search, newController);
	// load the view and add it to the html
	line += '\n' + tab +  readViewFile(route.view);
	// add the closing tag back in.
	line += '\n' + tab + closeTag;
	return line;
}

// read the html in a file.
function readViewFile(file) {
	var buf = fs.readFileSync(file, "utf8");
	return buf;
}

// find a closing HTML tag.
// <section id="app-layout" class="index" ng-view></section>
// return: </section>;
function findClosingTag(line) {
	var start = line.indexOf('</');
	return line.substring(start);
}

function writeRenderer(routeName, prerenderedHTML, cb) {
	// console.log(prerenderedHTML);
  	fs.writeFile(routeName, prerenderedHTML, function(err) {
		if(err) {
    		return console.log(err);
		}
		console.log("file saved: " + routeName);
		if (cb) return cb();
  	});	
}
