// public/core.js



        // include ngRoute for all our routing needs
    var whalee = angular.module('whalee', ['chart.js','ngRoute']);


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
    $scope.showProjects = false;
    $scope.projectsIcon = "keyboard_arrow_right";
    $scope.projectList = [{name : "projet1", id : "id1"},{name : "projet2", id : "id2"}];
    $scope.onProjectsClick = function(){

        $scope.showProjects = ! $scope.showProjects;
        if($scope.showProjects){
            $scope.projectsIcon = "keyboard_arrow_down";
        }else{
            $scope.projectsIcon = "keyboard_arrow_right";
        }
        console.log($scope.showProjects);
    }
    $http.get('/api/user/')
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });

});

whalee.controller('slaController', function($scope,$http) {
    $scope.message = "Please, choose your SLA.";
    
    $scope.isBronze = false;
    $scope.isSilver = false;
    $scope.isGold = false;

    $http.get('/api/user/')
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);

    if(($scope.userInfo.sla) == "1"){
        $scope.isBronze = true;
    }else if($scope.userInfo.sla == "2"){
        $scope.isSilver = true;

    }else if($scope.userInfo.sla == "3"){
        $scope.isGold = true;

    }
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });

    

    $scope.onBronzeClick = function(){
        $scope.isBronze = true;
        $scope.isSilver = false;
        $scope.isGold = false;
        $http.post('/api/sla/' + "1")
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });
    };

    $scope.onSilverClick = function(){
        $scope.isBronze = false;
        $scope.isSilver = true;
        $scope.isGold = false;
        $http.post('/api/sla/' + "2")
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });
    };

    $scope.onGoldClick = function(){
        $scope.isBronze = false;
        $scope.isSilver = false;
        $scope.isGold = true;
        $http.post('/api/sla/' + "3")
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });
    };
});

whalee.controller('projectsController', function($scope, $http, id) {
    $scope.message = 'This is the project: '+id;
    $scope.isDeployed = false;

    $scope.timeScale = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    $scope.seriesCPU = ['CPU'];
    $scope.seriesMem = ['Memory'];
    $scope.seriesDisk = ['Disk'];
    $scope.dataCPU = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

    $scope.dataMem = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

    $scope.dataDisk = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];


    $scope.containers = [{id : "C1"},{id : "C2"},{id : "C3"},{id : "C4"}];


    $scope.onContainerClick = function(id){
        console.log("On click sur le container "+id);
        if(id=="C1"){
            $scope.dataCPU = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];

            $scope.dataMem = [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]];

            $scope.dataDisk = [[10, 10, 10, 10, 10, 10, 10, 10, 10, 10]];


        }else if (id=="C2") {

            $scope.dataCPU = [[5, 5, 5, 5, 10, 10, 8, 7, 6, 5]];

            $scope.dataMem = [[4, 4, 7, 4, 4, 7, 4, 4, 7, 4]];

            $scope.dataDisk = [[4, 4, 5, 5, 6, 6, 7, 7, 8, 8]];

        }else if (id=="C3") {

            $scope.dataCPU = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

            $scope.dataMem = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

            $scope.dataDisk = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];


        }else if (id=="C4") {

            $scope.dataCPU = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

            $scope.dataMem = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

            $scope.dataDisk = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

        }

    }


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
    $scope.message = 'Please, select the projects to add.';
    $scope.projectToAdd = [];

    $scope.toggleSelection = function toggleSelection(project) {
        var idx = $scope.projectToAdd.indexOf(project);

        // is currently selected
        if (idx > -1) {
          $scope.projectToAdd.splice(idx, 1);
        }

        // is newly selected
        else {
          $scope.projectToAdd.push(project);
        }
    };

    $scope.onAddClick = function(){
        console.log($scope.projectToAdd);
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
