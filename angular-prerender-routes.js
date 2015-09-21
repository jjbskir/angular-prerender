angular.module('angularPrerenderRoutes', [])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    String.prototype.includes = function(str) {
        return (this.indexOf(str) > -1);
    }

    // check if the app is using hash routes to determine view.
    // return true if using hash routes, false otherwise
   	function isHashRoute() {
   		var endPath = getUrlRoute();
   		// console.log(endPath);
   		// console.log(window.location.hash);
   		// if we are on the index page, then use hash routes.
   		if (endPath === 'index.html') return true;
   		// if the has is '#/' then it is probably a non-hash route. 
   		// if the pathname ends does ends in '', then should be non-hash route.
   		return !((window.location.hash === '#/' || window.location.hash === '') && endPath !== '');
   	}

   	// get the route from the url.
   	// window.location.pathname -> /postcollegeguide/about
   	// return: about
   	function getUrlRoute() {
   		var paths = window.location.pathname.split('/');
   		return urlRoute = paths[paths.length-1];
   	}

   	if (!isHashRoute()) {

   		// create a solo route based on the current url.
      	console.log('route solo');

      	var urlRoute = getUrlRoute();
      	var route = _.find(window.prerenderConfig.routes, function(route) { return route.name === urlRoute; });

      	console.log(window.prerenderConfig);
      	console.log(route);

      	$stateProvider
      	.state('view.home', {
         	url: '/',
         	views: {
            	'detail@view' : {
               		templateUrl: route.view,
               		controller: route.controller
            	}
         	}
      	})

   	} else {

   		// create all of the routes.
      console.log('route all');

      	$stateProvider
      	.state('view.home', {
        	url: '/',
         	views: {
            	'detail@view' : {
               		templateUrl: window.prerenderConfig.templateView,
               		controller: window.prerenderConfig.templateController
           	 	}
         	}
      	})

      	_.each(window.prerenderConfig.routes, function(route) {
         	$stateProvider
         	.state('view.' + route.name, {
            	url: '/' + route.name,
            	views: {
               		'detail@view' : {
                  		templateUrl: route.view,
                  		controller: route.controller
               		}
            	}	
         	})
      	})
   	}

	// this is required for the root url to direct to /#/
	$urlRouterProvider.otherwise('/');
	// $locationProvider.html5Mode(true);

}])

.factory('angularPrerenderFactory', function() {

    // check if the app is using hash routes to determine view.
    // return true if using hash routes, false otherwise
   	function isHashRoute() {
   		var endPath = getUrlRoute();
   		// console.log(endPath);
   		// console.log(window.location.hash);
   		// if we are on the index page, then use hash routes.
   		if (endPath === 'index.html') return true;
   		// if the has is '#/' then it is probably a non-hash route. 
   		// if the pathname ends does ends in '', then should be non-hash route.
   		return !((window.location.hash === '#/' || window.location.hash === '') && endPath !== '');
   	}

   	// get the route from the url.
   	// window.location.pathname -> /postcollegeguide/about
   	// return: about
   	function getUrlRoute() {
   		var paths = window.location.pathname.split('/');
   		return urlRoute = paths[paths.length-1];
   	}

  	return {
  		isHashRoute: isHashRoute,
  		getUrlRoute: getUrlRoute
  	};

});

