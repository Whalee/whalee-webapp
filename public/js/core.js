// public/core.js
var scotchTodo = angular.module('scotchTodo', []);

function mainController($scope, $http) {

    $scope.login = function() {
        $http.get('/home');
    }

    $scope.logout = function() {
        $http.get('/');
    }

    $scope.sla = function() {
        $http.get('/sla');
    }

    $scope.backToHome = function() {
        $http.get('/home');
    }

    $scope.slaChanged = function() {
        $http.get('/home');
    }
}