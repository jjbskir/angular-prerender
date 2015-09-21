angular.module('app', [
    // libraries
    'ui.router', 
    'angularPrerenderRoutes'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

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

}])
.controller('MasterController', ['$rootScope', '$location', '$scope', '$state', 'angularPrerenderFactory', function($rootScope, $location, $scope , $state, angularPrerenderFactory) {

    $scope.isHashRoute = angularPrerenderFactory.isHashRoute();
    console.log('using hash routes: ' + $scope.isHashRoute);

}]);