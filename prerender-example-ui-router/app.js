angular.module('app', [
    // libraries
    'ui.router', 
    'angularPrerenderRoutes'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'angularPrerenderProvider', function($stateProvider, $urlRouterProvider, $locationProvider, angularPrerenderProvider) {

    // provide a wrapper controller and view that is gloabl.
    $stateProvider
    .state('view', {
        abstract: true,
        url: '',
        views: {
            '@': {
                templateUrl: 'views/layout.html',
                controller: 'MasterController'
            }
        }
    })

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
        .state('view.index', {
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
}])
.controller('MasterController', ['$rootScope', '$location', '$scope', '$state', 'angularPrerender', function($rootScope, $location, $scope , $state, angularPrerender) {

    $scope.isHashRoute = angularPrerender.isHashRoute();
    console.log('using hash routes: ' + $scope.isHashRoute);

}]);