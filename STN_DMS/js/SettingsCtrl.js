(function () {
    'use strict';

    var SettingsControllers = angular.module('SettingsControllers',
        ['ngInputModified',  'ui.validate', 'angular.filter', 'xeditable', 'checklist-model', 'ngFileUpload']);


    //#region Settings Controller
    //#region settings (abstract)
    SettingsControllers.controller('SettingsCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', SettingsCtrl]);
    function SettingsCtrl($scope, $rootScope, $cookies, $location, $state) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $rootScope.thisPage = "Settings";
            $rootScope.activeMenu = "settings";
            $scope.settings = "Welcome to the new STN Settings Page!!";
            $scope.changeView = function (view) {
                $state.go(view);
            };
        }
    }
    //#endregion settings (abstract)

    //#region Members inside Settings Tab
    //#region member Controller (abstract)
    SettingsControllers.controller('memberCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$http', '$filter', 'MEMBER', 'allRoles', 'allAgencies', memberCtrl]);
    function memberCtrl($scope, $rootScope, $cookies, $location, $http, $filter, MEMBER, allRoles, allAgencies) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //all things both new and existing member page will need
            $rootScope.thisPage = "Settings/Members";
            // change sorting order
            $scope.sort_by = function (newSortingOrder) {
                if ($scope.sortingOrder == newSortingOrder) {
                    $scope.reverse = !$scope.reverse;
                }
                $scope.sortingOrder = newSortingOrder;
                // icon setup
                $('th i').each(function () {
                    // icon reset
                    $(this).removeClass().addClass('glyphicon glyphicon-sort');
                });
                if ($scope.reverse) {
                    $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                } else {
                    $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                }
            };

            $scope.loggedInUser = {};
            $scope.loggedInUser.Name = $cookies.get('usersName'); //User's NAME
            $scope.loggedInUser.ID = $cookies.get('mID');
            $scope.loggedInUser.Role = $cookies.get('usersRole');

            $scope.roleList = allRoles;
            $scope.agencyList = allAgencies;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
            $http.defaults.headers.common['Accept'] = 'application/json';
            MEMBER.getAll().$promise.then(function (response) {
                $scope.memberList = [];
                for (var x = 0; x < response.length; x++) {
                    var M = {};
                    M.MEMBER_ID = response[x].MEMBER_ID;
                    M.Name = response[x].FNAME + " " + response[x].LNAME;
                    var ag = $scope.agencyList.filter(function (a) { return a.AGENCY_ID == response[x].AGENCY_ID; })[0];
                    var ro = $scope.roleList.filter(function (r) { return r.ROLE_ID == response[x].ROLE_ID; })[0];
                    M.Agency = ag.AGENCY_NAME;
                    M.Role = ro.ROLE_NAME;

                    $scope.memberList.push(M);
                }
            });
        }
    }
    //#endregion  member Controller (abstract)

    //#region memberInfo Controller
    SettingsControllers.controller('memberInfoCtrl', ['$scope', '$cookies', '$location', '$http', '$modal', '$stateParams', '$filter', 'MEMBER', 'thisMember', memberInfoCtrl]);
    function memberInfoCtrl($scope, $cookies, $location, $http, $modal, $stateParams, $filter, MEMBER, thisMember) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //all things both new and existing member page will need

            $scope.aMember = {}; //holder for member (either coming in for edit, or being created for post
            $scope.matchingUsers = true;

            //#region DELETE Member click
            $scope.DeleteMember = function (mem) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return mem;
                        },
                        what: function () {
                            return "Member";
                        }
                    }
                });
                modalInstance.result.then(function (nameToRemove) {
                    //yes, remove this keyword
                    var test;
                    //DELETE it
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');

                    MEMBER.deleteMember({ id: nameToRemove.MEMBER_ID }, function success(response) {
                        var delMem = {};
                        delMem.MEMBER_ID = nameToRemove.MEMBER_ID;
                        delMem.Name = nameToRemove.FNAME + " " + nameToRemove.LNAME;
                        var ag = $scope.agencyList.filter(function (a) { return a.AGENCY_ID == nameToRemove.AGENCY_ID; })[0];
                        var ro = $scope.roleList.filter(function (r) { return r.ROLE_ID == nameToRemove.ROLE_ID; })[0];
                        delMem.Agency = ag.AGENCY_NAME;
                        delMem.Role = ro.ROLE_NAME;
                        $scope.memberList.splice($scope.memberList.indexOf(delMem), 1);
                        toastr.success("Member Deleted");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        $location.path('/Members/MembersList').replace();
                    });
                });
                //end modal
            };
            //#endregion DELETE Member click

            $scope.pass = {
                newP: '',
                confirmP: ''
            };
            $scope.newPass = "";

            //is this creating new member or editing existing?
            if (thisMember != undefined) {

                //check to see if the acct User is the same as the user they are looking at
                $scope.matchingUsers = $stateParams.id == $scope.loggedInUser.ID ? true : false;

                $scope.aMember = thisMember;
                $scope.aMember.Role = $scope.roleList.filter(function (r) { return r.ROLE_ID == $scope.aMember.ROLE_ID; })[0].ROLE_NAME;
                $scope.changePass = false;

                //change to the user made, put it .. fired on each blur after change made to field
                $scope.SaveOnBlur = function () {
                    if ($scope.aMember) {
                        //ensure they don't delete required field values
                        if ($scope.aMember.FNAME != null) {
                            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                            $http.defaults.headers.common['Accept'] = 'application/json';
                            MEMBER.update({ id: $scope.aMember.MEMBER_ID }, $scope.aMember, function success(response) {
                                toastr.success("Member Updated");
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            });
                        }
                    }
                };//end SaveOnBlur

                //password update section
                $scope.changeMyPassBtn = function (evt) {
                    $scope.changePass == false ? $scope.changePass = true : $scope.changePass = false;
                };

                $scope.ChangePassword = function () {
                    //change User's password
                    if ($scope.pass.newP == "" || $scope.pass.confirmP == "") {
                        alert("You must first enter a new password");
                    } else {
                        MEMBER.changePW({ username: $scope.aMember.USERNAME, newPass: $scope.pass.newP },
                            function success(response) {
                                toastr.success("Password Updated");
                                //update creds ONLY IF user logged in is == this updating member
                                if ($scope.aMember.MEMBER_ID == $scope.loggedInUser.MEMBER_ID) {
                                    var enc = btoa($scope.aMember.USERNAME.concat(":", $scope.pass.newP));
                                    $cookies.put('STNCreds', enc);
                                    $cookies.put('STNUsername', $scope.aMember.USERNAME);
                                    $cookies.put('usersName', $scope.loggedInUser.Name);
                                    $cookies.put('mID', $scope.aMember.MEMBER_ID);
                                    var roleName;
                                    switch ($scope.aMember.ROLE_ID) {
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
                                }
                                $scope.changePass = false;
                                $scope.pass.newP = '';
                                $scope.pass.confirmP = '';
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                };

                $scope.DontChangePass = function () {
                    //nevermind,  clear input
                    $scope.changePass = false;
                };
            } //end of $stateParams > 0 (existing)
            else {
                //this is a new member being created
                $scope.save = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                        $http.defaults.headers.common['Accept'] = 'application/json';

                        MEMBER.addMember({ pass: $scope.pass.confirmP }, $scope.aMember, function success(response) {
                            toastr.success("Member Created");
                            //push this new member into the memberList
                            var nm = {};
                            nm.MEMBER_ID = response.MEMBER_ID;
                            nm.Name = response.FNAME + " " + response.LNAME;
                            var ag = $scope.agencyList.filter(function (a) { return a.AGENCY_ID == response.AGENCY_ID; })[0];
                            var ro = $scope.roleList.filter(function (r) { return r.ROLE_ID == response.ROLE_ID; })[0];
                            nm.Agency = ag.AGENCY_NAME;
                            nm.Role = ro.ROLE_NAME;
                            $scope.memberList.push(nm);
                        }).$promise.then(function () {
                            $location.path('/Members/MembersList').replace();
                        });

                    }
                };
            }
        }
    }
    //#endregion memberInfo Controller
    //#endregion Members inside Settings Tab

    //#region events inside Settings Tab
    //#region event Controller (abstract)
    SettingsControllers.controller('eventCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$http', '$filter', 'MEMBER', 'allEvents', 'allEventTypes', 'allEventStats', eventCtrl]);
    function eventCtrl($scope, $rootScope, $cookies, $location, $http, $filter, MEMBER, allEvents, allEventTypes, allEventStats) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $rootScope.thisPage = "Settings/Events";
            $scope.loggedInRole = $cookies.get('usersRole');
            $scope.isAdmin = $scope.loggedInRole == "Admin" ? true : false;

            // change sorting order
            $scope.sort_by = function (newSortingOrder) {
                if ($scope.sortingOrder == newSortingOrder) {
                    $scope.reverse = !$scope.reverse;
                }
                $scope.sortingOrder = newSortingOrder;
                // icon setup
                $('th i').each(function () {
                    // icon reset
                    $(this).removeClass().addClass('glyphicon glyphicon-sort');
                });
                if ($scope.reverse) {
                    $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                } else {
                    $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                }
            };

            $scope.eventTypeList = allEventTypes;
            $scope.eventStatList = allEventStats;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
            $http.defaults.headers.common['Accept'] = 'application/json';
            MEMBER.getRoleMembers({ roleId: 1 }).$promise.then(function (response) {
                $scope.eventCoordList = response;
                $scope.eventList = [];
                for (var x = 0; x < allEvents.length; x++) {
                    var E = {};
                    E.EVENT_ID = allEvents[x].EVENT_ID;
                    E.Name = allEvents[x].EVENT_NAME;
                    E.Type = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == allEvents[x].EVENT_TYPE_ID; })[0].TYPE;
                    E.Status = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == allEvents[x].EVENT_STATUS_ID; })[0].STATUS;
                    var coord = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == allEvents[x].EVENT_COORDINATOR; })[0];
                    E.StartDate = allEvents[x].EVENT_START_DATE;
                    E.EndDate = allEvents[x].EVENT_END_DATE;
                    E.Coord = coord != undefined ? coord.FNAME + " " + coord.LNAME : "";

                    $scope.eventList.push(E);
                }
            });
        }
    }
    //#endregion  event Controller (abstract)

    //#region eventInfo Controller
    SettingsControllers.controller('eventInfoCtrl', ['$scope', '$cookies', '$location', '$http', '$modal', '$filter', 'EVENT', 'thisEvent', eventInfoCtrl]);
    function eventInfoCtrl($scope, $cookies, $location, $http, $modal, $filter, EVENT, thisEvent) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //all things both new and existing events page will need

            //#region Datepicker
            $scope.datepickrs = {
                //projStDate: false,
                //projEndDate: false
            };
            $scope.open = function ($event, which) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.datepickrs[which] = true;
            };
            //$scope.format = 'MMM dd, yyyy';
            //#endregion Datepicker

            $scope.anEvent = {};

            //#region DELETE Event click
            $scope.DeleteEvent = function (ev) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return ev;
                        },
                        what: function () {
                            return "Event";
                        }
                    }
                });
                modalInstance.result.then(function (nameToRemove) {
                    //yes, remove this keyword
                    var test;
                    //DELETE it
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');

                    EVENT.delete({ id: nameToRemove.EVENT_ID }, function success(response) {
                        var delEv = {};
                        delEv.EVENT_ID = nameToRemove.EVENT_ID;
                        delEv.Name = nameToRemove.EVENT_NAME;
                        delEv.Type = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == nameToRemove.EVENT_TYPE_ID; })[0].TYPE;
                        delEv.Status = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == nameToRemove.EVENT_STATUS_ID; })[0].STATUS;
                        var coord = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == nameToRemove.EVENT_COORDINATOR; })[0];
                        delEv.StartDate = nameToRemove.EVENT_START_DATE;
                        delEv.EndDate = nameToRemove.EVENT_END_DATE;
                        delEv.Coord = coord != undefined ? coord.FNAME + " " + coord.LNAME : "";
                        var index = 0;
                        for (var i = 0; i < $scope.eventList.length; i++) {
                            if ($scope.eventList[i].EVENT_ID == delEv.EVENT_ID) {
                                index = i;
                                i = $scope.eventList.length;
                            }
                        }
                        $scope.eventList.splice(index, 1);
                        toastr.success("Event Deleted");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        $location.path('/Events/EventsList').replace();
                    });
                });
                //end modal
            };
            //#endregion DELETE Event click

            if (thisEvent != undefined) {
                $scope.anEvent = thisEvent;
                $scope.thisEventType = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == thisEvent.EVENT_TYPE_ID; })[0].TYPE;
                $scope.thisEventStatus = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == thisEvent.EVENT_STATUS_ID; })[0].STATUS;
                var EC = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == thisEvent.EVENT_COORDINATOR; })[0];
                $scope.thisEventCoord = EC != undefined ? EC.FNAME + " " + EC.LNAME : "";

                //change to the user made, put it .. fired on each blur after change made to field
                $scope.SaveOnBlur = function () {
                    if ($scope.anEvent) {
                        //ensure they don't delete required field values
                        if ($scope.anEvent.EVENT_NAME != null) {
                            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                            $http.defaults.headers.common['Accept'] = 'application/json';
                            EVENT.update({ id: $scope.anEvent.EVENT_ID }, $scope.anEvent, function success(response) {
                                toastr.success("Event Updated");
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            });
                        }
                    }
                };//end SaveOnBlur

            }//end if thisEvent != null
            else {
                //this is a new event being created
                $scope.save = function (valid) {
                    if (valid) {
                        EVENT.save($scope.anEvent, function success(response) {
                            toastr.success("Event Created");
                            //push this new event into the eventList
                            var E = {};
                            E.EVENT_ID = response.EVENT_ID;
                            E.Name = response.EVENT_NAME;
                            E.Type = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == response.EVENT_TYPE_ID; })[0].TYPE;
                            E.Status = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == response.EVENT_STATUS_ID; })[0].STATUS;
                            var coord = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == response.EVENT_COORDINATOR; })[0];
                            E.StartDate = response.EVENT_START_DATE;
                            E.EndDate = response.EVENT_END_DATE;
                            E.Coord = coord != undefined ? coord.FNAME + " " + coord.LNAME : "";
                            $scope.eventList.push(E);
                        }).$promise.then(function () {
                            $location.path('/Events/EventsList').replace();
                        });

                    }
                };//end $scope.save()
            }//end else (anEvent == undefined -new
        }//end else (checkCreds())
    }
    //#endregion eventInfo Controller
    //#endregion events inside Settings Tab

    //#region resource Controller (abstract)
    SettingsControllers.controller('resourcesCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', '$http', '$filter', '$modal', 'AGENCY', 'CONTACT_TYPE', 'DEPLOYMENT_PRIORITY', 'EVENT_STATUS',
        'EVENT_TYPE', 'FILE_TYPE', 'HORIZONTAL_COLL_METHODS', 'HORIZONTAL_DATUM', 'HOUSING_TYPE', 'HWM_QUALITY', 'HWM_TYPE', 'INST_COLL_CONDITION', 'MARKER', 'NETWORK_NAME', 'OP_QUALITY',
        'OP_TYPE', 'SENSOR_BRAND', 'DEPLOYMENT_TYPE', 'SENSOR_TYPE', 'NETWORK_TYPE', 'STATUS_TYPE', 'VERTICAL_COLL_METHOD', 'VERTICAL_DATUM', 'allStates', 'allAgencies', 'allContactTypes', 'allDeployPriorities', 'allEventStats', 'allEventTypes',
        'allFileTypes', 'allHorCollMethods', 'allHorDatums', 'allHouseTypes', 'allHWMqualities', 'allHWMtypes', 'allInstCollectConditions', 'allMarkers', 'allNetworkNames', 'allObjPtQualities',
        'allObjPtTypes', 'allSensorBrands', 'allDeploymentTypes', 'allStatusTypes', 'allSensorTypes', 'allNetworkTypes', 'allVerticalCollMethods', 'allVerticalDatums', resourcesCtrl]);
    function resourcesCtrl($scope, $rootScope, $cookies, $location, $state, $http, $filter, $modal, AGENCY, CONTACT_TYPE, DEPLOYMENT_PRIORITY, EVENT_STATUS,
        EVENT_TYPE, FILE_TYPE, HORIZONTAL_COLL_METHODS, HORIZONTAL_DATUM, HOUSING_TYPE, HWM_QUALITY, HWM_TYPE, INST_COLL_CONDITION, MARKER, NETWORK_NAME, OP_QUALITY,
        OP_TYPE, SENSOR_BRAND, DEPLOYMENT_TYPE, SENSOR_TYPE, NETWORK_TYPE, STATUS_TYPE, VERTICAL_COLL_METHOD, VERTICAL_DATUM, allStates, allAgencies, allContactTypes, allDeployPriorities, allEventStats, allEventTypes, allFileTypes,
        allHorCollMethods, allHorDatums, allHouseTypes, allHWMqualities, allHWMtypes, allInstCollectConditions, allMarkers, allNetworkNames, allObjPtQualities, allObjPtTypes,
        allSensorBrands, allDeploymentTypes, allStatusTypes, allSensorTypes, allNetworkTypes, allVerticalCollMethods, allVerticalDatums) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $rootScope.thisPage = "Settings/Resources";
            $scope.accountRole = $cookies.get('usersRole');
            // change sorting order
            $scope.sort_by = function (newSortingOrder) {
                if ($scope.sortingOrder == newSortingOrder) {
                    $scope.reverse = !$scope.reverse;
                }
                $scope.sortingOrder = newSortingOrder;
                // icon setup
                $('th i').each(function () {
                    // icon reset
                    $(this).removeClass().addClass('glyphicon glyphicon-sort');
                });
                if ($scope.reverse) {
                    $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                } else {
                    $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                }
            };
            $scope.lookupForm = {};
            $scope.showAddAgForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addAgButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.activeMenu = ''; //scope for active sidebar item click
            $scope.stateList = allStates;

            //#region ALL LOOKUPS (add/update/delete)
            //#region Agency Add/Update/Delete
            $scope.agencyList = allAgencies; //Ag
            $scope.showAddAgForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addAgButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newAg = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddAgClicked = function () {
                $scope.showAddAgForm = true; //show the form
                $scope.addAgButtonShowing = false; //hide button                
            };
            $scope.NeverMindAg = function () {
                $scope.newAg = {};
                $scope.showAddAgForm = false; //hide the form
                $scope.addAgButtonShowing = true; //show button   

            };

            $scope.AddAgency = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    AGENCY.save($scope.newAg, function success(response) {
                        $scope.agencyList.push(response);
                        $scope.newAg = {};
                        $scope.showAddAgForm = false; //hide the form
                        $scope.addAgButtonShowing = true; //show the button again
                        toastr.success("Agency Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveAgency = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                AGENCY.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Agency Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteAgency = function (ag) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return ag;
                        },
                        what: function () {
                            return "Agency";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.agencyList.indexOf(ag);
                    //DELETE it
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    AGENCY.delete({ id: ag.AGENCY_ID }, ag, function success(response) {
                        $scope.agencyList.splice(index, 1);
                        toastr.success("Agency Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });
                //end modal
            };
            $scope.showStateAbbrev = function (a) {
                var selected = [];
                if (a.STATE) {
                    selected = $filter('filter')($scope.stateList, { STATE_ABBREV: a.STATE });
                }
                return selected.length ? selected[0].STATE_ABBREV : '';
            };
            //#endregion Agency Add/Update/Delete

            //#region ContactType Add/Update/Delete
            $scope.contactTypeList = allContactTypes; //ct
            $scope.showAddCTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addCTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newCT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddCTClicked = function () {
                $scope.showAddCTForm = true; //show the form
                $scope.addCTButtonShowing = false; //hide button                
            };
            $scope.NeverMindCT = function () {
                $scope.newCT = {};
                $scope.showAddCTForm = false; //hide the form
                $scope.addCTButtonShowing = true; //show button   

            };

            $scope.AddContactType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    CONTACT_TYPE.save($scope.newCT, function success(response) {
                        $scope.contactTypeList.push(response);
                        $scope.newCT = {};
                        $scope.showAddCTForm = false; //hide the form
                        $scope.addCTButtonShowing = true; //show the button again
                        toastr.success("Contact Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };

            $scope.saveContactType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                CONTACT_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Contact Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };

            $scope.deleteContactType = function (ct) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return ct;
                        },
                        what: function () {
                            return "Contact Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.contactTypeList.indexOf(ct);
                    //DELETE it
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    CONTACT_TYPE.delete({ id: ct.CONTACT_TYPE_ID }, ct, function success(response) {
                        $scope.contactTypeList.splice(index, 1);
                        toastr.success("Contact Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion ContactType Add/Update/Delete

            //#region deploymentPriority Add/Update/Delete
            $scope.deployPriorityList = allDeployPriorities; //dp
            $scope.showAddDPForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addDPButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newDP = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddDPClicked = function () {
                $scope.showAddDPForm = true; //show the form
                $scope.addDPButtonShowing = false; //hide button                
            };
            $scope.NeverMindDP = function () {
                $scope.newDP = {};
                $scope.showAddDPForm = false; //hide the form
                $scope.addDPButtonShowing = true; //show button   

            };
            $scope.AddDepPriority = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    DEPLOYMENT_PRIORITY.save($scope.newDP, function success(response) {
                        $scope.deployPriorityList.push(response);
                        $scope.newDP = {};
                        $scope.showAddDPForm = false; //hide the form
                        $scope.addDPButtonShowing = true; //show the button again
                        toastr.success("Deployment Priority Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveDepPriority = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                DEPLOYMENT_PRIORITY.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Deployment Priority Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteDepPriority = function (dp) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return dp;
                        },
                        what: function () {
                            return "Deployment Priority";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.deployPriorityList.indexOf(dp);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    DEPLOYMENT_PRIORITY.delete({ id: dp.PRIORITY_ID }, dp, function success(response) {
                        $scope.deployPriorityList.splice(index, 1);
                        toastr.success("Deployment Priority Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion deploymentPriority Add/Update/Delete

            //#region eventStatus Add/Update/Delete
            $scope.eventStatList = allEventStats; //es
            $scope.showAddESForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addESButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newES = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddESClicked = function () {
                $scope.showAddESForm = true; //show the form
                $scope.addESButtonShowing = false; //hide button                
            };
            $scope.NeverMindES = function () {
                $scope.newES = {};
                $scope.showAddESForm = false; //hide the form
                $scope.addESButtonShowing = true; //show button   

            };
            $scope.AddEventStat = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    EVENT_STATUS.save($scope.newES, function success(response) {
                        $scope.eventStatList.push(response);
                        $scope.newES = {};
                        $scope.showAddESForm = false; //hide the form
                        $scope.addESButtonShowing = true; //show the button again
                        toastr.success("Event Status Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveEventStat = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                EVENT_STATUS.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Event Status Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteEventStat = function (es) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return es;
                        },
                        what: function () {
                            return "Event Status";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.eventStatList.indexOf(es);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    EVENT_STATUS.delete({ id: es.EVENT_STATUS_ID }, es, function success(response) {
                        $scope.eventStatList.splice(index, 1);
                        toastr.success("Event Status Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion eventStatus Add/Update/Delete

            //#region EventType Add/Update/Delete
            $scope.eventTypeList = allEventTypes; //et
            $scope.showAddETForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addETButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newET = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddETClicked = function () {
                $scope.showAddETForm = true; //show the form
                $scope.addETButtonShowing = false; //hide button                
            };
            $scope.NeverMindET = function () {
                $scope.newET = {};
                $scope.showAddETForm = false; //hide the form
                $scope.addETButtonShowing = true; //show button   

            };

            $scope.AddEventType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    EVENT_TYPE.save($scope.newET, function success(response) {
                        $scope.eventTypeList.push(response);
                        $scope.newET = {};
                        $scope.showAddETForm = false; //hide the form
                        $scope.addETButtonShowing = true; //show the button again
                        toastr.success("Event Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };

            $scope.saveEventType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                EVENT_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Event Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };

            $scope.deleteEventType = function (et) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return et;
                        },
                        what: function () {
                            return "Event Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.eventTypeList.indexOf(et);
                    //DELETE it
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    EVENT_TYPE.delete({ id: et.EVENT_TYPE_ID }, et, function success(response) {
                        $scope.eventTypeList.splice(index, 1);
                        toastr.success("Event Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion EventType Add/Update/Delete

            //#region fileType Add/Update/Delete
            $scope.fileTypeList = allFileTypes; //ft
            $scope.showAddFTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addFTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newFT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddFTClicked = function () {
                $scope.showAddFTForm = true; //show the form
                $scope.addFTButtonShowing = false; //hide button                
            };
            $scope.NeverMindFT = function () {
                $scope.newFT = {};
                $scope.showAddFTForm = false; //hide the form
                $scope.addFTButtonShowing = true; //show button   

            };
            $scope.AddFileType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    FILE_TYPE.save($scope.newFT, function success(response) {
                        $scope.fileTypeList.push(response);
                        $scope.newFT = {};
                        $scope.showAddFTForm = false; //hide the form
                        $scope.addFTButtonShowing = true; //show the button again
                        toastr.success("File Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveFileType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                FILE_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("File Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteFileType = function (ft) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return ft;
                        },
                        what: function () {
                            return "File Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.fileTypeList.indexOf(ft);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    FILE_TYPE.delete({ id: ft.FILETYPE_ID }, ft, function success(response) {
                        $scope.fileTypeList.splice(index, 1);
                        toastr.success("File Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion fileType Add/Update/Delete

            //#region HorCollMethods Add/Update/Delete
            $scope.horColMethList = allHorCollMethods; //hcm
            $scope.showAddHCMForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addHCMButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newHCM = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddHCMClicked = function () {
                $scope.showAddHCMForm = true; //show the form
                $scope.addHCMButtonShowing = false; //hide button                
            };
            $scope.NeverMindHCM = function () {
                $scope.newHCM = {};
                $scope.showAddHCMForm = false; //hide the form
                $scope.addHCMButtonShowing = true; //show button   

            };
            $scope.AddHorCollMethod = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    HORIZONTAL_COLL_METHODS.save($scope.newHCM, function success(response) {
                        $scope.horColMethList.push(response);
                        $scope.newHCM = {};
                        $scope.showAddHCMForm = false; //hide the form
                        $scope.addHCMButtonShowing = true; //show the button again
                        toastr.success("Horizontal Collection Method Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveHorCollMethod = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                HORIZONTAL_COLL_METHODS.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Horizontal Collection Method Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteHorCollMethod = function (hcm) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return hcm;
                        },
                        what: function () {
                            return "Horizontal Collection Method";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.horColMethList.indexOf(hcm);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    HORIZONTAL_COLL_METHODS.delete({ id: hcm.HCOLLECT_METHOD_ID }, hcm, function success(response) {
                        $scope.horColMethList.splice(index, 1);
                        toastr.success("Horizontal Collection Method Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion HorCollMethods Add/Update/Delete

            //#region HorDatum Add/Update/Delete
            $scope.horDatList = allHorDatums; //hd
            $scope.showAddHDForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addHDButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newHD = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddHDClicked = function () {
                $scope.showAddHDForm = true; //show the form
                $scope.addHDButtonShowing = false; //hide button                
            };
            $scope.NeverMindHD = function () {
                $scope.newHD = {};
                $scope.showAddHDForm = false; //hide the form
                $scope.addHDButtonShowing = true; //show button   

            };

            $scope.AddHorDatum = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    HORIZONTAL_DATUM.save($scope.newHD, function success(response) {
                        $scope.horDatList.push(response);
                        $scope.newHD = {};
                        $scope.showAddHDForm = false; //hide the form
                        $scope.addHDButtonShowing = true; //show the button again
                        toastr.success("Horizontal Datum Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };

            $scope.saveHorDatum = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                HORIZONTAL_DATUM.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Horizontal Datum Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };

            $scope.deleteHorDatum = function (hd) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return hd;
                        },
                        what: function () {
                            return "Horizontal Datum";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.horDatList.indexOf(hd);
                    //DELETE it
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    HORIZONTAL_DATUM.delete({ id: hd.DATUM_ID }, hd, function success(response) {
                        $scope.horDatList.splice(index, 1);
                        toastr.success("Horizontal Datum Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion HorDatum Add/Update/Delete

            //#region houseType Add/Update/Delete
            $scope.houseTypeList = allHouseTypes; //ht
            $scope.showAddHTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addHTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newHT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddHTClicked = function () {
                $scope.showAddHTForm = true; //show the form
                $scope.addHTButtonShowing = false; //hide button                
            };
            $scope.NeverMindHT = function () {
                $scope.newHT = {};
                $scope.showAddHTForm = false; //hide the form
                $scope.addHTButtonShowing = true; //show button   

            };
            $scope.AddHouseType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    HOUSING_TYPE.save($scope.newHT, function success(response) {
                        $scope.houseTypeList.push(response);
                        $scope.newHT = {};
                        $scope.showAddHTForm = false; //hide the form
                        $scope.addHTButtonShowing = true; //show the button again
                        toastr.success("Housing Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveHouseType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                HOUSING_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Housing Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteHouseType = function (ht) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return ht;
                        },
                        what: function () {
                            return "Housing Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.houseTypeList.indexOf(ht);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    HOUSING_TYPE.delete({ id: ht.HOUSING_TYPE_ID }, ht, function success(response) {
                        $scope.houseTypeList.splice(index, 1);
                        toastr.success("Housing Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion housingType Add/Update/Delete

            //#region hwmQuality Add/Update/Delete
            $scope.hwmQualList = allHWMqualities; //hwmq
            $scope.showAddHWMQForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addHWMQButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newHWMQ = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddHWMQClicked = function () {
                $scope.showAddHWMQForm = true; //show the form
                $scope.addHWMQButtonShowing = false; //hide button                
            };
            $scope.NeverMindHWMQ = function () {
                $scope.newHWMQ = {};
                $scope.showAddHWMQForm = false; //hide the form
                $scope.addHWMQButtonShowing = true; //show button   

            };
            $scope.AddHwmQuality = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    HWM_QUALITY.save($scope.newHWMQ, function success(response) {
                        $scope.hwmQualList.push(response);
                        $scope.newHWMQ = {};
                        $scope.showAddHWMQForm = false; //hide the form
                        $scope.addHWMQButtonShowing = true; //show the button again
                        toastr.success("HWM Quality Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveHwmQuality = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                HWM_QUALITY.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("HWM Quality Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteHwmQuality = function (hwmq) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return hwmq;
                        },
                        what: function () {
                            return "HWM Quality";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.hwmQualList.indexOf(hwmq);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    HWM_QUALITY.delete({ id: hwmq.HWM_QUALITY_ID }, hwmq, function success(response) {
                        $scope.hwmQualList.splice(index, 1);
                        toastr.success("HWM Quality Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion eventStatus Add/Update/Delete

            //#region HwmType Add/Update/Delete
            $scope.hwmTypeList = allHWMtypes; //hwmt
            $scope.showAddHWMTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addHWMTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newHWMT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddHWMTClicked = function () {
                $scope.showAddHWMTForm = true; //show the form
                $scope.addHWMTButtonShowing = false; //hide button                
            };
            $scope.NeverMindHWMT = function () {
                $scope.newHWMT = {};
                $scope.showAddHWMTForm = false; //hide the form
                $scope.addHWMTButtonShowing = true; //show button   

            };

            $scope.AddHwmType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    HWM_TYPE.save($scope.newHWMT, function success(response) {
                        $scope.hwmTypeList.push(response);
                        $scope.newHWMT = {};
                        $scope.showAddHWMTForm = false; //hide the form
                        $scope.addHWMTButtonShowing = true; //show the button again
                        toastr.success("HWM Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };

            $scope.saveHwmType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                HWM_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("HWM Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };

            $scope.deleteHwmType = function (hwmt) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return hwmt;
                        },
                        what: function () {
                            return "HWM Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.hwmTypeList.indexOf(hwmt);
                    //DELETE it
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    HWM_TYPE.delete({ id: hwmt.HWM_TYPE_ID }, hwmt, function success(response) {
                        $scope.hwmTypeList.splice(index, 1);
                        toastr.success("HWM Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion HwmType Add/Update/Delete

            //#region InstColCond Add/Update/Delete
            $scope.instColCondList = allInstCollectConditions; //icc
            $scope.showAddICCForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addICCButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newICC = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddICCClicked = function () {
                $scope.showAddICCForm = true; //show the form
                $scope.addICCButtonShowing = false; //hide button                
            };
            $scope.NeverMindICC = function () {
                $scope.newICC = {};
                $scope.showAddICCForm = false; //hide the form
                $scope.addICCButtonShowing = true; //show button   

            };
            $scope.AddInstColCond = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    INST_COLL_CONDITION.save($scope.newICC, function success(response) {
                        $scope.instColCondList.push(response);
                        $scope.newICC = {};
                        $scope.showAddICCForm = false; //hide the form
                        $scope.addICCButtonShowing = true; //show the button again
                        toastr.success("Instrument Collection Condition Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveInstColCond = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                INST_COLL_CONDITION.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Instrument Collection Condition Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteInstColCond = function (icc) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return icc;
                        },
                        what: function () {
                            return "Instrument Collection Condition";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.instColCondList.indexOf(icc);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    INST_COLL_CONDITION.delete({ id: icc.ID }, icc, function success(response) {
                        $scope.instColCondList.splice(index, 1);
                        toastr.success("Instrument Collection Condition Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion InstColCond Add/Update/Delete

            //#region Marker Add/Update/Delete
            $scope.markList = allMarkers; //m
            $scope.showAddMForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addMButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newM = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddMClicked = function () {
                $scope.showAddMForm = true; //show the form
                $scope.addMButtonShowing = false; //hide button                
            };
            $scope.NeverMindM = function () {
                $scope.newM = {};
                $scope.showAddMForm = false; //hide the form
                $scope.addMButtonShowing = true; //show button   

            };
            $scope.AddMarker = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    MARKER.save($scope.newM, function success(response) {
                        $scope.markList.push(response);
                        $scope.newM = {};
                        $scope.showAddMForm = false; //hide the form
                        $scope.addMButtonShowing = true; //show the button again
                        toastr.success("Marker Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveMarker = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                MARKER.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Marker Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteMarker = function (m) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return m;
                        },
                        what: function () {
                            return "Marker";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.markList.indexOf(m);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    MARKER.delete({ id: m.MARKER_ID }, m, function success(response) {
                        $scope.markList.splice(index, 1);
                        toastr.success("Marker Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion Marker Add/Update/Delete

            //#region NetworkName Add/Update/Delete nn
            $scope.netNameList = allNetworkNames; //nn
            $scope.showAddNNForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addNNButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newNN = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddNNClicked = function () {
                $scope.showAddNNForm = true; //show the form
                $scope.addNNButtonShowing = false; //hide button                
            };
            $scope.NeverMindNN = function () {
                $scope.newNN = {};
                $scope.showAddNNForm = false; //hide the form
                $scope.addNNButtonShowing = true; //show button   

            };
            $scope.AddNetworkName = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    NETWORK_NAME.save($scope.newNN, function success(response) {
                        $scope.netNameList.push(response);
                        $scope.newNN = {};
                        $scope.showAddNNForm = false; //hide the form
                        $scope.addNNButtonShowing = true; //show the button again
                        toastr.success("Network Name Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveNetworkName = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                NETWORK_NAME.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Network Name Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteNetworkName = function (nn) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return nn;
                        },
                        what: function () {
                            return "Network Name";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.netNameList.indexOf(nn);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    NETWORK_NAME.delete({ id: nn.NETWORK_NAME_ID }, nn, function success(response) {
                        $scope.netNameList.splice(index, 1);
                        toastr.success("Network Name Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion NetworkName Add/Update/Delete

            //#region OPQuality Add/Update/Delete
            $scope.opQualList = allObjPtQualities; //opq
            $scope.showAddOPQForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addOPQButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newOPQ = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddOPQClicked = function () {
                $scope.showAddOPQForm = true; //show the form
                $scope.addOPQButtonShowing = false; //hide button                
            };
            $scope.NeverMindOPQ = function () {
                $scope.newOPQ = {};
                $scope.showAddOPQForm = false; //hide the form
                $scope.addOPQButtonShowing = true; //show button   

            };

            $scope.AddOPQuality = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    OP_QUALITY.save($scope.newOPQ, function success(response) {
                        $scope.opQualList.push(response);
                        $scope.newOPQ = {};
                        $scope.showAddOPQForm = false; //hide the form
                        $scope.addOPQButtonShowing = true; //show the button again
                        toastr.success("Objective Point Quality Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };

            $scope.saveOPQuality = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                OP_QUALITY.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Objective Point Quality Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };

            $scope.deleteOPQuality = function (opq) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return opq;
                        },
                        what: function () {
                            return "Objective Point Quality";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.opQualList.indexOf(opq);
                    //DELETE it
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    OP_QUALITY.delete({ id: opq.OP_QUALITY_ID }, opq, function success(response) {
                        $scope.opQualList.splice(index, 1);
                        toastr.success("Objective Point Quality Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion OPQuality Add/Update/Delete

            //#region OPType Add/Update/Delete
            $scope.opTypeList = allObjPtTypes; //opt
            $scope.showAddOPTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addOPTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newOPT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddOPTClicked = function () {
                $scope.showAddOPTForm = true; //show the form
                $scope.addOPTButtonShowing = false; //hide button                
            };
            $scope.NeverMindOPT = function () {
                $scope.newOPT = {};
                $scope.showAddOPTForm = false; //hide the form
                $scope.addOPTButtonShowing = true; //show button   

            };
            $scope.AddOPType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    OP_TYPE.save($scope.newOPT, function success(response) {
                        $scope.opTypeList.push(response);
                        $scope.newOPT = {};
                        $scope.showAddOPTForm = false; //hide the form
                        $scope.addOPTButtonShowing = true; //show the button again
                        toastr.success("Objective Point Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveOPType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                OP_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Objective Point Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteOPType = function (opt) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return opt;
                        },
                        what: function () {
                            return "Objective Point Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.opTypeList.indexOf(opt);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    OP_TYPE.delete({ id: opt.OBJECTIVE_POINT_TYPE_ID }, opt, function success(response) {
                        $scope.opTypeList.splice(index, 1);
                        toastr.success("Objective Point Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion OPType Add/Update/Delete

            //#region SensorBrand Add/Update/Delete
            $scope.sensBrandList = allSensorBrands; //sb
            $scope.showAddSBForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addSBButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newSB = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddSBClicked = function () {
                $scope.showAddSBForm = true; //show the form
                $scope.addSBButtonShowing = false; //hide button                
            };
            $scope.NeverMindSB = function () {
                $scope.newSB = {};
                $scope.showAddSBForm = false; //hide the form
                $scope.addSBButtonShowing = true; //show button   

            };
            $scope.AddSensorBrand = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    SENSOR_BRAND.save($scope.newSB, function success(response) {
                        $scope.sensBrandList.push(response);
                        $scope.newSB = {};
                        $scope.showAddSBForm = false; //hide the form
                        $scope.addSBButtonShowing = true; //show the button again
                        toastr.success("Sensor Brand Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveSensorBrand = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                SENSOR_BRAND.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Sensor Brand Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteSensorBrand = function (sb) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return sb;
                        },
                        what: function () {
                            return "Sensor Brand";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.sensBrandList.indexOf(sb);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    SENSOR_BRAND.delete({ id: sb.SENSOR_BRAND_ID }, sb, function success(response) {
                        $scope.sensBrandList.splice(index, 1);
                        toastr.success("Sensor Brand Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion SensorBrand Add/Update/Delete

            //#region DepType Add/Update/Delete
            $scope.depTypeList = allDeploymentTypes; //dt
            $scope.showAddDTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addDTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newDT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddDTClicked = function () {
                $scope.showAddDTForm = true; //show the form
                $scope.addDTButtonShowing = false; //hide button                
            };
            $scope.NeverMindDT = function () {
                $scope.newDT = {};
                $scope.showAddDTForm = false; //hide the form
                $scope.addDTButtonShowing = true; //show button   

            };

            $scope.AddDepType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    DEPLOYMENT_TYPE.save($scope.newDT, function success(response) {
                        $scope.depTypeList.push(response);
                        $scope.newDT = {};
                        $scope.showAddDTForm = false; //hide the form
                        $scope.addDTButtonShowing = true; //show the button again
                        toastr.success("Deployment Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };

            $scope.saveDepType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                DEPLOYMENT_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Deployment Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };

            $scope.deleteDepType = function (dt) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return dt;
                        },
                        what: function () {
                            return "Deployment Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.depTypeList.indexOf(dt);
                    //DELETE it
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    DEPLOYMENT_TYPE.delete({ id: dt.DEPLOYMENT_TYPE_ID }, dt, function success(response) {
                        $scope.depTypeList.splice(index, 1);
                        toastr.success("Deployment Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion DepType Add/Update/Delete

            //#region StatusType Add/Update/Delete
            $scope.statTypeList = allStatusTypes; //statT
            $scope.showAddStatTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addStatTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newStatT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddStatTClicked = function () {
                $scope.showAddStatTForm = true; //show the form
                $scope.addStatTButtonShowing = false; //hide button                
            };
            $scope.NeverMindStatT = function () {
                $scope.newStatT = {};
                $scope.showAddStatTForm = false; //hide the form
                $scope.addStatTButtonShowing = true; //show button   

            };
            $scope.AddStatusType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    STATUS_TYPE.save($scope.newStatT, function success(response) {
                        $scope.statTypeList.push(response);
                        $scope.newStatTT = {};
                        $scope.showAddStatTForm = false; //hide the form
                        $scope.addStatTButtonShowing = true; //show the button again
                        toastr.success("Status Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveStatusType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                STATUS_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Status Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteStatusType = function (statT) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return statT;
                        },
                        what: function () {
                            return "Status Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.statTypeList.indexOf(statT);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    STATUS_TYPE.delete({ id: statT.STATUS_TYPE_ID }, statT, function success(response) {
                        $scope.statTypeList.splice(index, 1);
                        toastr.success("Status Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion StatusType Add/Update/Delete

            //#region SensorType Add/Update/Delete
            $scope.sensTypeList = allSensorTypes;// allSensorTypes; //senT
            $scope.newDepTypeRelating = [];
            $scope.commaSepDepMETHODS = [];

            //add the deployment types
            $scope.formattedSensTypeList = [];
            $scope.sensTypeList.forEach(function (sensType) {
                SENSOR_TYPE.getSensorDeploymentTypes({ id: sensType.SENSOR_TYPE_ID }, function success(response) {
                    var deps = response;
                    sensType.DepTypes = []; var DepMStrings = []; sensType.DepMETHODStrings = "";
                    if (deps.length > 0) {
                        deps.forEach(function (d) {
                            sensType.DepTypes.push(d.DEPLOYMENT_TYPE_ID);
                            DepMStrings.push(d.METHOD);
                            sensType.DepMETHODStrings = DepMStrings.join(', ');
                        });
                    }
                    $scope.formattedSensTypeList.push(sensType);
                }).$promise;
            });

            //checklist for deployment types
            $scope.showDepTypes = function (SenT) {
                var selected = [];
                angular.forEach($scope.depTypeList, function (s) {
                    if (SenT.DepTypes.indexOf(s.DEPLOYMENT_TYPE_ID) >= 0) {
                        selected.push(s.METHOD);
                    }
                });
                return selected.length ? selected.join(', ') : "";
            };
            $scope.removeTheseDepTypes = []; //these are the ones to remove when they click save
            $scope.checkListCheck = function (originalChecked, nowChecked) {
                //originalChecked -- what the model had before this click event was triggered
                //nowChecked -- what deployment types are now checked.. look for differences and remove if less than, other wise do nothing, the save will handle adding
                if (nowChecked.length < originalChecked.length) {
                    //unchecked
                    angular.forEach(originalChecked, function (oc) {
                        if (nowChecked.indexOf(oc) < 0) {
                            //not there anymore
                            var deleteDep = $scope.depTypeList.filter(function (dt) { return dt.DEPLOYMENT_TYPE_ID == oc; })[0];
                            //make sure you don't add it twice
                            if ($scope.removeTheseDepTypes.length > 0) {
                                for (var d = 0; d < $scope.removeTheseDepTypes.length; d++) {
                                    if ($scope.removeTheseDepTypes[d].DEPLOYMENT_TYPE_ID == deleteDep.DEPLOYMENT_TYPE_ID) {
                                        //forgettabout it
                                        d = $scope.newDepTypeRelating.length;
                                    } else {
                                        $scope.removeTheseDepTypes.push(deleteDep);
                                    }
                                }
                            } else {
                                $scope.removeTheseDepTypes.push(deleteDep);
                            }
                        }
                    });
                }
            };
            $scope.showAddSenTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addSenTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newSenT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddSenTClicked = function () {
                $scope.showAddSenTForm = true; //show the form
                $scope.addSenTButtonShowing = false; //hide button                
            };
            $scope.NeverMindSenT = function () {
                $scope.newSenT = {};
                $scope.newDepTypeRelating = [];
                angular.forEach($scope.depTypeList, function (d) { d.selected = false; });
                $scope.showAddSenTForm = false; //hide the form
                $scope.addSenTButtonShowing = true; //show button   

            };
            //new sensor type being added, they checked to relate a deployment type. store for use during save
            $scope.addDepTypeToNewSenT = function (dt) {
                var test;
                if (dt.selected == true) {
                    //dont add it more than once
                    if ($scope.newDepTypeRelating.length > 0) {
                        for (var d = 0; d < $scope.newDepTypeRelating.length; d++) {
                            if ($scope.newDepTypeRelating[d].DEPLOYMENT_TYPE_ID == dt.DEPLOYMENT_TYPE_ID) {
                                //forgettabout it
                                d = $scope.newDepTypeRelating.length;
                            } else {
                                $scope.newDepTypeRelating.push(dt);
                                d = $scope.newDepTypeRelating.length;
                            }
                        }
                    }

                    if ($scope.newDepTypeRelating.length == 0)
                        $scope.newDepTypeRelating.push(dt);

                }
            };
            $scope.AddSensorType = function (valid) {
                if (valid) {
                    var newSensor = {};
                    var relatedDeps = [];
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    SENSOR_TYPE.save($scope.newSenT, function success(response) {
                        newSensor = response;
                        $scope.newSenT = {};
                        $scope.showAddSenTForm = false; //hide the form
                        $scope.addSenTButtonShowing = true; //show the button again
                        //now see if they related any deploy sensors
                        if ($scope.newDepTypeRelating.length > 0) {
                            angular.forEach($scope.newDepTypeRelating, function (ndt) {
                                delete ndt.selected;
                                relatedDeps.push(ndt.DEPLOYMENT_TYPE_ID);
                                SENSOR_TYPE.addSensorDeploymentType({ id: newSensor.SENSOR_TYPE_ID }, ndt, function success(response1) {
                                    var test;
                                }, function error(errorResponse) {
                                    var what = errorResponse.statusText;
                                });
                            });
                        }
                        newSensor.DepTypes = relatedDeps;
                        $scope.formattedSensTypeList.push(newSensor);
                        toastr.success("Sensor Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveSensorType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                //pull out just the sensor and then the deployment type to post separately
                var ST = { SENSOR_TYPE_ID: data.SENSOR_TYPE_ID, SENSOR: data.SENSOR };
                var DTs = [];
                //get the Deployment Types from the list of ids in data.DepTypes
                angular.forEach($scope.depTypeList, function (s) {
                    if (data.DepTypes.indexOf(s.DEPLOYMENT_TYPE_ID) >= 0) {
                        var thisDT = { DEPLOYMENT_TYPE_ID: s.DEPLOYMENT_TYPE_ID, METHOD: s.METHOD };
                        DTs.push(thisDT);
                    }
                });
                //now update the sensor and then any Dep Types they added or removed
                SENSOR_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    angular.forEach(DTs, function (dt) {
                        SENSOR_TYPE.addSensorDeploymentType({ id: id }, dt, function success(response1) {
                            toastr.success("Deployment Type is now related");
                        }, function error(errorResponse1) {
                            var what = errorResponse1.statusText;
                        });
                    });
                    toastr.success("Sensor Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                }).$promise.then(
                    //remove those
                    angular.forEach($scope.removeTheseDepTypes, function (rdt) {
                        SENSOR_TYPE.removeSensorDeploymentType({ id: id }, rdt, function success(response2) {
                            toastr.success("Deployment Type is no longer related");
                        }, function error(errorResponse) {
                            var what = errorResponse.statusText;
                        });
                    })
                );
                //now make sure $scope model is updated?
                return retur;
            };
            $scope.deleteSensorType = function (senT) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return senT;
                        },
                        what: function () {
                            return "Sensor Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.formattedSensTypeList.indexOf(senT);
                    var ST = { SENSOR_TYPE_ID: senT.SENSOR_TYPE_ID, SENSOR: senT.SENSOR };
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');

                    //need to delete the relationship before I can delete the sensor type                    
                    angular.forEach($scope.depTypeList, function (s) {
                        if (senT.DepTypes.indexOf(s.DEPLOYMENT_TYPE_ID) >= 0) {
                            //get it and then delete the relationship
                            var thisDT = { DEPLOYMENT_TYPE_ID: s.DEPLOYMENT_TYPE_ID, METHOD: s.METHOD };
                            SENSOR_TYPE.removeSensorDeploymentType({ id: ST.SENSOR_TYPE_ID }, thisDT, function success(response2) {
                                var removed;
                            });
                        }
                    });
                    //now delete the sensor                    
                    SENSOR_TYPE.delete({ id: ST.SENSOR_TYPE_ID }, ST, function success(response) {
                        $scope.formattedSensTypeList.splice(index, 1);
                        //get the Deployment Types from the list of ids in data.DepTypes

                        toastr.success("Sensor Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion SensorType Add/Update/Delete

            //#region NetType Add/Update/Delete
            $scope.netTypeList = allNetworkTypes; //nt
            $scope.showAddNTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addNTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newNT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddNTClicked = function () {
                $scope.showAddNTForm = true; //show the form
                $scope.addNTButtonShowing = false; //hide button                
            };
            $scope.NeverMindNT = function () {
                $scope.newNT = {};
                $scope.showAddNTForm = false; //hide the form
                $scope.addNTButtonShowing = true; //show button   

            };

            $scope.AddNetType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    NETWORK_TYPE.save($scope.newNT, function success(response) {
                        $scope.netTypeList.push(response);
                        $scope.newNT = {};
                        $scope.showAddNTForm = false; //hide the form
                        $scope.addNTButtonShowing = true; //show the button again
                        toastr.success("Network Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };

            $scope.saveNetType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                NETWORK_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Network Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };

            $scope.deleteNetType = function (nt) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return nt;
                        },
                        what: function () {
                            return "Network Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.netTypeList.indexOf(nt);
                    //DELETE it
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    NETWORK_TYPE.delete({ id: nt.NETWORK_TYPE_ID }, nt, function success(response) {
                        $scope.netTypeList.splice(index, 1);
                        toastr.success("Network Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion NetType Add/Update/Delete

            //#region VertColMeth Add/Update/Delete
            $scope.vertColMethList = allVerticalCollMethods; //vcm
            $scope.showAddVCMForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addVCMButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newVCM = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddVCMClicked = function () {
                $scope.showAddVCMForm = true; //show the form
                $scope.addVCMButtonShowing = false; //hide button                
            };
            $scope.NeverMindVCM = function () {
                $scope.newVCM = {};
                $scope.showAddVCMForm = false; //hide the form
                $scope.addVCMButtonShowing = true; //show button   

            };
            $scope.AddVertColMeth = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    VERTICAL_COLL_METHOD.save($scope.newVCM, function success(response) {
                        $scope.vertColMethList.push(response);
                        $scope.newVCM = {};
                        $scope.showAddVCMForm = false; //hide the form
                        $scope.addVCMButtonShowing = true; //show the button again
                        toastr.success("Vertical Collection Method Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveVertColMeth = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                VERTICAL_COLL_METHOD.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Vertical Collection Method Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteVertColMeth = function (vcm) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return vcm;
                        },
                        what: function () {
                            return "Vertical Collection Method";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.vertColMethList.indexOf(vcm);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    VERTICAL_COLL_METHOD.delete({ id: vcm.VCOLLECT_METHOD_ID }, vcm, function success(response) {
                        $scope.vertColMethList.splice(index, 1);
                        toastr.success("Vertical Collection Method Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion VertColMeth Add/Update/Delete

            //#region VertDatum Add/Update/Delete
            $scope.vertDatList = allVerticalDatums; //vd
            $scope.showAddVDForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addVDButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newVD = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddVDClicked = function () {
                $scope.showAddVDForm = true; //show the form
                $scope.addVDButtonShowing = false; //hide button                
            };
            $scope.NeverMindVD = function () {
                $scope.newVD = {};
                $scope.showAddVDForm = false; //hide the form
                $scope.addVDButtonShowing = true; //show button   

            };
            $scope.AddVertDatum = function (valid) {
                if (valid) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    VERTICAL_DATUM.save($scope.newVD, function success(response) {
                        $scope.vertDatList.push(response);
                        $scope.newVD = {};
                        $scope.showAddVDForm = false; //hide the form
                        $scope.addVDButtonShowing = true; //show the button again
                        toastr.success("Vertical Datum Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveVertDatum = function (data, id) {
                var retur = false;
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                VERTICAL_DATUM.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Vertical Datum Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteVertDatum = function (vd) {
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return vd;
                        },
                        what: function () {
                            return "Vertical Datum";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.vertDatList.indexOf(vd);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    VERTICAL_DATUM.delete({ id: vd.DATUM_ID }, vd, function success(response) {
                        $scope.vertDatList.splice(index, 1);
                        toastr.success("Vertical Datum Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion VertDatum Add/Update/Delete
            //#endregion ALL LOOKUPS (add/update/delete)
        }
    }
    //#endregion  resources Controller (abstract)
    //#endregion Settings Controller
}());
