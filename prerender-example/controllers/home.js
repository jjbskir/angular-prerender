angular.module('app')
.controller('HomeCtrl', function($rootScope, $scope, angularPrerender) {
   $scope.name = 'Home';
   $scope.isHashRoute = angularPrerender.isHashRoute();
   console.log('using hash routes: ' + $scope.isHashRoute);
})


