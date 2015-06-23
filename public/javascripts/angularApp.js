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

	//the controllers
app.controller('MainCtrl',[
	'$scope', '$state', 'auth',
	function( $scope){	
		//define here the variables used in the main state or say main app page
	}
])

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

app.controller('NavCtrl',[
  '$scope',
  '$state',
  'auth',
  function($scope,$state, auth){
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
    });

  $urlRouterProvider.otherwise('home');
}]);
