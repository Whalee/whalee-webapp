// public/core.js



        // include ngRoute for all our routing needs
    var whalee = angular.module('whalee', ['ngRoute']);

    // configure our routes
    whalee.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/home2', {
                templateUrl : 'pages/home2.html',
                controller  : 'mainController'
            })

            // route for the projects page
            .when('/projects', {
                templateUrl : 'pages/projects.html',
                controller  : 'projectsController'
            })

            // route for the add project page
            .when('/add', {
                templateUrl : 'pages/add.html',
                controller  : 'addController'
            });
    });


whalee.controller('mainController', function($scope, $http) {
    $scope.message = "We are in the home2"
    $scope.formData = {};
    $http.get('/api/user/')
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });
});

whalee.controller('projectsController', function($scope) {
    $scope.message = 'We are in the projects page';
});

whalee.controller('addController', function($scope) {
    $scope.message = 'You want to add a damn project?';
});

/*function mainController($scope, $http) {

    $scope.message = "We are in the home"
    $scope.formData = {};
    $http.get('/api/user/')
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });

}*/



    /*$scope.addUser = function() {
        console.log("ICI");
        $http.post('/api/users', $scope.formData)
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: ' + data);
            });
    };

    $scope.removeUser = function() {
        $http.delete('/api/users/' + 'user1')
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });
    };

    $scope.getUser = function() {
        $http.get('/api/lolcat/')
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });
    };*/

    
/*}*/