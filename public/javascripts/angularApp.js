var app = angular.module ('scheduler',['ui.router']);


/*FACTORTIES*/
  //authorizing service
  app.factory('auth', ['$http', '$window', function($http, $window){
    var auth = {};

    auth.saveToken = function (token){
      $window.localStorage['scheduler-token'] = token;
    };

    auth.getToken = function (){
      return $window.localStorage['scheduler-token'];
    }

    auth.isLoggedIn = function(){
      var token = auth.getToken();

      if(token){
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      } 
      else {
        return false;
      }
    };

    auth.currentUser = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        payload.username = payload.username.charAt(0).toUpperCase() + payload.username.slice(1);
        return payload.username;
      }
    };

    auth.register = function(user){
      return $http.post('/register', user).success(function(data){
        auth.saveToken(data.token);
      });
    };

    auth.logIn = function(user){
      return $http.post('/login', user).success(function(data){
        auth.saveToken(data.token);
      });
    };

    auth.logOut = function(){
      $window.localStorage.removeItem('scheduler-token');
    };

    

    return auth;
  }])

//DIRECTIVES  
/*app.directive('bsPopover', function () {
    return {
        restrict: 'A',
        link: function (scope, el, attrs) {
            scope.label = attrs.popoverLabel;
            $(el).popover({
                trigger: 'click',
                html: true,
                content: attrs.popoverHtml,
                placement: attrs.popoverPlacement
            });
        }
    };
});*/


	//the controllers
app.controller('MainCtrl',[
	'$scope', '$state', 'auth','$http',
	function( $scope, $state, auth, $http){	
    var outlets = {};
    var outlet ={};
    $scope.currentUser = auth.currentUser();
		//define here the variables used in the main state or say main app page
    $scope.fetchOutlets = function(){
      //sending request to the server
      return $http.get("/outlet", {headers:{Authorization: 'Bearer ' + auth.getToken()}}).success(function(data){
          $scope.outlets = data;
      });
    }

    $scope.deleteOutlet = function(id){
      if(confirm('Are you sure, that you want to delete this entry')){
        return $http.delete('/outlet/'+id, {headers:{Authorization: 'Bearer ' + auth.getToken()}}).success(function(data){
          alert(data.message);
          $state.reload();
        });
      }
      else return;
    }

    

    //calling fetch outlets
    $scope.fetchOutlets();
    
  }
])

app.controller('WorkoutCtrl', ['$scope', '$state', 'auth', '$stateParams', '$http',
  function($scope, $state, auth, $stateParams, $http){
      $scope.currentUser = auth.currentUser();
      var workouts ={};
      var newWorkout = {};
      var id = $stateParams.id;

      $http.get('/workout?id='+id, {headers:{Authorization: 'Bearer ' + auth.getToken()}}).success(function(data){
          $scope.workouts = data;
          console.log(workouts);
      }).error(function(err){
        alert("there has been an error");
      });

      $scope.addWorkout = function(data){
        console.log(newWorkout);
        alert("pausing for debudgging");
        return $http.post('/workout/?id='+id, data, {headers:{Authorization:'Bearer ' + auth.getToken()}}).success(function(data){
          alert("Successfully added the workout").error(function(err,data){
            console.log(err);
            console.log("data");
            alert("Something went Wrong");
          });

        })
      }

      $scope.deleteWorkout = function(id){
        alert("Are you sure");
        $http.delete('/workout/'+id, {headers:{Authorization:'Bearer ' + auth.getToken()}}).success(function(data){
          console.log(data + "successfully done the deletion operation");
          $state.reload();
          }).error(function(err){
            alert("there has been an error");
        })
      }

  }])

app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};
  $scope.newUser = {};

  $scope.register = function(){
    auth.register($scope.newUser).error(function(error){
      $scope.newUser.error = error;
    }).then(function(){
      $state.go('main');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.user.error = error;
    }).then(function(){
      $state.go('main');
    });
  };
}])

app.controller('ProfileCtrl', [
  '$scope',
  '$state', 
  'auth',
  '$http',
  function( $scope, $state, auth, $http ){
      $scope.ctrlInit = function () { 
          $http.get('/profile',{headers:{Authorization: 'Bearer ' + auth.getToken()}}).success(function(data){
          $scope.users = data;
          $scope.editCancel = true;
          
        });
       }

       $scope.ctrlInit();
      
      $scope.updateProfile = function(data){
        return $http.post('profile', data, {headers:{Authorization:'Bearer ' + auth.getToken()}}).success(function(data){
            console.log(data.from+"Successfully added data to the database"+data.to);
             $scope.users[0] = data;
             console.log($scope.users[0]);
             alert("Successfully made an entry");
           }).error(function(){
            alert("Couldn't upload data, try again..")
          });
      };

      $scope.toggleEdit = function(){
        var toggleBool =  $('.form-control').attr('readonly');
        if(toggleBool==="readonly"){
          $('.form-control').attr('readonly', false);
          $scope.editCancel = false;
        }
        else
        {
           $('.form-control').attr('readonly', true);
          $scope.editCancel = true;

        }
        
      };
  }
  ])

app.controller('OutletCtrl', ['$scope', '$state', '$http', 'auth', function($scope, $state, $http, auth){
  /*This controller performms the following tasks:
    1. Collect data from the outlet+ form (10)
    2. Send to the server for saving and report back to the user.
  */
  $scope.outlet = {};

  $scope.addOutlet = function(data){
    $http.post('/outlet', data, {headers:{Authorization:'Bearer ' + auth.getToken()}}).success(function(data){
      alert("Successfully made an entry");
    }).error(function(error){
      $scope.outlet.error = error;
      alert("There has been an error." + error);
    })
  }
}])


app.controller('NavCtrl',[
  '$scope',
  '$state',
  'auth',
  '$rootScope',
  function($scope,$state, auth, $rootScope){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = function(){
      auth.logOut();
      if(!auth.isLoggedIn()){
          $state.go('home');
      }
    }
  }])




//Configuring the routes
  app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
        $state.go('main');
      }
    }]
    })
    .state('main',{
      url: '/main',
      templateUrl: 'main.html',
      controller: 'MainCtrl',
      onEnter:['$state','auth',function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('profile',{
      url:'/profile',
      templateUrl:'profile.html',
      controller: 'ProfileCtrl',
      onEnter: ['$state','auth',function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('workout',{
      url:'/outlet/:id',
      templateUrl:'outlet.html',
      controller: 'WorkoutCtrl'
    })

  $urlRouterProvider.otherwise('home');
}]);
