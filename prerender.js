var fs = require('fs'),
	_ = require('underscore');

String.prototype.includes = function(str) {
	return (this.indexOf(str) > -1);
}

var configFile = 'prerender-config.json';
var config = {};
var template = '';
var routes = [];

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
		updateTemplate(template, function() {
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
function updateTemplate(template, cb) {
	var prerenderedHTML = '';

	var rl = require('readline').createInterface({
		input: fs.createReadStream(template)
	});

	rl.on('line', function (line) {
		var newLine = '';
		if (line.includes("prerender-scripts-end")) {
			newLine = addConfig() + '\n' + line;
		} else if (!line.includes("window.prerenderConfig")) {
			newLine = line;
		}
		if (newLine && newLine !== '') {
			prerenderedHTML += newLine + '\n';
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
	var styles = false;

	var rl = require('readline').createInterface({
		input: fs.createReadStream(template)
	});

	rl.on('line', function (line) {

		// console.log(line);
		var newLine = '';
		if (line.includes("prerender-scripts") && !line.includes("prerender-scripts-end")) {
			scripts = true;
		} else if (line.includes("prerender-scripts-end")) {
			newLine = addConfig();
			scripts = false;
		} else if (line.includes("prerender-style") && !line.includes("prerender-style-end")) {
			styles = true;
		} else if (line.includes("prerender-style-end")) {
			styles = false;
		} else if (line.includes('name="description"') || line.includes("name='description'")) {
			// change the description of the page.
			// <meta name="description" content="Project">
			newLine = (route.description) ? '\t\t<meta name="description" content="' + route.description + '">' : line;
		} else if (line.includes('name="author"') || line.includes("name='author'")) {
			// change the author of the page.
			// <meta name="author" content="jjbskir">
			newLine = (route.author) ? '\t\t<meta name="author" content="' + route.author + '">' : line;
		} else if (line.includes("<title>")) {
			// change the title of the page.
			// <title>Project</title>
			newLine = (route.title) ? '\t\t<title>' + route.title + '</title>' : line;
		} else {
			if (scripts) {
				newLine = addAsset("src=", line, route);
			} else if (styles) {
				// in the middle of processing styles.
				newLine = addAsset("href=", line, route);
			} else {
				// just a normal line.
				newLine = line;
			}
		}
		if (newLine && newLine !== '') {
			prerenderedHTML += newLine + '\n';
		}

	});

	rl.on('close', function () {
	  	console.log('done processing: ' + route.name);
	  	// console.log(prerenderedHTML);
	  	writeRenderer(route.name, prerenderedHTML);
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

function addConfig() {
	return '\t\t<script type="text/javascript"> window.prerenderConfig = ' + JSON.stringify(config) + '</script>';
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
