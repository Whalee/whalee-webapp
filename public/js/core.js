// public/core.js



        // include ngRoute for all our routing needs
    var whalee = angular.module('whalee', ['ngRoute']);


//    whalee.config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
//        ChartJsProvider.setOptions({
//          colours: ['#FF5252', '#FF8A80'],
//          responsive: false
//        });
        // Configure all line charts
//        ChartJsProvider.setOptions('Line', {
//          datasetFill: false
//        });
//    }])

    // configure our routes
    whalee.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/sla', {
                templateUrl : 'pages/sla.html',
                controller  : 'slaController'
            })

            // route for the projects page
            .when('/projects/:id', {
                templateUrl : 'pages/projects.html',
                controller  : 'projectsController',
                resolve : {
                    id : function ($route){ return $route.current.params.id;}
                }
            })

            // route for the add project page
            .when('/add', {
                templateUrl : 'pages/add.html',
                controller  : 'addController'
            });
    });

whalee.controller('mainController', function($scope,$http) {
    $scope.formData = {};
    $scope.projectList = [{name : "projet1", id : "id1"},{name : "projet2", id : "id2"}];
    $http.get('/api/user/')
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });

});

whalee.controller('slaController', function($scope) {
    $scope.message = "We are in the sla"
    $scope.isBronze = true;
    $scope.isSilver = false;
    $scope.isGold = false;

    $scope.onBronzeClick = function(){
        $scope.isBronze = true;
        $scope.isSilver = false;
        $scope.isGold = false;
    };

    $scope.onSilverClick = function(){
        $scope.isBronze = false;
        $scope.isSilver = true;
        $scope.isGold = false;
    };

    $scope.onGoldClick = function(){
        $scope.isBronze = false;
        $scope.isSilver = false;
        $scope.isGold = true;
    };
});

whalee.controller('projectsController', function($scope, $http, id) {
    $scope.message = 'We are in the projects page of the project '+id;
    $scope.isDeployed = false;

    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
    ];



    $scope.deployButtonText = function(){
        return ($scope.isDeployed) ? "Undeploy" : "Deploy";
    };
    $scope.onDeployClick = function(){
        $scope.isDeployed = !($scope.isDeployed);
    }
    $http.get('/api/projects/')
            .success(function(data){
                $scope.projects = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });
});

whalee.controller('addController', function($scope, $http) {
    $scope.message = 'You want to add a damn project?';
    $scope.onAddClick = function(){
    };
    $http.get('/api/projects/')
            .success(function(data){
                $scope.projectListGitHub = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });
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
