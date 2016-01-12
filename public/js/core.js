// public/core.js

    // include ngRoute for all our routing needs
    var whalee = angular.module('whalee', ['chart.js','ngRoute']);

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
    $scope.projectList = [];

    $rootScope.$on('updateProjectList', function () {
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
                $rootScope.projectList = data;
                if (data.length==0) {
                  if ($scope.showProjects) {
                    $scope.onProjectsClick();
                  }
                } else {
                  if (!$scope.showProjects) {
                    $scope.onProjectsClick();
                  }
                }
            })
            .error(function(data){
                console.log('Error: '+data);
            });
    }

    getProjectsDeployed();

    $http.get('/api/user/')
            .success(function(data){
                $scope.userInfo = data;
                $rootScope.userInfo = data;
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

whalee.controller('projectsController', function($scope, $http, id, $rootScope, $location) {
    $scope.project = null;
    for (i in $rootScope.projectList) {
      if ($rootScope.projectList[i].githubID==id) {
        $scope.project = $rootScope.projectList[i];
      }
    }

    $scope.userInfo = $rootScope.userInfo;
    $scope.message = 'This is the project : '+$scope.project.name;
    $scope.isDeployed = false;
    $scope.hooked = ($scope.project.hooked=="0")?false:true;

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

    $scope.autoDeploy = function () {
      if ($scope.hooked) {
        $http.post('/api/projects/deployed/'+$scope.project.githubID+'/enableautodeploy')
            .success(function(data){
            })
            .error(function(data){
                console.log('Error: '+data);
            });
      } else {
        $http.post('/api/projects/deployed/'+$scope.project.githubID+'/disableautodeploy')
            .success(function(data){
            })
            .error(function(data){
                console.log('Error: '+data);
            });
      }
    }

    $scope.onRemoveClick = function () {
      $http.delete('/api/projects/deployed/'+id)
            .success(function(data){
                $rootScope.$broadcast('updateProjectList');
                $location.path('/sla');
            })
            .error(function(data){
                console.log('Error: '+data);
            });
    }

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
    id: "Container 2",
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

    $scope.onContainerClick = function(containerId,index){
        $( "table.mdl-data-table tbody>tr" ).css( "background-color", "white" );
        $( "table.mdl-data-table tbody>tr:nth-child("+parseInt(index+1)+")" ).css( "background-color", "pink" );
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
    $scope.projectListGitHub = [];

    $scope.onAddClick = function(index){
        console.log($scope.projectListGitHub);
        $http.post('/api/projects/deployed', $scope.projectListGitHub[index])
            .success(function(data){
                console.log(data);
                $rootScope.$broadcast('updateProjectList');
                updateList();
            })
            .error(function(data){
                console.log('Error: '+data);
            });
    }

    $scope.onDeleteClick = function(index){
        console.log($scope.projectListGitHub);
        $http.delete('/api/projects/deployed/'+$scope.projectListGitHub[index].id)
            .success(function(data){
                console.log(data);
                $rootScope.$broadcast('updateProjectList');
                updateList();
            })
            .error(function(data){
                console.log('Error: '+data);
            });
    }

    function updateList() {
      $http.get('/api/projects/')
            .success(function(data){
                $scope.projectListGitHub = data;
                var tab = $rootScope.projectList;
                for (i in $scope.projectListGitHub) {
                  $scope.projectListGitHub[i].added=false;

                  for (j in tab) {
                    if (tab[j].githubID==$scope.projectListGitHub[i].id) {
                      $scope.projectListGitHub[i].added=true;
                    }
                  }
                }
            })
            .error(function(data){
                console.log('Error: '+data);
            });
    }

    updateList();
});
