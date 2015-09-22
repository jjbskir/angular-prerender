angular.module('app', [
    // libraries
    'ngRoute',
    'angularPrerenderRoutes'
])
.config(['$routeProvider', '$locationProvider', 'angularPrerenderProvider', function($routeProvider, $locationProvider, angularPrerenderProvider) {

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
}]);