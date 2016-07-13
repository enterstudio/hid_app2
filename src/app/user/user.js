var userServices = angular.module('userServices', ['ngResource']);

userServices.factory('User', ['$resource', 'config',
  function($resource, config){
    return $resource(config.apiUrl + 'users/:userId', {userId: '@id'});
  }
]);

var userControllers = angular.module('userControllers', []);

userControllers.controller('UserCtrl', ['$scope', '$routeParams', '$http', '$window', 'alertService', 'md5', 'config', 'User', 'List', function($scope, $routeParams, $http, $window, alertService, md5, config, User, List) {
  $scope.newEmail = {
    type: '',
    email: ''
  };
  $scope.newPhoneNumber = {
    type: '',
    number: ''
  };
  $scope.newLocation = {
    location: {
      id: '',
      name: ''
    }
  };

  $scope.gravatarUrl = '';

  $scope.canEditUser = $routeParams.userId == $scope.currentUser.id;

  $scope.user = User.get({userId: $routeParams.userId}, function(user) {
    var userEmail = md5.createHash(user.email.trim().toLowerCase());
    $scope.gravatarUrl = 'https://secure.gravatar.com/avatar/' + userEmail + '?s=200';
  });

  $scope.countries = [];
  $http.get('https://www.humanitarianresponse.info/hid/locations/countries').then(
    function (response) {
      for (var key in response.data) {
        $scope.countries.push({
          'id': key,
          'name': response.data[key]
        });
      }
    }
  );

  $scope.regions = [];
  $scope.setRegions = function ($item, $model) {
    $scope.regions = [];
    $http.get('https://www.humanitarianresponse.info/hid/locations/' + $item.id).then(
      function (response) {
        for (var key in response.data.regions) {
          $scope.regions.push({
            'id': key,
            'name': response.data.regions[key].name
          });
        }
      }
    );
  };

  $scope.addItem = function (key) {
    if (!$scope.user[key]) {
      $scope.user[key] = [];
    }
    switch (key) {
      case 'websites':
        $scope.user[key].unshift({url: ''});
        break;
      case 'voips':
        $scope.user[key].unshift({ type: 'Skype', username: '' });
        break;
      case 'phone_numbers':
        $scope.user[key].unshift($scope.newPhoneNumber);
        break;
      case 'emails':
        $scope.user[key].unshift($scope.newEmail);
        break;
      case 'locations':
        $scope.user[key].unshift({country: '', region: ''});
        break;
      case 'job_titles':
        $scope.user[key].unshift('');
        break;
      case 'organizations':
        $scope.user[key].unshift({id: '', name: ''});
        break;
    }
  };

  $scope.dropItem = function (key, index ){
    $scope.user[key].splice(index, 1);
  };

  var hrinfoResponse = function (response) {
    var out = [];
    angular.forEach(response.data.data, function (value, key) {
      this.push({
        id: key,
        name: value
      });
    }, out);
    return out;
  };

  $scope.getOrganization = function(val) {
    return $http.get('https://www.humanitarianresponse.info/en/api/v1/organizations?autocomplete[string]=' + val + '&autocomplete[operator]=STARTS_WITH')
      .then(hrinfoResponse);
  };

  $scope.getDisasters = function(val) {
    return $http.get('https://www.humanitarianresponse.info/en/api/v1.0/disasters?autocomplete[string]=' + val + '&autocomplete[operator]=STARTS_WITH')
      .then(hrinfoResponse);
  };

  $scope.getLists = function (val) {
    return $http.get(config.apiUrl + 'lists', { params: { where: { name: { contains: val } } } })
      .then(function (response) {
        return response.data;
      });
  };

  $scope.getLocations = function (val) {
    return $http.get('https://www.humanitarianresponse.info/en/api/v1.0/locations?autocomplete[string]=' + val + '&autocomplete[operator]=STARTS_WITH')
      .then(hrinfoResponse);
  };

  $scope.getCountries = function () {
    return $http.get('https://www.humanitarianresponse.info/hid/locations/countries')
      .then(hrinfoResponse);
  };

  $scope.phoneNumberTypes = [
    {value: 'Landline', name: 'Landline'},
    {value: 'Mobile', name: 'Mobile'}
  ];

  $scope.emailTypes = [
    {value: 'Work', name: 'Work'},
    {value: 'Personal', name: 'Personal'}
  ];

  $scope.voipTypes = [
    {value: 'Skype', name: 'Skype'},
    {value: 'Google', name: 'Google'}
  ];

  $scope.saveUser = function() {
    $scope.user.$save(function (user, response) {
      //  Update the currentUser item in localStorage if the current user is the one being saved
      if (user.id == $scope.currentUser.id) {
        $window.localStorage.setItem('currentUser', JSON.stringify(response.data));
      }
    });
  };

  $scope.setOrganization = function (data, index) {
    $scope.user.organizations[index] = data;
  };

}]);

userControllers.controller('UserNewCtrl', ['$scope', '$location', 'alertService', 'User', function ($scope, $location, alertService, User) {
  $scope.user = new User();

  $scope.userCreate = function() {
    $scope.user.$save(function(user) {
      alertService.add('success', 'Thank you, your registration is now complete. You will soon receive a confirmation email.');
      //$location.path('/settings' + $scope.user.id);
    }, function (resp) {
      alertService.add('danger', 'There was an error processing your registration.');
    });
  };
}]);

userControllers.controller('UsersCtrl', ['$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
  $scope.request = $routeParams;
  $scope.users = User.query($routeParams);
}]);

userControllers.controller('CheckInCtrl', ['$scope', 'User', function ($scope, User) {
  $scope.status = 'responding';
}]);
