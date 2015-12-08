// public/core.js
var scotchTodo = angular.module('Whalee', []);

function mainController($scope, $http) {

    $scope.userInfo = {};

    $scope.addUser = function() {
        $http.post('/api/users','user1')
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
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
    }

    $scope.getUser = function() {
        $http.get('/api/users/' + 'user1')
            .success(function(data){
                $scope.userInfo = data;
                console.log(data);
            })
            .error(function(data){
                
                console.log('Error: '+data);
            });
    }

    
}