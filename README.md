# angular-prerender

## About: 
Prerender your angular project to improve SEO and make pretty links. 
- Created so that a angular app can have pretty Urls and hosted on AWS s3. 

## Example:
- http://jjbskir.github.io/angular-prerender

## Install: 
- Clone repository
```
$ git clone https://github.com/jjbskir/angular-prerender
```
- Change to angular-prerender directory and install.
```
$ cd angular-prerender
$ npm install
```

## Setup:
- In your main directory create a file named prerender-config.json
- Add a default route and all the other routes to your file. Like below:
```
{
	"template": "index.html",
	"templateView": "views/home.html",
	"templateController": "HomeCtrl",
	"routes": [
		{
		  "name": "index",
		  "title": "Index",
		  "descritpion": "Home",
		  "controller": "HomeCtrl",
		  "view": "views/home.html",
		  "scripts": [
		    "controllers/home.js"
		  ],
		  "styles": [
		  ]
		},
		{
		  "name": "about",
		  "title": "About",
		  "descritpion": "About",
		  "controller": "AboutCtrl",
		  "view": "views/about.html",
		  "scripts": [
		    "controllers/about.js"
		  ],
		  "styles": [
		  ]
		}
	]
}

```
- In your index.html file or which ever file will be your template you will need to add some scripts and tags.
- Below your css files add
```
<!-- prerender-styles -->
<!-- prerender-style-end -->
```
- Below your js files add
```
<!-- prerender-styles -->
<!-- prerender-style-end -->
```
- In your app.js file or where ever you intialize your app add the library angularPrerenderRoutes and your route library of choice.
```
angular.module('app', [
	'ngRoute'
    'angularPrerenderRoutes'
])
```
- If using angular-ui/ui-router, pass it into the angularPrerenderProvider in configuration
```
// add the route templates
angularPrerenderProvider.setRouteTemplate(function(params, route) {
    params.$stateProvider
    .state('view.' + route.name, {
        url: '/' + route.name,
        views: {
          'detail@view' : {
            templateUrl: route.view,
            controller: route.controller
          }
        }
    })
});
angularPrerenderProvider.setRouteTemplateSingle(function(params, route) {
    params.$stateProvider
    .state('view.home', {
        url: '/',
        views: {
            'detail@view' : {
                templateUrl: route.view,
                controller: route.controller
            }
        }
    })
});
// add the routes.
angularPrerenderProvider.createRoutes({$stateProvider: $stateProvider});
// this is required for the root url to direct to /#/
$urlRouterProvider.otherwise('/');
```
- If using angular/router, pass it into the angularPrerenderProvider in configuration
```
// add in the route templates.
angularPrerenderProvider.setRouteTemplate(function(params, route) {
    params.$routeProvider
    .when('/' + route.name, {
        templateUrl: route.view,
        controller: route.controller
    });
});
angularPrerenderProvider.setRouteTemplateSingle(function(params, route) {
    params.$routeProvider
    .when('/', {
        templateUrl: route.view,
        controller: route.controller
    });
});
// add the routes.
angularPrerenderProvider.createRoutes({$routeProvider: $routeProvider});
```


## Prerender pages
- Run from the directory with prerender-config.json
```
$ node angular-prerender/prerender
```

## Run example 
- How to run the example from scratch for Mac
```
$ mkdir prerender-test
$ cd prerender-test
$ git clone https://github.com/jjbskir/angular-prerender
$ cd angular-prerender/
$ npm install
$ mv prerender-example/ ../
$ cd ..
$ cp -R angular-prerender prerender-example
$ cd prerender-example
$ bower install
$ node angular-prerender/prerender 
```
- view at http://directory/prerender-test/prerender-example/#/

## Improvments
- Make it work for nested directories
- Make it work for url parameters.
- for each route file it creates, only need to add the route info for that route.