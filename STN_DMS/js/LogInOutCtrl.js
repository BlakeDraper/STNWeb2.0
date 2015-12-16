﻿(function () {
    'use strict';

    var LogInOutController = angular.module('LogInOutController', []);

    LogInOutController.controller('LoginCtrl', ['$scope', '$state', '$location', '$uibModal', '$http', '$cookies', '$rootScope', 'Login', LoginCtrl]);
    function LoginCtrl($scope, $state, $location, $uibModal, $http, $cookies, $rootScope, Login) {
        //login //
        //#region CAP lock Check
        $('[type=password]').keypress(function (e) {
            var $password = $(this),
                tooltipVisible = $('.tooltip').is(':visible'),
                s = String.fromCharCode(e.which);

            if (s.toUpperCase() === s && s.toLowerCase() !== s && !e.shiftKey) {
                if (!tooltipVisible)
                    $password.tooltip('show');
            } else {
                if (tooltipVisible)
                    $password.tooltip('hide');
            }

            //hide the tooltip when moving away from password field
            $password.blur(function (e) {
                $password.tooltip('hide');
            });
        });
        //#endregion CAP lock Check
        $scope.submit = function () {
            //$scope.sub = true;
            var postData = {
                "username": $scope.username,
                "password": $scope.password
            };
            var up = $scope.username + ":" + $scope.password;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + btoa(up);
            $http.defaults.headers.common['Accept'] = 'application/json';

            Login.login({}, postData,
                function success(response) {
                    var user = response;
                    if (user != undefined) {
                        //set user cookies (cred, username, name, role
                        var usersNAME = user.FNAME + " " + user.LNAME;
                        var enc = btoa($scope.username.concat(":", $scope.password));
                        $cookies.put('STNCreds', enc);
                        $cookies.put('STNUsername', $scope.username);
                        $cookies.put('usersName', usersNAME);
                        $cookies.put('mID', user.MEMBER_ID);
                        var roleName;
                        switch (user.ROLE_ID) {
                            case 1:
                                roleName = "Admin";
                                break;
                            case 2:
                                roleName = "Manager";
                                break;
                            case 3:
                                roleName = "Field";
                                break;
                            case 4:
                                roleName = "Public";
                                break;
                            default:
                                roleName = "CitizenManager";
                                break;
                        }
                        $cookies.put('usersRole', roleName);

                        $rootScope.isAuth.val = true;
                        $rootScope.usersName = usersNAME;
                        $rootScope.userID = user.MEMBER_ID;
                        $state.go('home');
                    }
                    else {
                        $scope.error = "Login Failed";
                    }
                },
                function error(errorResponse) {
                    //modal for error
                    var modalInstance = $uibModal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                   '<div class="modal-body"><p>Something went wrong.</p><p>Error: {{status}} - {{statusText}}</p></div>' +
                                   '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.ok = function () {
                                $uibModalInstance.close();
                            }
                            $scope.status = errorResponse.status;
                            $scope.statusText = errorResponse.statusText;
                        },
                        size: 'sm'
                    });
                    modalInstance.result.then(function (fieldFocus) {
                        $location.path('/login');
                    });
                }
            );
        };
    }
    //logOut
    LogInOutController.controller('LogoutCtrl', ['$scope', '$rootScope', '$cookies', '$location', LogoutCtrl]);
    function LogoutCtrl($scope, $rootScope, $cookies, $location) {
        $scope.logout = function () {
            $cookies.remove('STNCreds');
            $cookies.remove('STNUsername');
            $cookies.remove('usersName');
            $cookies.remove('usersRole');
            $cookies.remove('mID');
            $cookies.remove('SessionEventID');
            $cookies.remove('SessionEventName');
            $rootScope.thisPage = "";
            $location.path('/login');
        };
    }



}());
