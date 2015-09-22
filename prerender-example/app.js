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

    angularPrerenderProvider.createRoutes({$stateProvider: $stateProvider});

}])
.controller('MasterController', ['$rootScope', '$location', '$scope', '$state', 'angularPrerender', function($rootScope, $location, $scope , $state, angularPrerender) {

    $scope.isHashRoute = angularPrerender.isHashRoute();
    console.log('using hash routes: ' + $scope.isHashRoute);

}]);