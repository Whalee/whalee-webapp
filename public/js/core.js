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

whalee.controller('mainController', function($scope,$http,$rootScope) {
    $scope.formData = {};
    $scope.showProjects = false;
    $scope.projectsIcon = "keyboard_arrow_right";
    //$scope.projectList = [{name : "projet1", id : "id1"},{name : "projet2", id : "id2"}];
    $scope.projectList = [];

    $rootScope.$on('updateProjectList', function () {
      //$scope.projectList[2]={name:"project3",id:"id3"};
      getProjectsDeployed();
    });

    $scope.onProjectsClick = function(){

        $scope.showProjects = ! $scope.showProjects;
        if($scope.showProjects){
            $scope.projectsIcon = "keyboard_arrow_down";
        }else{
            $scope.projectsIcon = "keyboard_arrow_right";
        }
        console.log($scope.showProjects);
    }

    function getProjectsDeployed() {
      $http.get('/api/projects/deployed')
            .success(function(data){
                $scope.projectList = data;
                console.log(data);
            })
            .error(function(data){
                console.log('Error: '+data);
            });
    }

    getProjectsDeployed();

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

    $scope.currentContainerId = "";

    $scope.timeScaleCPU = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    $scope.timeScaleMem = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    $scope.timeScaleDisk = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    $scope.seriesCPU = ['CPU'];
    $scope.seriesMem = ['Memory'];
    $scope.seriesDisk = ['Disk'];
    $scope.dataCPU = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

    $scope.dataMem = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

    $scope.dataDisk = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

    $scope.containers = [{
    id: "Container 1",
    proc: {
        max: 100,
        cur:10,
        hist: [1,12,15,14,12,13,4,3,3,3,3],
    }, memory: {
        max: 100,
        cur:10,
        hist: [1,12,15],
    }, disk: {
        max: 100,
        cur:10,
        hist: [1,12,15],
 
    }
}, {
    id: "Contaiener 2",
    proc: {
        max: 100,
        cur:10,
        hist: [1,12,15],
    }, memory: {
        max: 100,
        cur:10,
        hist: [1,12,15],
    }, disk: {
        max: 100,
        cur:10,
        hist: [1,12,15],
    }
}];


function getTimeScale(size){
        console.log("On rentre dans le getTimeScale.");

    var list = [];

    for(var i = (size-1); i>=0; i--){
        list.push(i);
    }

    return list;

};

function retrieveData(){
    console.log("On rentre dans le retrieveData.");
    console.log("current ID : "+ $scope.currentContainerId);

    for(var i = 0; i<$scope.containers.length; i++){
            console.log("ID visité: "+ $scope.containers[i].id);

        if($scope.containers[i].id == $scope.currentContainerId){
            console.log("On a trouver un id qui est "+ $scope.containers[i].id);

            $scope.timeScaleCPU = getTimeScale($scope.containers[i].proc.hist.length);
            console.log($scope.containers[i] +" "+ i);
            $scope.dataCPU = [];
            var temp = $scope.containers[i].proc.hist;
            $scope.dataCPU.push(temp);

            $scope.timeScaleMem = getTimeScale($scope.containers[i].memory.hist.length);
            $scope.dataMem = [];
            $scope.dataMem.push($scope.containers[i].memory.hist);

            $scope.timeScaleDisk = getTimeScale($scope.containers[i].disk.hist.length);
            $scope.dataDisk = [];
            $scope.dataDisk.push($scope.containers[i].disk.hist);
        }
    }
}

    $scope.onContainerClick = function(containerId){
        console.log("On click sur le container "+id);
        $scope.currentContainerId = containerId;
        retrieveData();

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

whalee.controller('addController', function($scope, $http, $rootScope) {
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
        $http.post('/api/projects/fakedeploy', $scope.projectToAdd[0])
            .success(function(data){
                //$scope.projectListGitHub = data;
                console.log(data);
            })
            .error(function(data){
                console.log('Error: '+data);
            });

        $rootScope.$broadcast('updateProjectList');
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
