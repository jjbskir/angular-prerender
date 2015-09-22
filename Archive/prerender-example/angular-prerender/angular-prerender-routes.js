angular.module('angularPrerenderRoutes', [])
.provider('angularPrerender', function() {

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

    // the route template that gets created if using hashtag routing.
    var routeTemplate = function(params, route) {
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
    }

    // set the routeTemplate for hash tag routing.
    // angularPrerenderProvider.setRouteTemplate(function($stateProvider, route) {
    //   $stateProvider
    //   .state('view.' + route.name, {
    //     url: '/' + route.name,
    //     views: {
    //       'detail@view' : {
    //         templateUrl: route.view,
    //         controller: route.controller
    //       }
    //     }
    //   })
    // });
    function setRouteTemplate(template) {
      routeTemplate = template;
    }

    // the route template that gets created if not using hashtag routing.
    // also is used to create the hashtag routes default path.
    var routeTemplateSingle = function(params, route) {
      params.$stateProvider
      .state('view.index', {
        url: '/',
        views: {
            'detail@view' : {
                templateUrl: route.view,
                controller: route.controller
            }
        }
      })
    }

    // set the route template that gets created if not using hashtag routing.
    function setRouteTemplateSingle(template) {
      routeTemplateSingle = template;
    }

    // create the routes.
    // params: dyanmic object. Used to pass in the $stateProvider and any other objects needed to create the templates.
    function createRoutes(params) {
      params = params || {};
      if (!isHashRoute()) {

        // create a solo route based on the current url.
        // console.log('route solo');

        var urlRoute = getUrlRoute();
        var route = _.find(window.prerenderConfig.routes, function(route) { return route.name === urlRoute; });

        // console.log(window.prerenderConfig);
        // console.log(route);

        routeTemplateSingle(params, route);

      } else {

        // create all of the routes.
        // console.log('route all');

        routeTemplateSingle(params, {view: window.prerenderConfig.templateView, controller: window.prerenderConfig.templateController});

        _.each(window.prerenderConfig.routes, function(route) {
          routeTemplate(params, route);
        })
      }

    }

    // angular router is completely extensible and agnostic through these functions.
    // can update the template and how to create it. 
    this.setRouteTemplate = setRouteTemplate;
    this.setRouteTemplateSingle = setRouteTemplateSingle;
    this.createRoutes = createRoutes;

    this.$get = function() {
      return {
        isHashRoute: isHashRoute,
        getUrlRoute: getUrlRoute,
      };
    };

});