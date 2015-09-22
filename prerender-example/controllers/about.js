angular.module('app')
.controller('AboutCtrl', function($rootScope, $scope, angularPrerender) {
	$scope.name = 'About';
	$scope.isHashRoute = angularPrerender.isHashRoute();
	console.log('using hash routes: ' + $scope.isHashRoute);
})


