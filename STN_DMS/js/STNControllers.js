﻿(function () {
    /* controllers.js*/
    'use strict';

    var STNControllers = angular.module('STNControllers',
        ['ngInputModified', 'ui.unique', 'ui.validate', 'angular.filter', 'xeditable', 'checklist-model']);

    //#region FILTERS
    //#endregion FILTERS

    //#region CONSTANTS
    //regular expression for a password requirement of at least 8 characters long and at least 3 of 4 character categories used (upper, lower, digit, special
    STNControllers.constant('RegExp', {
        PASSWORD: /^(((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[A-Z])(?=.*[!@@?#$%^&_:;-]))|((?=.*[a-z])(?=.*[0-9])(?=.*[!@@?#$%^&_:;-]))|((?=.*[A-Z])(?=.*[0-9])(?=.*[!@@?#$%^&_:;-]))).{8,}$/
    });
    //#endregion CONSTANTS

    //#region DIRECTIVES
    //print test
    STNControllers.directive('print', ['$compile', function ($compile) {
        return {
            restrict: 'AEC',
            link: function (scope, el, attrs) {
                if (attrs.nopopup) {
                    el.bind('click', function () {
                        window.print();
                    });
                } else {
                    el.bind('click', function () {
                        var html = document.getElementById(attrs.print);
                        var links = document.getElementsByTagName('link');
                        var stylesheets = "";
                        for (var i = 0; i < links.length; i++) {
                            stylesheets = stylesheets + links[i].outerHTML;
                        }
                        var printarea = window.open('', '', '');
                        printarea.document.write('<html><head><title></title>');
                        printarea.document.write(stylesheets);
                        printarea.document.write('<style>label {font-weight: 600;} *{font-size: medium;}</style></head><body>');
                        printarea.document.write('<h2>Short Term Network Modeling</h2>');
                        printarea.document.write(html.innerHTML);
                        printarea.document.write('</body></html>');
                        printarea.print();
                        printarea.close();
                        
                    });
                }
            }
        };
    }]);

    //focus on the first element of the page
    STNControllers.directive('numericOnly', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {

                modelCtrl.$parsers.push(function (inputValue) {
                    var transformedInput = inputValue ? inputValue.replace(/[^\d.-]/g, '') : null;

                    if (transformedInput != inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }

                    return transformedInput;
                });
            }
        };
    });

   // format the ng-model date as date on initial load
    STNControllers.directive('datepickerPopup', function () {
        return {
            restrict: 'EAC',
            require: 'ngModel',
            link: function (scope, element, attr, controller) {
                //remove the default formatter from the input directive to prevent conflict
                controller.$formatters.shift();
            }
        }
    });
    

    STNControllers.directive('focus', function () {
        return function (scope, element, attributes) {
            element[0].focus();
        }
    });

    STNControllers.directive('backButton', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', goBack);

                function goBack() {
                    history.back();
                    scope.$apply();
                }
            }
        }
    });

    //validate password
    STNControllers.directive('passwordValidate', ['RegExp', function (regex) {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                elm.unbind('keydown').unbind('change');
                elm.bind('blur', function (viewValue) {
                    //ctrl.$validators.passwordValidate = function (modelView, viewValue) {
                    //    if ((regex.PASSWORD).test(viewValue)) {
                    //        return true;
                    //    }
                    //    return false;
                    //};
                    scope.$apply(function () {
                        if ((regex.PASSWORD).test(viewValue.target.value)) {
                            //it is valid
                            ctrl.$setValidity("passwordValidate", true);
                            return viewValue;
                        } else {
                            //it is invalid, return undefined - no model update
                            ctrl.$setValidity("passwordValidate", false);
                            return undefined;
                        }
                    });
                });
            }
        };
    }])

    STNControllers.directive('sameAs', function ($parse) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                elm.unbind('keydown').unbind('change');
                elm.bind('blur', function (viewValue) {
                    scope.$watch(function () {
                        return $parse(attrs.sameAs)(scope) === ctrl.$modelValue;
                    }, function (currentValue) {
                        ctrl.$setValidity('passwordMismatch', currentValue);
                    });
                });
            }
        };
    });

    //disable tabs if there is no project (create page instead of edit page)
    STNControllers.directive('aDisabled', function () {
        return {
            compile: function (tElement, tAttrs, transclude) {
                //Disable ngClick
                tAttrs["ngClick"] = "!(" + tAttrs["aDisabled"] + ") && (" + tAttrs["ngClick"] + ")";

                //Toggle "disabled" to class when aDisabled becomes true
                return function (scope, iElement, iAttrs) {
                    scope.$watch(iAttrs["aDisabled"], function (newValue) {
                        if (newValue !== undefined) {
                            iElement.toggleClass("disabled", newValue);
                        }
                    });

                    //Disable href on click
                    iElement.on("click", function (e) {
                        if (scope.$eval(iAttrs["aDisabled"])) {
                            e.preventDefault();
                        }
                    });
                };
            }
        };
    });

    STNControllers.directive('tooltip', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).hover(function () {
                    // on mouseenter
                    $(element).tooltip('show');
                }, function () {
                    // on mouseleave
                    $(element).tooltip('hide');
                });
            }
        };
    });

    STNControllers.directive('myInputMask', function () {
        return {
            restrict: 'AC',
            link: function (scope, el, attrs) {
                el.inputmask(scope.$eval(attrs.myInputMask));
                el.on('change', function () {
                    scope.$eval(attrs.ngModel + "='" + el.val() + "'");
                    // or scope[attrs.ngModel] = el.val() if your expression doesn't contain dot.
                });
            }
        }
    });

    //#endregion DIRECTIVES

    //#region MAIN Controller
    STNControllers.controller('mainCtrl', ['$scope', '$rootScope', '$location', '$state',
        'checkCreds', 'getUsersNAME', 'deleteCreds', 'getUserID', mainCtrl]);
    function mainCtrl($scope, $rootScope, $location, $state, checkCreds, getUsersNAME, deleteCreds, getUserID) {
        //$scope.logo = 'images/usgsLogo.png';
        $rootScope.isAuth = {};
        $scope.activeMenu = 'home'; //scope var for setting active class
        if (!checkCreds()) {
            $rootScope.isAuth.val = false;
            $location.path('/login');
        } else {
            $rootScope.isAuth.val = true;
            $rootScope.usersName = getUsersNAME();
            $rootScope.userID = getUserID();
            $rootScope.sessionEvent = "";
            $rootScope.sessionTeam = "";
            $state.go('home');
        }
    }
    //#endregion MAIN Controller

    //#region HELP Controller
    STNControllers.controller('helpCtrl', ['$scope', helpCtrl]);
    function helpCtrl($scope) {
        $scope.helpInfo = {};
        $scope.helpInfo.fact = "Some really interesting help will be here.";
    }
    //#endregion HELP Controller

    //#region NAV Controller
    STNControllers.controller('navCtrl', ['$scope', '$location', '$rootScope', 'checkCreds', 'deleteCreds', navCtrl]);
    function navCtrl($scope, $location, $rootScope, checkCreds, deleteCreds) {
        $scope.logout = function () {
            deleteCreds();
            $rootScope.isAuth.val = false;
            $location.path('/login');
        }
    }
    //#endregion NAV Controller

    //#region Home Controller
    STNControllers.controller('HomeCtrl', ['$scope', '$location', '$rootScope', '$http', 'eventList', 'INSTRUMENT', 'HWM', 'MEMBER', 'COLLECT_TEAM', 'checkCreds', 'deleteCreds', 'getCreds', 'setSessionEvent', 'setSessionTeam', HomeCtrl]);
    function HomeCtrl($scope, $location, $rootScope, $http, eventList, INSTRUMENT, HWM, MEMBER, COLLECT_TEAM, checkCreds, deleteCreds, getCreds, setSessionEvent, setSessionTeam) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //good to go
            $scope.ChooseEvent = {};
            $scope.allEvents = eventList;
            $scope.evID = 0;
            $scope.ShowEventCounts = false;
            $scope.stat1Back = false; $scope.stat2Back = false; $scope.stat3Back = false;
            $scope.hwmBack = false; $scope.peopleBack = false; $scope.teamsBack = false;

            $scope.totInstrs = 0; $scope.totHWMs = 0;
            $scope.depInstrs = 0;
            $scope.retInstrs = 0;
            $scope.lostInstrs = 0;
            $scope.hwms = 0;
            $scope.totPeople = 0;
            $scope.CollectTeams = [];
            
            //call after each success on populating totals.. only show info when all back
            var allBack = function () {
                if (($scope.stat1Back == true && $scope.stat2Back == true) &&
                    ($scope.stat3Back == true && $scope.hwmBack == true) &&
                    $scope.peopleBack == true) {
                    $scope.totInstrs = $scope.depInstrs + $scope.retInstrs + $scope.lostInstrs;
                    //get teams
                    COLLECT_TEAM.getEventTeams({ Eventid: $scope.evID }, function success(data) {
                        $scope.CollectTeams = data;
                        $scope.teamsBack = true;
                       
                    }, function error(errorResponse) {
                        alert("Error: " + errorResponse.statusText);
                    }).$promise;
                    $scope.ShowEventCounts = true;
                }
            }

            //event was chosen
            $scope.EventChosen = function () {
                //clear all totals
                $scope.totInstrs = 0; $scope.totHWMs = 0;
                $scope.depInstrs = 0; $scope.retInstrs = 0; $scope.lostInstrs = 0;
                $scope.hwms = 0; $scope.people = 0;

                $scope.ShowEventCounts = false; $scope.stat1Back = false; $scope.stat2Back = false;
                $scope.stat3Back = false; $scope.hwmBack = false; $scope.peopleBack = false; $scope.teamsBack = false;

                //set event to session cookie
                $scope.evID = this.ChooseEvent.id;
                var eventName = $scope.allEvents.filter(function (x) { return x.EVENT_ID == $scope.evID; });
                setSessionEvent($scope.evID,eventName[0].EVENT_NAME);
                $rootScope.sessionEvent = "For Event: " + eventName[0].EVENT_NAME + ".";

                //get all the instrument stat counts
                INSTRUMENT.getstatusInstruments({ CurrentStatus: 1, Event: $scope.evID }, function success(data) {
                    var deployed = data;
                    $scope.stat1Back = true;
                    $scope.depInstrs = deployed.length;
                    allBack();
                }, function error(errorResponse) {
                    alert("Error: " + errorResponse.statusText);
                }).$promise;
                INSTRUMENT.getstatusInstruments({ CurrentStatus: 2, Event: $scope.evID }, function success(data) {
                    var retr = data;
                    $scope.stat2Back = true;
                    $scope.retInstrs = retr.length;
                    allBack();
                }, function error(errorResponse) {
                    alert("Error: " + errorResponse.statusText);
                }).$promise;
                INSTRUMENT.getstatusInstruments({ CurrentStatus: 3, Event: $scope.evID }, function success(data) {
                    var lost = data;
                    $scope.stat3Back = true;
                    $scope.lostInstrs = lost.length;
                    allBack();
                }, function error(errorResponse) {
                    alert("Error: " + errorResponse.statusText);
                }).$promise;

                //get HWMs count
                HWM.getEventHWMs({ Eventid: $scope.evID }, function success(data) {
                    var h = data.HWMs;
                    $scope.hwmBack = true;
                    $scope.totHWMs = h.length;
                    allBack();
                }, function error(errorResponse) {
                    alert("Error: " + errorResponse.statusText);
                }).$promise;

                //get people count
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                MEMBER.getEventPeople({ Eventid: $scope.evID }, function success(data) {
                    var p = data;
                    $scope.peopleBack = true;
                    $scope.totPeople = p.length;
                    allBack();
                }, function error(errorResponse) {
                    alert("Error: " + errorResponse.statusText);
                }).$promise;

               
            }//end of EventChosen

            $scope.teamClick = function (t) {
                setSessionTeam(this.t.COLLECT_TEAM_ID, this.t.DESCRIPTION);
                $rootScope.sessionTeam = "You are on Team: " + this.t.DESCRIPTION + ".";
            }
        }
    }
    //#endregion Home Controller

    //#region Map Controller
    STNControllers.controller('MapCtrl', ['$scope', '$location', '$rootScope', 'checkCreds', 'deleteCreds', MapCtrl]);
    function MapCtrl($scope, $location, $rootScope, checkCreds, deleteCreds) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.map = "Welcome to the new STN Map Page!!";
        }
    }
    //#endregion Map Controller

    //#region Approval Controller
    STNControllers.controller('ApprovalCtrl', ['$scope', '$location', '$http', 'eventList', 'stateList', 'instrumentList', 'memberList', 'allSensorTypes',
        'HWM', 'DATA_FILE', 'INSTRUMENT', 'SITE', 'checkCreds', 'getCreds', ApprovalCtrl]);
    function ApprovalCtrl($scope, $location, $http, eventList, stateList, instrumentList, memberList, allSensorTypes,
        HWM, DATA_FILE, INSTRUMENT, SITE, checkCreds, getCreds) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.allEvents = eventList;
            $scope.allMembers = memberList;
            $scope.allStates = stateList;
            $scope.allInstruments = instrumentList;
            $scope.allSensorTypes = allSensorTypes;
            $scope.ChosenEvent = {};
            $scope.ChosenState = {};
            $scope.ChosenMember = {};
            $scope.unApprovedHWMs = []; $scope.showHWMbox = false; 
            $scope.unApprovedDFs = []; $scope.showDFbox = false;

            $scope.search = function () {
                //clear contents in case they are searching multiple times
                $scope.unApprovedHWMs = []; $scope.showHWMbox = false;
                $scope.unApprovedDFs = []; $scope.showDFbox = false;

                var evID = this.ChosenEvent.id != undefined ? this.ChosenEvent.id : 0;
                var sID = this.ChosenState.id != undefined ? this.ChosenState.id : 0;
                var mID = this.ChosenMember.id != undefined ? this.ChosenMember.id : 0;

                //go get the HWMs and DataFiles that need to be approved
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                HWM.getUnapprovedHWMs({ IsApproved: 'false', Event: evID, TeamMember: mID, State: sID }, function success(response) {
                    $scope.unApprovedHWMs = response.HWMs;
                    $scope.showHWMbox = true;
                    
                }, function error(errorResponse) {
                    alert("Error: " + errorResponse.statusText);
                });
                DATA_FILE.getUnapprovedDFs({ IsApproved: 'false', Event: evID, Processor: mID, State: sID }, function success(response1) {
                    var DFs = response1;                        
                    //need sensor and site info
                    angular.forEach(DFs, function (df) {
                        var thisdfInst = $scope.allInstruments.filter(function (i) { return i.INSTRUMENT_ID == df.INSTRUMENT_ID; });
                        var formattedDF = {};
                        var siteID = thisdfInst[0].SITE_ID;
                        var senType = $scope.allSensorTypes.filter(function (s) { return s.SENSOR_TYPE_ID == thisdfInst[0].SENSOR_TYPE_ID; });
                        formattedDF.InstrID = thisdfInst[0].INSTRUMENT_ID;
                        SITE.query({ id: siteID }).$promise.then(function (response2) {
                            formattedDF.stringToShow = response2.SITE_NO + ": " + senType[0].SENSOR;
                            $scope.unApprovedDFs.push(formattedDF);
                        });
                    });
                    $scope.showDFbox = true;                       
                }, function error(errorResponse1) {
                    alert("Error: " + errorResponse1.statusText);
                });
            };           
        }
    }
    //#endregion Approval Controller

    //#region Site Search Controller
    STNControllers.controller('SiteSearchCtrl', ['$scope', '$location', '$rootScope', 'checkCreds', 'deleteCreds', SiteSearchCtrl]);
    function SiteSearchCtrl($scope, $location, $rootScope, checkCreds, deleteCreds) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.ssearch = "Welcome to the new STN Site Search Page!!";
        }
    }
    //#endregion Site Search Controller

    //#region Reporting Controller
    STNControllers.controller('ReportingCtrl', ['$scope', '$rootScope', '$location', '$state', '$http', '$modal', 'incompleteReports', 'allEvents', 'allStates', 'allReports', 'allEventTypes', 'allEventStatus', 'thisMember', 'allAgencies', 'REPORT', 'CONTACT', 'checkCreds', 'getCreds', ReportingCtrl]);
    function ReportingCtrl($scope, $rootScope, $location, $state, $http, $modal, incompleteReports, allEvents, allStates, allReports, allEventTypes, allEventStatus, thisMember, allAgencies, REPORT, CONTACT, checkCreds, getCreds) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //#region changing tabs handler /////////////////////
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                var formIsPopulated = false;
                switch (fromState.url) {
                    case '/SubmitReport':
                        if ($scope.fullReportForm.submit != undefined) {
                            formIsPopulated = $scope.fullReportForm.submit.$dirty;
                            formIsPopulated = $scope.fullReportForm.submit.EVENT_ID.$viewValue != undefined ? true : formIsPopulated;
                        }
                        break;
                }
                if (formIsPopulated) { //is dirty
                    console.log('toState.name: ' + toState.name);
                    console.log('fromState.name: ' + fromState.name);

                    if (confirm("Are you sure you want to leave the Submit Report Tab? Any unsaved information will be lost.")) {
                        console.log('go to: ' + toState.name);
                    } else {
                        console.log('stay at state: ' + fromState.name);
                        $(".page-loading").addClass("hidden");
                        event.preventDefault();
                        //event.stopPropagation;
                    }
                }
            });
            //#endregion changing tabs handler //////////////////////

            //#region Datepicker
            $scope.datepickrs = {
                projStDate: false,
                projEndDate: false
            }
            $scope.onSelect = function () {
                var test;
            }
            $scope.open = function ($event, which) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.datepickrs[which] = true;
            };
           // $scope.format = 'MMMM dd, yyyy';
            //#endregion Datepicker

            //format the date mm/dd/yyyy
            $scope.formatDate = function (d) {
                var currentDt = new Date(d);
                var mm = currentDt.getMonth() + 1;
                mm = (mm < 10) ? '0' + mm : mm;
                var dd = currentDt.getDate();
                var yyyy = currentDt.getFullYear();
                var date = mm + '/' + dd + '/' + yyyy;
                return date;
            };

            //#region global vars
            $scope.fullReportForm = {};
            $scope.newReport = {};
            $scope.DeployStaff = {}; $scope.GenStaff = {};
            $scope.InlandStaff = {}; $scope.CoastStaff = {};
            $scope.WaterStaff = {};
            $scope.disabled = true;
            $scope.needToComplete = false;
            $scope.memberIncompletes = incompleteReports.filter(function (ir) { return ir.COMPLETE == 0 });
            $scope.events = allEvents;
            $scope.states = allStates;
            $scope.reports = allReports;
            $scope.Submitter = thisMember;
            $scope.agencies = allAgencies;
            $scope.eventTypes = allEventTypes;
            $scope.eventStats = allEventStatus;
            var memberAgency = allAgencies.filter(function (a) { return a.AGENCY_ID == $scope.Submitter.AGENCY_ID; });
            $scope.Submitter.AGENCY_NAME = memberAgency[0].AGENCY_NAME;
            $scope.Submitter.AGENCY_ADDRESS = memberAgency[0].ADDRESS + ", " + memberAgency[0].CITY + " " + memberAgency[0].STATE + " " + memberAgency[0].ZIP;
            //#endregion global vars

            //#region Generate Report tab
            $scope.Statemodel = {};//binding to the state multi-select
            $scope.genSummary = {};//binding for the event chosen, and date chosen
            $scope.filteredReports = []; //result of filter options

            //each option the populate, need to show selection in 'Confirm Selections' section (date works)
            $scope.genRepChange = function () {
                $scope.EventName = $scope.events.filter(function (e) { return e.EVENT_ID == $scope.genSummary.EVENT_ID; });
                var names = [];
                var abbrevs = [];
                angular.forEach($scope.Statemodel.value, function (state) {
                    names.push(state.STATE_NAME); abbrevs.push(state.STATE_ABBREV);
                });
                
                $scope.StateNames = names.join(', '); $scope.StateAbbrevs = abbrevs.join(',');
            }

            $scope.MetricDisplayModel = []; //hold all reportModels for 'Display Metrics Summary'
            //clicked Display Metrics Summary, show content in new tab
            $scope.displayMetricSum = function (valid) {
                if (valid == true) {
                    $scope.MetricDisplayModel =[];
                    $scope.GenRepEventModel = { };
                    //get metrics summary to show in new tab
                    $scope.Statemodel.value; //contains the states chosen
                    $scope.EventName[0];//event chosen
                    var abbrevs = [];
                    angular.forEach($scope.Statemodel.value, function (state) {
                        abbrevs.push(state.STATE_ABBREV);
                    });
                    var abbrevString = abbrevs.join(', ');
                    var thisDate = $scope.formatDate($scope.genSummary.SUM_DATE);
                    //need: 
                    //1. all reports
                    REPORT.getFilteredReports({
                        Event: $scope.EventName[0].EVENT_ID, States: abbrevString, Date: thisDate
                    }).$promise.then(function (result) {
                        var test;
                        //for each report, get all reports with that event and state
                        for (var x = 0; x < result.length; x++) {
                            var evStReports = $scope.reports.filter(function (f) { return f.EVENT_ID == result[x].EVENT_ID && f.STATE == result[x].STATE; });
                            var thisRPModel = {};
                            thisRPModel.report = result[x]; var YesSWFsum = 0; var YesWQFsum = 0; var YesSWOsum = 0; var YesWQOsum = 0;
                            for (var t = 0; t < result.length; t++) { YesSWFsum += result[t].SW_YEST_FIELDPERS; };
                            for (var t = 0; t < result.length; t++) { YesWQFsum += result[t].WQ_YEST_FIELDPERS; };
                            for (var t = 0; t < result.length; t++) { YesSWOsum += result[t].SW_YEST_OFFICEPERS; };
                            for (var t = 0; t < result.length; t++) { YesWQOsum += result[t].WQ_YEST_OFFICEPERS; };

                            thisRPModel.FieldPYesSWTot = YesSWFsum;
                            thisRPModel.FieldPYesWQTot = YesWQFsum;
                            thisRPModel.OfficePYesSWTot = YesSWOsum;
                            thisRPModel.OfficePYesWQTot = YesWQOsum;

                            $scope.MetricDisplayModel.push(thisRPModel);
                        }//end forloop for ReportModelList
                        //2. this Event
                        $scope.GenRepEventModel = {};
                        $scope.GenRepEventModel.Event = $scope.EventName[0];
                        $scope.GenRepEventModel.EventType = $scope.eventTypes.filter(function (et) { return et.EVENT_TYPE_ID == $scope.EventName[0].EVENT_TYPE_ID; });
                        $scope.GenRepEventModel.EventStat = $scope.eventStats.filter(function (es) { return es.EVENT_STATUS_ID == $scope.EventName[0].EVENT_STATUS_ID; });
                        //3. event Coordinator info
                        $scope.GenRepEventModel.Coordinator = $scope.Submitter;
                        $scope.GenRepEventModel.CoordAgency = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.Submitter.AGENCY_ID; });

                        //modal
                        var modalInstance = $modal.open({
                            templateUrl: 'MetricsSummary.html',
                            size: 'lg',
                            windowClass: 'rep-dialog',
                            resolve: {
                                thisReport: function () {
                                    return $scope.MetricDisplayModel;
                                },
                                thisEvent: function () {
                                    return $scope.GenRepEventModel;
                                }
                            },
                            controller: function ($scope, thisReport, thisEvent) {
                                $scope.Report = thisReport;
                                $scope.Event = thisEvent;
                                $scope.ok = function () {
                                    
                                    $modalInstance.dismiss('cancel');
                                };
                            }
                        });
                        modalInstance.result.then(function () {
                            //nothing
                            
                        });
                        //end modal
                    });    
                }//end if valid = true
            }

            //clicked Display Contacts Summary, show content in new tab
            $scope.displayContactsSum = function (valid) {
                if (valid == true) {

                }
            }

            //clicked generate csv
            $scope.getCSVfile = function (valid) {
                if (valid == true) {
                    //get reports and give a csv file back
                    $http.defaults.headers.common['Accept'] = 'text/csv';
                    $http.defaults.headers.common['content-type'] = 'text/csv';
                    REPORT.getReportsCSV({ Event: $scope.genSummary.EVENT_ID, States: $scope.StateAbbrevs, Date: $scope.genSummary.SUM_DATE }).$promise.then(function (result) {
                        var blob = new Blob([result.data], { type: "text/plain;charset=utf-8" });
                        saveAs(blob, "report.csv");
                    }), function() { 
                        console.log('error'); 
                    }; 
                }
            }
            //#endregion Generate Report tab
        }
    }
    //#endregion Reporting Controller

    STNControllers.controller('ReportingDashCtrl', ['$scope', '$location', '$filter', '$modal', '$state', '$http', 'CONTACT', 'MEMBER', 'getCreds', 'allReportsAgain', ReportingDashCtrl]);
    function ReportingDashCtrl($scope, $location, $filter, $modal, $state, $http, CONTACT, MEMBER, getCreds, allReportsAgain) {
        $scope.reportsToDate = allReportsAgain;
        $scope.todayRpts = []; $scope.yesterdayRpts = []; $scope.pickDateRpts = []; $scope.pickAdateReports = false;
        $scope.today = new Date();
        $scope.today.setHours(0, 0, 0, 0);
        $scope.yesterday = new Date($scope.today);
        $scope.yesterday.setDate($scope.today.getDate() - 1);        
        $scope.THIS_DATE = {};
        //View Report button clicked, get stuff and make a pdf 
        $scope.ViewReport = function (r) {
            //modal
            var modalInstance = $modal.open({
                templateUrl: 'ViewReport.html',
                controller: 'ReportModalCtrl',
                size: 'lg',
                windowClass: 'rep-dialog',
                resolve: {
                    report: function () {
                        return r;
                    },
                    submitPerson: function () {
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                        $http.defaults.headers.common['Accept'] = 'application/json';
                        var member = {};
                        MEMBER.query({ id: r.MEMBER_ID }, function success(response) {
                            member.mem = response;
                            var memberAgency = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.Submitter.AGENCY_ID; });
                            member.AGENCY_NAME = memberAgency[0].AGENCY_NAME;
                            member.AGENCY_ADDRESS = memberAgency[0].ADDRESS + ", " + memberAgency[0].CITY + " " + memberAgency[0].STATE + " " + memberAgency[0].ZIP;
                        }).$promise;
                        return member;
                    },
                    depPerson: function () {
                        return CONTACT.query({ ReportMetric: r.REPORTING_METRICS_ID, ContactType: 1 }).$promise;
                    },
                    genPerson: function () {
                        return CONTACT.query({ ReportMetric: r.REPORTING_METRICS_ID, ContactType: 2 }).$promise;       
                    },
                    inlandPerson: function () {
                        return CONTACT.query({ ReportMetric: r.REPORTING_METRICS_ID, ContactType: 3 }).$promise;
                    },
                    coastPerson: function () {
                        return CONTACT.query({ ReportMetric: r.REPORTING_METRICS_ID, ContactType: 4 }).$promise;
                    },
                    waterPerson: function () {
                        return CONTACT.query({ ReportMetric: r.REPORTING_METRICS_ID, ContactType: 5 }).$promise;
                    }
                }
            });
            modalInstance.result.then(function (r) {                
                //nothing to do here
            });
            //end modal
        };//end ViewReport click

        //function call to add EVENT_NAME to list of reports
        function formatReport(repList) {
            var returnList = [];
            for (var i = 0; i < repList.length; i++) {
                var rep = repList[i];
                var event = $scope.events.filter(function (e) { return e.EVENT_ID == rep.EVENT_ID; });
                rep.EVENT_NAME = event[0].EVENT_NAME;
                returnList.push(rep);
            }
            return returnList;
        };

        var todayReports = $scope.reportsToDate.filter(function (todayrep) {
            var reportDate = new Date(todayrep.REPORT_DATE).setHours(0, 0, 0, 0);
            return new Date(reportDate).getTime() == $scope.today.getTime();
        });
        $scope.todayRpts = formatReport(todayReports);

        var yesterdayReports = $scope.reportsToDate.filter(function (yestrep) {
            var reportDate = new Date(yestrep.REPORT_DATE).setHours(0, 0, 0, 0);
            return new Date(reportDate).getTime() == $scope.yesterday.getTime();
        });
        $scope.yesterdayRpts = formatReport(yesterdayReports);
        
        //give me the reports done on this date
        $scope.getReportsByDate = function () {
            if ($scope.THIS_DATE.date != undefined) {
                var thisDateReports = $scope.reportsToDate.filter(function (tdate) {
                    var reportDate = new Date(tdate.REPORT_DATE).setHours(0, 0, 0, 0);
                    return new Date(reportDate).getTime() == $scope.THIS_DATE.date.getTime();
                });
                $scope.pickDateRpts = formatReport(thisDateReports);
                $scope.pickAdateReports = true;
            } else {
                alert("Pick a date first.");
            };

        }

        //complete the report button clicked -- send back to submit with report populated
        $scope.CompleteThisReport = function (rep) {
            $scope.$parent.newReport = rep;
            $scope.$parent.disabled = false; $scope.$parent.needToComplete = true;
            CONTACT.query({ ReportMetric: rep.REPORTING_METRICS_ID, ContactType: 1 }, function success(response) {    
                $scope.$parent.DeployStaff = response;
            }).$promise.then(function () {
                CONTACT.query({ ReportMetric: rep.REPORTING_METRICS_ID, ContactType: 2 }, function success(response) {
                    $scope.$parent.GenStaff = response;
                }).$promise.then(function () {
                    CONTACT.query({ ReportMetric: rep.REPORTING_METRICS_ID, ContactType: 3 }, function success(response) {
                        $scope.$parent.InlandStaff = response;
                    }).$promise.then(function () {
                        CONTACT.query({ ReportMetric: rep.REPORTING_METRICS_ID, ContactType: 4 }, function success(response) {
                            $scope.$parent.CoastStaff = response;
                        }).$promise.then(function () {
                            CONTACT.query({ ReportMetric: rep.REPORTING_METRICS_ID, ContactType: 5 }, function success(response) {
                                $scope.$parent.WaterStaff = response;
                            }).$promise.then(function () {
                                $state.go('reporting.submitReport');
                                //$location.path('/Reporting/SubmitReport');
                            });
                        });
                    });
                });
            });
        }

        //project alert text in modal
        $scope.getProjectAlertText = function (rep) {
            
            //need: 
            //1. thisReport
            $scope.ProjectAlertParts = {};
            $scope.ProjectAlertParts.Report = rep;
            //2. total of YEST FIELDPERS
            $scope.ProjectAlertParts.totYestFieldPers = rep.SW_YEST_FIELDPERS + rep.WQ_YEST_FIELDPERS;
            //3. total of OFFICEPERS
            $scope.ProjectAlertParts.totYestOfficPers = rep.SW_YEST_OFFICEPERS + rep.WQ_YEST_OFFICEPERS;
            //4. total TOT_CHECK_MEAS+TOT_DISCHARGE_MEAS
            $scope.ProjectAlertParts.measureCts = rep.TOT_CHECK_MEAS + rep.TOT_DISCHARGE_MEAS;
            //5. total states responding (all reports with this event_id, count of each state)
            var eventReports = $scope.reportsToDate.filter(function (r) { return r.EVENT_ID == rep.EVENT_ID; });
            var test = $filter('countBy')(eventReports, 'STATE');
            $scope.ProjectAlertParts.stateCount = 0;
            angular.forEach(test, function (er) {
                $scope.ProjectAlertParts.stateCount++;
            })
            //6. this event
            $scope.ProjectAlertParts.Event = $scope.events.filter(function (e) { return e.EVENT_ID == rep.EVENT_ID; });
                
            //modal
            var modalInstance = $modal.open({
                templateUrl: $scope.ProjectAlertParts.Event[0].EVENT_TYPE_ID == 1 ? 'FloodPA.html' : 'HurricanePA.html',
                controller: 'ProjAlertModalCtrl',
                size: 'md',
                windowClass: 'rep-dialog',
                resolve: {
                    ProjAlert: function () {
                        return $scope.ProjectAlertParts;
                    }
                }
            });
            modalInstance.result.then(function (r) {
                //nothing to do here
            });
            //end modal
        }

    }

    STNControllers.controller('SubmitReportCtrl', ['$scope', '$http', '$modal', '$state', 'getCreds', 'CONTACT', 'REPORT', SubmitReportCtrl]);
    function SubmitReportCtrl($scope, $http, $modal, $state, getCreds, CONTACT, REPORT) {
        //#make sure this clears except for if they care needing to complete a report
        if ($scope.$parent.needToComplete != true) {
            $scope.$parent.newReport = {};
        } 
        
        //reset it here so form will clear when they leave and come back.
        $scope.$parent.needToComplete = false; 

        if ($scope.newReport.REPORTING_METRICS_ID == undefined)
            $scope.disabled = true;

        //get this event name from the eventid
        $scope.getEventName = function (evID) {
            var name;
            var thisEvent = $scope.events.filter(function (e) { return e.EVENT_ID == evID; });
            name = thisEvent[0].EVENT_NAME;
            return name;
        }

        //#region GET Report Contacts
        var getReportContacts = function (reportID) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
            $http.defaults.headers.common['Accept'] = 'application/json';
            CONTACT.query({ ReportMetric: reportID, ContactType: 1 }, function success(response1) {
                $scope.DeployStaff = response1;
            }, function error(errorResponse1) {
                alert("Error: " + errorResponse1.statusText);
            }).$promise;
            CONTACT.query({ ReportMetric: reportID, ContactType: 2 }, function success(response2) {
                $scope.GenStaff = response2;
            }, function error(errorResponse2) {
                alert("Error: " + errorResponse2.statusText);
            }).$promise;
            CONTACT.query({ ReportMetric: reportID, ContactType: 3 }, function success(response3) {
                $scope.InlandStaff = response3;
            }, function error(errorResponse3) {
                alert("Error: " + errorResponse3.statusText);
            }).$promise;
            CONTACT.query({ ReportMetric: reportID, ContactType: 4 }, function success(response4) {
                $scope.CoastStaff = response4;
            }, function error(errorResponse4) {
                alert("Error: " + errorResponse4.statusText);
            }).$promise;
            CONTACT.query({ ReportMetric: reportID, ContactType: 5 }, function success(response5) {
                $scope.WaterStaff = response5;
            }, function error(errorResponse5) {
                alert("Error: " + errorResponse5.statusText);
            }).$promise;
            $scope.disabled = false;
        };
        //#endregion GET Report Contacts

        //#region POST Report Contacts
        var postReportContacts = function (reportID) {
            CONTACT.addReportContact({ contactTypeId: 1, reportId: reportID }, $scope.DeployStaff, function success(response1) {
                toastr.success("Deploy Staff Updated");
            }, function error(errorResponse1) {
                alert("Error: " + errorResponse1.statusText);
            }).$promise;
            if ($scope.GenStaff.LNAME != undefined) {
                CONTACT.addReportContact({ contactTypeId: 2, reportId: reportID }, $scope.GenStaff, function success(response2) {
                    toastr.success("General Staff Updated");
                }, function error(errorResponse2) {
                    alert("Error: " + errorResponse2.statusText);
                }).$promise;
            }
            if ($scope.InlandStaff.LNAME != undefined) {
                CONTACT.addReportContact({ contactTypeId: 3, reportId: reportID }, $scope.InlandStaff, function success(response3) {
                    toastr.success("Inland Staff Updated");
                }, function error(errorResponse3) {
                    alert("Error: " + errorResponse3.statusText);
                }).$promise;
            }
            if ($scope.CoastStaff.LNAME != undefined) {
                CONTACT.addReportContact({ contactTypeId: 4, reportId: reportID }, $scope.CoastStaff, function success(response4) {
                    toastr.success("Coastal Staff Updated");
                }, function error(errorResponse4) {
                    alert("Error: " + errorResponse4.statusText);
                }).$promise;
            }
            if ($scope.WaterStaff.LNAME != undefined) {
                CONTACT.addReportContact({ contactTypeId: 5, reportId: reportID }, $scope.WaterStaff, function success(response5) {
                    toastr.success("Water Staff Updated");
                }, function error(errorResponse5) {
                    alert("Error: " + errorResponse5.statusText);
                }).$promise;
            }
        };
        //#endregion POST Report Contacts

        var removeIncomplete = function () {
            //remove it from the list of incompletes
            var index = 0;
            for (var i = 0; i < $scope.memberIncompletes.length; i++) {
                if ($scope.memberIncompletes[i].REPORTING_METRICS_ID == $scope.newReport.REPORTING_METRICS_ID) {
                    index = i;
                    i = $scope.memberIncompletes.length;
                }
            }
            $scope.memberIncompletes.splice(index, 1);
        }
        //#region to Post/Put the Report and Report Contacts. Called twice (from within Modal (incomplete) and outside (complete))
        var PostPutReportAndReportContacts = function () {
            //POST or PUT
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
            $http.defaults.headers.common['Accept'] = 'application/json';
            if ($scope.newReport.REPORTING_METRICS_ID != undefined) {
                //PUT
                REPORT.update({ id: $scope.newReport.REPORTING_METRICS_ID }, $scope.newReport, function success(response) {
                    toastr.success("Report Updated");
                    $scope.newReport.EVENT_NAME = $scope.getEventName($scope.newReport.EVENT_ID);
                    if ($scope.newReport.COMPLETE == 1) {
                        removeIncomplete();   
                        $scope.isCompleted = true;
                    }                    
                    //then POST the ReportContacts
                    postReportContacts($scope.newReport.REPORTING_METRICS_ID);
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                }).$promise.then(function () {
                    $scope.fullReportForm.submit.$setPristine();
                    $scope.fullReportForm.submit.EVENT_ID.$viewValue = undefined;//needed for the changeState to not throw up leaving tab message
                    $state.go('reporting.reportDash');
                });
            } else {
                //POST
                REPORT.save($scope.newReport, function success(response) {
                    toastr.success("Report Created");
                    $scope.reports.push(response); //add to the list of all reports for filtering on the generate tab
                    if ($scope.newReport.COMPLETE == 1) {
                        removeIncomplete(); $scope.isCompleted = true;
                        $scope.newReport.EVENT_NAME = $scope.getEventName($scope.newReport.EVENT_ID);                        
                    }
                    //then POST the ReportContacts
                    $scope.newReport.REPORTING_METRICS_ID = response.REPORTING_METRICS_ID;
                    postReportContacts($scope.newReport.REPORTING_METRICS_ID);
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                }).$promise.then(function () {
                    $scope.fullReportForm.submit.$setPristine();
                    $scope.fullReportForm.submit.EVENT_ID.$viewValue = undefined; //needed for the changeState to not throw up leaving tab message
                    $state.go('reporting.reportDash');
                });
            }//end post
        };
        //#endregion to Post/Put the Report and Report Contacts. Called twice (from within Modal (incomplete) and outside (complete))

        //get values for Personnel Yesterdays, and Contacts (if report was done yesterday), and all counts for instruments & hwms
        $scope.populateYestTots = function () {
            if ($scope.newReport.REPORT_DATE != undefined && $scope.newReport.STATE != undefined && $scope.newReport.EVENT_ID != undefined) {
                var myDate = new Date($scope.newReport.REPORT_DATE);
                var theState = $scope.newReport.STATE;
                var eID = $scope.newReport.EVENT_ID;

                $scope.disabled = false;
                $scope.newReport = { REPORT_DATE: $scope.newReport.REPORT_DATE, STATE: theState, EVENT_ID: eID };
                $scope.DeployStaff = {}; $scope.GenStaff = {}; $scope.InlandStaff = {};
                $scope.CoastStaff = {}; $scope.WaterStaff = {};
                var previousDay = new Date(myDate);
                previousDay.setDate(myDate.getDate() - 1);
                previousDay.setHours(0, 0, 0, 0);
                var yesterdayRpt = $scope.reports.filter(function (r) {
                    var repDate = new Date(r.REPORT_DATE).setHours(0, 0, 0, 0);
                    return (r.EVENT_ID == $scope.newReport.EVENT_ID && r.STATE == $scope.newReport.STATE) &&
                        (new Date(repDate).getTime()) == (previousDay.getTime())
                });
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                if (yesterdayRpt.length > 0) {
                    // PERSONNEL populating
                    $scope.newReport.SW_YEST_FIELDPERS = yesterdayRpt[0].SW_TOD_FIELDPERS;
                    $scope.newReport.WQ_YEST_FIELDPERS = yesterdayRpt[0].WQ_TOD_FIELDPERS;
                    $scope.newReport.SW_YEST_OFFICEPERS = yesterdayRpt[0].SW_TOD_OFFICEPERS;
                    $scope.newReport.WQ_YEST_OFFICEPERS = yesterdayRpt[0].WQ_TOD_OFFICEPERS;

                    // CONTACTS populating 
                    getReportContacts(yesterdayRpt[0].REPORTING_METRICS_ID);
                }//end if
                //now get totals for all sensors and hwms to populate in this newReport
                REPORT.getDailyReportTots({ Date: $scope.newReport.REPORT_DATE, Event: $scope.newReport.EVENT_ID, State: $scope.newReport.STATE }, function success(response6) {
                    //only care about the counts
                    $scope.newReport.DEP_RAPDEPL_GAGE = response6.DEP_RAPDEPL_GAGE;
                    $scope.newReport.REC_RAPDEPL_GAGE = response6.REC_RAPDEPL_GAGE;
                    $scope.newReport.LOST_RAPDEPL_GAGE = response6.LOST_RAPDEPL_GAGE;
                    $scope.newReport.DEP_WTRLEV_SENSOR = response6.DEP_WTRLEV_SENSOR;
                    $scope.newReport.REC_WTRLEV_SENSOR = response6.REC_WTRLEV_SENSOR;
                    $scope.newReport.LOST_WTRLEV_SENSOR = response6.LOST_WTRLEV_SENSOR;
                    $scope.newReport.DEP_WV_SENS = response6.DEP_WV_SENS;
                    $scope.newReport.REC_WV_SENS = response6.REC_WV_SENS;
                    $scope.newReport.LOST_WV_SENS = response6.LOST_WV_SENS;
                    $scope.newReport.DEP_BAROMETRIC = response6.DEP_BAROMETRIC;
                    $scope.newReport.REC_BAROMETRIC = response6.REC_BAROMETRIC;
                    $scope.newReport.LOST_BAROMETRIC = response6.LOST_BAROMETRIC;
                    $scope.newReport.DEP_METEOROLOGICAL = response6.DEP_METEOROLOGICAL;
                    $scope.newReport.REC_METEOROLOGICAL = response6.REC_METEOROLOGICAL;
                    $scope.newReport.LOST_METEOROLOGICAL = response6.LOST_METEOROLOGICAL;
                    $scope.newReport.HWM_FLAGGED = response6.HWM_FLAGGED;
                    $scope.newReport.HWM_COLLECTED = response6.HWM_COLLECTED;
                }, function error(errorResponse6) {
                    alert("Error: " + errorResponse6.statusText);
                });
            }
            else {
                alert("Please choose a date, event and state first.");
            }
        }; // end populateYestTots

        //save this report and it's contacts
        $scope.saveReport = function (valid) {
            if (valid == false) {
                alert("All fields are required");
            } else {
                //see if they checked the box to complete
                if ($scope.newReport.COMPLETE == undefined || $scope.newReport.COMPLETE == 0) {
                    //modal confirming they want to save this without marking it complete
                    var modalInstance = $modal.open({
                        templateUrl: 'saveReportModal.html',
                        controller: 'ConfirmReportModalCtrl',
                        size: 'sm'
                    });
                    modalInstance.result.then(function () {
                        //yes, post this as incomplete
                        $scope.newReport.COMPLETE = 0;
                        $scope.newReport.MEMBER_ID = $scope.Submitter.MEMBER_ID;
                        PostPutReportAndReportContacts();
                    });//end modalInstance.result.then
                } else {
                    //the report is complete, just post/put it                        
                    $scope.newReport.MEMBER_ID = $scope.Submitter.MEMBER_ID;
                    PostPutReportAndReportContacts();
                }
            }//end valid == true
        };

        //incomplete report was clicked, go get it and the contacts for it
        $scope.getIncompleteReport = function (reportID) {
            var reportID = this.ir.REPORTING_METRICS_ID;
            REPORT.query({ id: reportID }, function success(response) {
                $scope.newReport = response;
                $scope.fullReportForm.submit.$setDirty();
                //get contacts 
                getReportContacts(reportID);
            }).$promise;
        }
        //#endregion Submit Report tab
    }

    //#region Settings Controller
    STNControllers.controller('SettingsCtrl', ['$scope', '$location', '$state', '$rootScope', 'checkCreds', 'deleteCreds', SettingsCtrl]);
    function SettingsCtrl($scope, $location, $state, $rootScope, checkCreds, deleteCreds) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.settings = "Welcome to the new STN Settings Page!!";
            $scope.changeView = function (view) {
                $state.go(view);
            }
        }
    }
    //#endregion Settings Controller

    //#region member Controller (abstract)
    STNControllers.controller('memberCtrl', ['$scope', '$location', '$state', '$http', '$filter', 'MEMBER', 'allMembers', 'allRoles', 'allAgencies', 'checkCreds', 'setCreds', 'getCreds', 'getUserRole', 'getUsersNAME', 'getUserID', memberCtrl]);
    function memberCtrl($scope, $location, $state, $http, $filter, MEMBER, allMembers, allRoles, allAgencies, checkCreds, setCreds, getCreds, getUserRole, getUsersNAME, getUserID) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //all things both new and existing member page will need
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

            $scope.accountUser = {};
            $scope.accountUser.Name = getUsersNAME(); //User's NAME
            $scope.accountUser.ID = getUserID();
            $scope.accountUser.Role = getUserRole();

            $scope.roleList = allRoles;
            $scope.agencyList = allAgencies;
            $scope.memberList = [];
            for (var x = 0; x < allMembers.length; x++) {
                var M = {};
                M.MEMBER_ID = allMembers[x].MEMBER_ID;
                M.Name = allMembers[x].FNAME + " " + allMembers[x].LNAME;
                var ag = $scope.agencyList.filter(function (a) { return a.AGENCY_ID == allMembers[x].AGENCY_ID; });
                var ro = $scope.roleList.filter(function (r) { return r.ROLE_ID == allMembers[x].ROLE_ID; });
                M.Agency = ag[0].AGENCY_NAME;
                M.Role = ro[0].ROLE_NAME;

                $scope.memberList.push(M);
            }
           
        }
    }
    //#endregion  member Controller (abstract)

    //#region memberInfo Controller
    STNControllers.controller('memberInfoCtrl', ['$scope', '$location', '$state', '$http', '$modal', '$stateParams', '$filter', 'MEMBER', 'thisMember', 'checkCreds', 'setCreds', 'getCreds', 'getUserRole', 'getUsersNAME', 'getUserID', memberInfoCtrl]);
    function memberInfoCtrl($scope, $location, $state, $http, $modal, $stateParams, $filter, MEMBER, thisMember, checkCreds, setCreds, getCreds, getUserRole, getUsersNAME, getUserID) {
        if (!checkCreds()) {
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    
                    MEMBER.deleteMember({ id: nameToRemove.MEMBER_ID }, function success(response) {
                        var delMem = {};
                        delMem.MEMBER_ID = nameToRemove.MEMBER_ID;
                        delMem.Name = nameToRemove.FNAME + " " + nameToRemove.LNAME;
                        var ag = $scope.agencyList.filter(function (a) { return a.AGENCY_ID == nameToRemove.AGENCY_ID; });
                        var ro = $scope.roleList.filter(function (r) { return r.ROLE_ID == nameToRemove.ROLE_ID; });
                        delMem.Agency = ag[0].AGENCY_NAME;
                        delMem.Role = ro[0].ROLE_NAME;
                        $scope.memberList.splice($scope.memberList.indexOf(delMem), 1);
                        toastr.success("Member Deleted");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        $scope.$apply();
                        $location.path('/Members/MembersList').replace();
                    });
                });
                //end modal
            }
            //#endregion DELETE Member click

            $scope.pass = {
                newP: '',
                confirmP: ''
            };
            $scope.newPass = "";

            //is this creating new member or editing existing?
            if (thisMember != undefined) {

                //check to see if the acct User is the same as the user they are looking at
                $scope.matchingUsers = $stateParams.id == $scope.accountUser.ID ? true : false;            

                $scope.aMember = thisMember;
                $scope.changePass = false;
                
                //change to the user made, put it .. fired on each blur after change made to field
                $scope.SaveOnBlur = function () {
                    if ($scope.aMember) {
                        //ensure they don't delete required field values
                        if ($scope.aMember.FNAME != null) {
                            $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                            $http.defaults.headers.common['Accept'] = 'application/json';
                            MEMBER.update({ id: $scope.aMember.MEMBER_ID }, $scope.aMember, function success(response) {
                                toastr.success("Member Updated");
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            });
                        }
                    }
                }//end SaveOnBlur

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
                                //update creds
                                setCreds($scope.aMember.USERNAME, $scope.pass.newP, $scope.accountUser.Name, $scope.aMember.ROLE_ID, $scope.aMember.MEMBER_ID);
                                $scope.changePass = false;
                                $scope.pass.newP = '';
                                $scope.pass.confirmP = '';
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    };
                }

                $scope.DontChangePass = function () {
                    //nevermind,  clear input
                    $scope.changePass = false;
                };
            } //end of $stateParams > 0 (existing)
            else {
                //this is a new member being created
                $scope.save = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                        $http.defaults.headers.common['Accept'] = 'application/json';

                        MEMBER.addMember({ pass: $scope.pass.confirmP}, $scope.aMember, function success(response) {
                            toastr.success("Member Created");
                            //push this new member into the memberList
                            var nm = {};
                            nm.MEMBER_ID = response.MEMBER_ID;
                            nm.Name = response.FNAME + " " + response.LNAME;
                            var ag = $scope.agencyList.filter(function (a) { return a.AGENCY_ID == response.AGENCY_ID; });
                            var ro = $scope.roleList.filter(function (r) { return r.ROLE_ID == response.ROLE_ID; });
                            nm.Agency = ag[0].AGENCY_NAME;
                            nm.Role = ro[0].ROLE_NAME;                            
                            $scope.memberList.push(nm);
                        }).$promise.then(function () {
                            $scope.$apply();
                            $location.path('/Members/MembersList').replace();                            
                        });
                        
                    }
                }
            }
        }
    }
    //#endregion memberInfo Controller

    //#region event Controller (abstract)
    STNControllers.controller('eventCtrl', ['$scope', '$location', '$state', '$http', '$filter', 'EVENT', 'allEvents', 'allEventTypes', 'allEventStats', 'allMembers', 'checkCreds', 'setCreds', 'getCreds', 'getUserRole', 'getUsersNAME', 'getUserID', eventCtrl]);
    function eventCtrl($scope, $location, $state, $http, $filter, EVENT, allEvents, allEventTypes, allEventStats, allMembers, checkCreds, setCreds, getCreds, getUserRole, getUsersNAME, getUserID) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.loggedInRole = getUserRole();
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
            $scope.eventCoordList = allMembers;

            $scope.eventList = [];
            for (var x = 0; x < allEvents.length; x++) {
                var E = {};
                E.EVENT_ID = allEvents[x].EVENT_ID;
                E.Name = allEvents[x].EVENT_NAME;
                var type = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == allEvents[x].EVENT_TYPE_ID; });
                var stat = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == allEvents[x].EVENT_STATUS_ID; });
                var coord = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == allEvents[x].EVENT_COORDINATOR; });
                E.Type = type[0].TYPE;
                E.Status = stat[0].STATUS;
                E.StartDate = allEvents[x].EVENT_START_DATE;
                E.EndDate = allEvents[x].EVENT_END_DATE;
                E.Coord = coord.length > 0 ? coord[0].FNAME + " " + coord[0].LNAME : "";

                $scope.eventList.push(E);
            }            
        }
    }
    //#endregion  event Controller (abstract)

    //#region eventInfo Controller
    STNControllers.controller('eventInfoCtrl', ['$scope', '$location', '$state', '$http', '$modal', '$filter', 'EVENT', 'thisEvent', 'checkCreds', 'setCreds', 'getCreds', 'getUserRole', 'getUserID', eventInfoCtrl]);
    function eventInfoCtrl($scope, $location, $state, $http, $modal, $filter, EVENT, thisEvent, checkCreds, setCreds, getCreds, getUserRole, getUserID) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //all things both new and existing events page will need

            //#region Datepicker
            $scope.datepickrs = {
                //projStDate: false,
                //projEndDate: false
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();

                    EVENT.delete({ id: nameToRemove.EVENT_ID }, function success(response) {
                        var delEv = {}; 
                        delEv.EVENT_ID = nameToRemove.EVENT_ID;
                        delEv.Name = nameToRemove.EVENT_NAME;
                        var type = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == nameToRemove.EVENT_TYPE_ID; });
                        var stat = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == nameToRemove.EVENT_STATUS_ID; });
                        var coord = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == nameToRemove.EVENT_COORDINATOR; });
                        delEv.Type = type[0].TYPE;
                        delEv.Status = stat[0].STATUS;
                        delEv.StartDate = nameToRemove.EVENT_START_DATE;
                        delEv.EndDate = nameToRemove.EVENT_END_DATE;
                        delEv.Coord = coord.length > 0 ? coord[0].FNAME + " " + coord[0].LNAME : "";
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
                        $scope.$apply();
                        $location.path('/Events/EventsList').replace();
                    });
                });
                //end modal
            }
            //#endregion DELETE Event click

            if (thisEvent != undefined) {
                $scope.anEvent = thisEvent;
                var ET = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == thisEvent.EVENT_TYPE_ID; });
                var ES = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == thisEvent.EVENT_STATUS_ID; });
                var EC = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == thisEvent.EVENT_COORDINATOR; });
                $scope.thisEventType = ET[0].TYPE;
                $scope.thisEventStatus = ES[0].STATUS;
                $scope.thisEventCoord = EC[0] != undefined ? EC[0].FNAME + " " + EC[0].LNAME : "";

                //change to the user made, put it .. fired on each blur after change made to field
                $scope.SaveOnBlur = function () {
                    if ($scope.anEvent) {
                        //ensure they don't delete required field values
                        if ($scope.anEvent.EVENT_NAME != null) {
                            $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                            $http.defaults.headers.common['Accept'] = 'application/json';
                            EVENT.update({ id: $scope.anEvent.EVENT_ID }, $scope.anEvent, function success(response) {
                                toastr.success("Event Updated");
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            });
                        }
                    }
                }//end SaveOnBlur

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
                            var type = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == response.EVENT_TYPE_ID; });
                            var stat = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == response.EVENT_STATUS_ID; });
                            var coord = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == response.EVENT_COORDINATOR; });
                            E.Type = type[0].TYPE;
                            E.Status = stat[0].STATUS;
                            E.StartDate = response.EVENT_START_DATE;
                            E.EndDate = response.EVENT_END_DATE;
                            E.Coord = coord.length > 0 ? coord[0].FNAME + " " + coord[0].LNAME : "";

                            $scope.eventList.push(E);
                        }).$promise.then(function () {
                            $scope.$apply();
                            $location.path('/Events/EventsList').replace();
                        });

                    }
                }//end $scope.save()
            }//end else (anEvent == undefined -new
        }//end else (checkCreds())
    }
    //#endregion eventInfo Controller

    //#region resource Controller (abstract)
    STNControllers.controller('resourcesCtrl', ['$scope', '$location', '$state', '$http', '$filter', '$modal', 'AGENCY', 'CONTACT_TYPE', 'DEPLOYMENT_PRIORITY', 'EVENT_STATUS',
        'EVENT_TYPE', 'FILE_TYPE', 'HORIZONTAL_COLL_METHODS', 'HORIZONTAL_DATUM', 'HOUSING_TYPE', 'HWM_QUALITY', 'HWM_TYPE', 'INST_COLL_CONDITION', 'MARKER', 'NETWORK_NAME', 'OP_QUALITY',
        'OP_TYPE', 'SENSOR_BRAND', 'DEPLOYMENT_TYPE', 'SENSOR_TYPE', 'NETWORK_TYPE', 'STATUS_TYPE', 'VERTICAL_COLL_METHOD', 'VERTICAL_DATUM', 'allStates', 'allAgencies', 'allContactTypes', 'allDeployPriorities', 'allEventStats', 'allEventTypes',
        'allFileTypes', 'allHorCollMethods', 'allHorDatums', 'allHouseTypes', 'allHWMqualities', 'allHWMtypes', 'allInstCollectConditions', 'allMarkers', 'allNetworkNames', 'allObjPtQualities',
        'allObjPtTypes', 'allSensorBrands', 'allDeploymentTypes', 'allStatusTypes', 'allSensorTypes', 'allNetworkTypes', 'allVerticalCollMethods', 'allVerticalDatums',
        'checkCreds', 'getCreds', 'getUserRole', resourcesCtrl]);
    function resourcesCtrl($scope, $location, $state, $http, $filter, $modal, AGENCY, CONTACT_TYPE, DEPLOYMENT_PRIORITY, EVENT_STATUS,
        EVENT_TYPE, FILE_TYPE, HORIZONTAL_COLL_METHODS, HORIZONTAL_DATUM, HOUSING_TYPE, HWM_QUALITY, HWM_TYPE, INST_COLL_CONDITION, MARKER, NETWORK_NAME, OP_QUALITY,
        OP_TYPE, SENSOR_BRAND, DEPLOYMENT_TYPE, SENSOR_TYPE,NETWORK_TYPE, STATUS_TYPE, VERTICAL_COLL_METHOD, VERTICAL_DATUM, allStates, allAgencies, allContactTypes, allDeployPriorities, allEventStats, allEventTypes, allFileTypes,
        allHorCollMethods, allHorDatums, allHouseTypes, allHWMqualities, allHWMtypes, allInstCollectConditions, allMarkers, allNetworkNames, allObjPtQualities, allObjPtTypes,
        allSensorBrands, allDeploymentTypes, allStatusTypes, allSensorTypes, allNetworkTypes, allVerticalCollMethods, allVerticalDatums,
        checkCreds, getCreds, getUserRole) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.accountRole = getUserRole();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    CONTACT_TYPE.delete({ id: ct.CONTACT_TYPE_ID }, ct, function success(response) {
                        $scope.contactTypeList.splice(index, 1);
                        toastr.success("Contact Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    DEPLOYMENT_PRIORITY.delete({ id: dp.PRIORITY_ID }, dp, function success(response) {
                        $scope.deployPriorityList.splice(index, 1);
                        toastr.success("Deployment Priority Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    EVENT_STATUS.delete({ id: es.EVENT_STATUS_ID }, es, function success(response) {
                        $scope.eventStatList.splice(index, 1);
                        toastr.success("Event Status Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    EVENT_TYPE.delete({ id: et.EVENT_TYPE_ID }, et, function success(response) {
                        $scope.eventTypeList.splice(index, 1);
                        toastr.success("Event Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    FILE_TYPE.delete({ id: ft.FILETYPE_ID }, ft, function success(response) {
                        $scope.fileTypeList.splice(index, 1);
                        toastr.success("File Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                            return hcm
                        },
                        what: function () {
                            return "Horizontal Collection Method";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.horColMethList.indexOf(hcm);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    HORIZONTAL_COLL_METHODS.delete({ id: hcm.HCOLLECT_METHOD_ID }, hcm, function success(response) {
                        $scope.horColMethList.splice(index, 1);
                        toastr.success("Horizontal Collection Method Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    HORIZONTAL_DATUM.delete({ id: hd.DATUM_ID }, hd, function success(response) {
                        $scope.horDatList.splice(index, 1);
                        toastr.success("Horizontal Datum Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    HOUSING_TYPE.delete({ id: ht.HOUSING_TYPE_ID }, ht, function success(response) {
                        $scope.houseTypeList.splice(index, 1);
                        toastr.success("Housing Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    HWM_QUALITY.delete({ id: hwmq.HWM_QUALITY_ID }, hwmq, function success(response) {
                        $scope.hwmQualList.splice(index, 1);
                        toastr.success("HWM Quality Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    HWM_TYPE.delete({ id: hwmt.HWM_TYPE_ID }, hwmt, function success(response) {
                        $scope.hwmTypeList.splice(index, 1);
                        toastr.success("HWM Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    INST_COLL_CONDITION.delete({ id: icc.ID }, icc, function success(response) {
                        $scope.instColCondList.splice(index, 1);
                        toastr.success("Instrument Collection Condition Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                            return m
                        },
                        what: function () {
                            return "Marker";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.markList.indexOf(m);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    MARKER.delete({ id: m.MARKER_ID }, m, function success(response) {
                        $scope.markList.splice(index, 1);
                        toastr.success("Marker Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    NETWORK_NAME.delete({ id: nn.NETWORK_NAME_ID }, nn, function success(response) {
                        $scope.netNameList.splice(index, 1);
                        toastr.success("Network Name Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    OP_QUALITY.delete({ id: opq.OP_QUALITY_ID }, opq, function success(response) {
                        $scope.opQualList.splice(index, 1);
                        toastr.success("Objective Point Quality Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    OP_TYPE.delete({ id: opt.OBJECTIVE_POINT_TYPE_ID }, opt, function success(response) {
                        $scope.opTypeList.splice(index, 1);
                        toastr.success("Objective Point Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                            return sb
                        },
                        what: function () {
                            return "Sensor Brand";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.sensBrandList.indexOf(sb);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    SENSOR_BRAND.delete({ id: sb.SENSOR_BRAND_ID }, sb, function success(response) {
                        $scope.sensBrandList.splice(index, 1);
                        toastr.success("Sensor Brand Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    DEPLOYMENT_TYPE.delete({ id: dt.DEPLOYMENT_TYPE_ID }, dt, function success(response) {
                        $scope.depTypeList.splice(index, 1);
                        toastr.success("Deployment Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    STATUS_TYPE.delete({ id: statT.STATUS_TYPE_ID }, statT, function success(response) {
                        $scope.statTypeList.splice(index, 1);
                        toastr.success("Status Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
            //#endregion StatusType Add/Update/Delete

            //#region SensorType Add/Update/Delete
            $scope.sensTypeList = allSensorTypes;// allSensorTypes; //senT
            $scope.newDepTypeRelating = [];
            $scope.commaSepDepMETHODS = []
            
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
                })
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
                            var deleteDep = $scope.depTypeList.filter(function (dt) { return dt.DEPLOYMENT_TYPE_ID == oc });
                            //make sure you don't add it twice
                            if ($scope.removeTheseDepTypes.length > 0) {
                                for (var d = 0; d < $scope.removeTheseDepTypes.length; d++) {
                                    if ($scope.removeTheseDepTypes[d].DEPLOYMENT_TYPE_ID == deleteDep[0].DEPLOYMENT_TYPE_ID) {
                                        //forgettabout it
                                        d = $scope.newDepTypeRelating.length;
                                        } else {
                                            $scope.removeTheseDepTypes.push(deleteDep[0]);
                                    }
                                }
                            } else {
                                $scope.removeTheseDepTypes.push(deleteDep[0]);
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
                $scope.newDepTypeRelating =[];
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                //pull out just the sensor and then the deployment type to post separately
                var ST = {SENSOR_TYPE_ID: data.SENSOR_TYPE_ID, SENSOR: data.SENSOR};
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
                        }, function error (errorResponse1) {
                            var what = errorResponse1.statusText;
                        });
                    })
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();

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
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    NETWORK_TYPE.delete({ id: nt.NETWORK_TYPE_ID }, nt, function success(response) {
                        $scope.netTypeList.splice(index, 1);
                        toastr.success("Network Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    VERTICAL_COLL_METHOD.delete({ id: vcm.VCOLLECT_METHOD_ID }, vcm, function success(response) {
                        $scope.vertColMethList.splice(index, 1);
                        toastr.success("Vertical Collection Method Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
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
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
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
                            return vd
                        },
                        what: function () {
                            return "Vertical Datum";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.vertDatList.indexOf(vd);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    VERTICAL_DATUM.delete({ id: vd.DATUM_ID }, vd, function success(response) {
                        $scope.vertDatList.splice(index, 1);
                        toastr.success("Vertical Datum Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }
            //#endregion VertDatum Add/Update/Delete
            //#endregion ALL LOOKUPS (add/update/delete)
        }
    }
    //#endregion  resources Controller (abstract)

    //#region MODALS  
    //popup confirm box
    STNControllers.controller('ConfirmModalCtrl', ['$scope', '$modalInstance', 'nameToRemove', 'what', ConfirmModalCtrl]);
    function ConfirmModalCtrl($scope, $modalInstance, nameToRemove, what) {
        switch (what) {
            case "Member":
                $scope.nameToRmv = nameToRemove.FNAME + " " + nameToRemove.LNAME;
                break;
            case "Event":
                $scope.nameToRmv = nameToRemove.EVENT_NAME;
                break;
            case "Agency":
                $scope.nameToRmv = nameToRemove.AGENCY_NAME;
                break;
            case "Contact Type":
                $scope.nameToRmv = nameToRemove.TYPE;
                break;
            case "Deployment Priority":
                $scope.nameToRmv = nameToRemove.PRIORITY_NAME;
                break;
            case "Event Status":
                $scope.nameToRmv = nameToRemove.STATUS;
                break;
            case "File Type":
                $scope.nameToRmv = nameToRemove.FILETYPE;
                break;
            case "Horizontal Collection Method":
                $scope.nameToRmv = nameToRemove.HCOLLECT_METHOD;
                break;
            case "Horizontal Datum":
                $scope.nameToRmv = nameToRemove.DATUM_NAME;
                break;
            case "Housing Type":
                $scope.nameToRmv = nameToRemove.TYPE_NAME;
                break;
            case "HWM Quality":
                $scope.nameToRmv = nameToRemove.HWM_QUALITY;
                break;
            case "HWM Type":
                $scope.nameToRmv = nameToRemove.HWM_TYPE;
                break;
            case "Instrument Collection Condition":
                $scope.nameToRmv = nameToRemove.CONDITION;
                break;
            case "Marker":
                $scope.nameToRmv = nameToRemove.MARKER1;
                break;
            case "Network Name":
                $scope.nameToRmv = nameToRemove.NAME;
                break;
            case "Objective Point Quality":
                $scope.nameToRmv = nameToRemove.QUALITY;
                break;
            case "Objective Point Type":
                $scope.nameToRmv = nameToRemove.OP_TYPE;
                break;
            case "Sensor Brand":
                $scope.nameToRmv = nameToRemove.BRAND_NAME;
                break;
            case "Deployment Type":
                $scope.nameToRmv = nameToRemove.METHOD;
                break;
            case "Status Type":
                $scope.nameToRmv = nameToRemove.STATUS;
                break;
            case "Sensor Type":
                $scope.nameToRmv = nameToRemove.SENSOR;
                break;
            case "Network Type":
                $scope.nameToRmv = nameToRemove.NETWORK_TYPE_NAME;
                break;
            case "Vertical Collection Method":
                $scope.nameToRmv = nameToRemove.VCOLLECT_METHOD;
                break;
            case "Vertical Datum":
                $scope.nameToRmv = nameToRemove.DATUM_ABBREVIATION;
                break;
        }
        
        $scope.what = what;

        $scope.ok = function () {
            $modalInstance.close(nameToRemove);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    //popup confirm box
    STNControllers.controller('ConfirmReportModalCtrl', ['$scope', '$modalInstance', ConfirmReportModalCtrl]);
    function ConfirmReportModalCtrl($scope, $modalInstance) {

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    STNControllers.controller('ReportModalCtrl', ['$scope', '$modalInstance', 'report', 'submitPerson', 'depPerson', 'genPerson', 'inlandPerson', 'coastPerson', 'waterPerson', ReportModalCtrl]);
    function ReportModalCtrl($scope, $modalInstance, report, submitPerson, depPerson, genPerson, inlandPerson, coastPerson, waterPerson) {
        $scope.ReportView = {};
        $scope.ReportView.Report = report;
        $scope.ReportView.submitter = submitPerson;
        $scope.ReportView.deployStaff = depPerson;
        $scope.ReportView.generalStaff = genPerson;
        $scope.ReportView.inlandStaff = inlandPerson;
        $scope.ReportView.coastStaff = coastPerson;
        $scope.ReportView.waterStaff = waterPerson;
        
        $scope.ok = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    STNControllers.controller('ProjAlertModalCtrl', ['$scope', '$modalInstance', 'ProjAlert', ProjAlertModalCtrl]);
    function ProjAlertModalCtrl($scope, $modalInstance, ProjAlert) {
        $scope.ProjAlertParts = ProjAlert;
        $scope.ok = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    //STNControllers.controller('MetricSumModalCtrl', ['$scope', '$modalInstance', 'thisReport', 'thisEvent', MetricSumModalCtrl]);
    //function MetricSumModalCtrl($scope, $modalInstance, thisReport, thisEvent) {
    //    $scope.Report = thisReport;
    //    $scope.Event = thisEvent;
    //    $scope.ok = function () {
    //        $modalInstance.dismiss('cancel');
    //    };
    //}

    //#endregion MODALS

    //#region LOGIN/OUT
    //login 'setLoggedIn',
    STNControllers.controller('LoginCtrl', ['$scope', '$state', '$http', '$rootScope', 'Login', 'setCreds', LoginCtrl]);
    function LoginCtrl($scope, $state, $http, $rootScope, Login, setCreds) {

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
                        setCreds($scope.username, $scope.password, usersNAME, user.ROLE_ID, user.MEMBER_ID);
                        //setLoggedIn.changeLoggedIn(true);
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
                    alert("Error: " + errorResponse.statusText);
                }
            );
        };
    }

    //logOut
    STNControllers.controller('LogoutCtrl', ['$scope', '$location', 'deleteCreds', LogoutCtrl]);
    function LogoutCtrl($scope, $location, deleteCreds) {
        $scope.logout = function () {
            deleteCreds();
            $location.path('/login');
        }
    };
    //#endregion LOGIN/OUT

})();