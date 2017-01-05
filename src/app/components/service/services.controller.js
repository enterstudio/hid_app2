(function () {
  'use strict';

  angular
    .module('app.service')
    .controller('ServicesCtrl', ServicesCtrl);

  ServicesCtrl.$inject = ['$scope', '$routeParams', 'Service'];

  function ServicesCtrl ($scope, $routeParams, Service) {
    $scope.request = $routeParams;
    $scope.totalItems = 0;
    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;
    $scope.request.limit = $scope.itemsPerPage;
    $scope.request.offset = 0;
    $scope.request.sort = 'name';

    var setTotalServices = function (clients, headers) {
      $scope.totalItems = headers()["x-total-count"];
    };

    $scope.services = Service.query($scope.request, setTotalServices);
  }
})();