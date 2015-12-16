(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var STNControllers = angular.module('STNControllers', []);

    //#region $ccokies variables
    /*
    * STNCreds, STNUsername, usersName, mID, usersRole, SessionEventID, SessionEventName, SessionTeaID, SessionTeamName
    */
    //#endregion $ccokies variables

    //#region CONSTANTS
    var utcDateTime = function () {
        var getMonth = function (mo) {
            switch (mo) {
                case 'Jan':
                    return '01';
                    break;
                case 'Feb':
                    return '02';
                    break;
                case 'Mar':
                    return '03';
                    break;
                case 'Apr':
                    return '04';
                    break;
                case 'May':
                    return '05';
                    break;
                case 'Jun':
                    return '06';
                    break;
                case 'Jul':
                    return '07';
                    break;
                case 'Aug':
                    return '08';
                    break;
                case 'Sep':
                    return '09';
                    break;
                case 'Oct':
                    return '10';
                    break;
                case 'Nov':
                    return '11';
                    break;
                case 'Dec':
                    return '12';
                    break;
            }
    }
        var Time_Stamp = new Date().toUTCString();// "Wed, 09 Dec 2015 17:18:26 GMT" == change to standard time for storage
        var mo = Time_Stamp.substr(8, 3);
        var actualMo = getMonth(mo);
        var day = Time_Stamp.substr(5, 2);
        var year = Time_Stamp.substr(12, 4);
        var hr = Time_Stamp.substr(17,2);
        var standardHrs = hr > 12 ? '0'+(hr-12).toString() : hr.toString();
        var min = Time_Stamp.substr(20, 2);
        var sec = Time_Stamp.substr(23, 2);;
        var amPm = hr > 12 ? 'PM' : 'AM';
        var time_stampNEW = actualMo + '/' + day + '/' + year + ' ' + standardHrs + ':' + min + ':' + sec + ' ' + amPm; //12/09/2015 04:22:32PM
        return time_stampNEW;
    }
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

    //This directive allows us to pass a function in on an enter key to do what we want.
    STNControllers.directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    });

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
        };
    });

    STNControllers.directive('focus', function () {
        return function (scope, element, attributes) {
            element[0].focus();
        };
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
        };
    });

    //validate password
    STNControllers.directive('passwordValidate', ['RegExp', function (regex) {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                elm.unbind('keydown').unbind('change');
                elm.bind('blur', function (viewValue) {
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
    }]);

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

    //STNControllers.directive('tooltip', function () {
    //    return {
    //        restrict: 'A',
    //        link: function (scope, element, attrs) {
    //            $(element).hover(function () {
    //                // on mouseenter
    //                $(element).tooltip('show');
    //            }, function () {
    //                // on mouseleave
    //                $(element).tooltip('hide');
    //            });
    //        }
    //    };
    //});

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
        };
    });

    //bind file upload file to a model scope var
    STNControllers.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

    //STNControllers.directive('datetimez', function () {
    //    //http://tarruda.github.io/bootstrap-datetimepicker/#api  -- can't get it working right now
    //    return {
    //        restrict: 'A',
    //        require: 'ngModel',
    //        link: function (scope, element, attrs, ngModelCtrl) {
    //            element.datetimepicker({
    //                dateFormat: 'dd/MM/yyyy hh:mm:ss',
    //                language: 'pt-BR'
    //            }).on('changeDate', function (e) {
    //                ngModelCtrl.$setViewValue(e.date);
    //                scope.$apply();
    //            });
    //        }
    //    };
    //});
    //#endregion DIRECTIVES

    //#region MAIN Controller 
    STNControllers.controller('mainCtrl', ['$scope', '$rootScope', '$cookies', '$uibModal', '$location', '$state', mainCtrl]);
    function mainCtrl($scope, $rootScope, $cookies, $uibModal, $location, $state) {
        $rootScope.isAuth = {};        
        $rootScope.activeMenu = 'home'; //scope var for setting active class
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $rootScope.isAuth.val = false;
            $location.path('/login');
        } else {
            $rootScope.isAuth.val = true;
            $rootScope.usersName = $cookies.get('usersName');
            $rootScope.userID = $cookies.get('mID');
            var EventName = $cookies.get('SessionEventName');
            if (EventName != null)
                $rootScope.sessionEvent = "Session Event: " + EventName + "."; 
           // $rootScope.sessionTeam = "";
            $state.go('home');

            $scope.status = {
                isopen: false
            };
            $scope.toggleDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };
        }
    }
    //#endregion MAIN Controller

    //#region EventSession
    STNControllers.controller('EventSessionCtrl', ['$scope', '$rootScope', '$cookies', '$uibModal', '$location', '$state', 'EVENT', 'EVENT_TYPE', 'STATE', EventSessionCtrl]);
    function EventSessionCtrl($scope, $rootScope, $cookies, $uibModal, $location, $state, EVENT, EVENT_TYPE, STATE) {
        $scope.openEventModal = function () {
            $(".page-loading").removeClass("hidden");
            //modal
            var modalInstance = $uibModal.open({
                templateUrl: 'ChooseEvent.html',
                controller: 'SessionEventmodalCtrl',
                size: 'md',
                backdrop: 'static',
                windowClass: 'rep-dialog',
                resolve: {
                    allEvents: function () {
                        return EVENT.getAll().$promise;
                    },
                    allEventTypes: function () {
                        return EVENT_TYPE.getAll().$promise;
                    },
                    allStates: function () {
                        return STATE.getAll().$promise;
                    }
                }
            });
            modalInstance.result.then(function (r) {
                //nothing to do here
            });
        };

    }
    //#endregion EventSession

    //#region HELP Controller
    STNControllers.controller('helpCtrl', ['$scope', helpCtrl]);
    function helpCtrl($scope) {
        $scope.helpInfo = {};
        $scope.helpInfo.fact = "Some really interesting help will be here.";
    }
    //#endregion HELP Controller

    //#region NAV Controller
    //STNControllers.controller('navCtrl', ['$scope', '$cookies', '$location', '$rootScope', navCtrl]);
    //function navCtrl($scope, $cookies, $location, $rootScope) {
    //    //$scope.logout = function () {
    //    //    $cookies.remove('STNCreds');
    //    //    $cookies.remove('STNUsername');
    //    //    $cookies.remove('usersName');
    //    //    $cookies.remove('usersRole');            
    //    //    $rootScope.isAuth.val = false;
    //    //    $location.path('/login');

            
    //    //};
    //}
    //#endregion NAV Controller

    //#region Home Controller 
    STNControllers.controller('HomeCtrl', ['$scope', '$rootScope', '$location', '$cookies', '$http', HomeCtrl]);
    function HomeCtrl($scope, $rootScope, $location, $cookies, $http) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //good to go
            $rootScope.thisPage = "Home";
           

        }//end good to go
    }
    //#endregion Home Controller

    //#region Map Controller
    STNControllers.controller('MapCtrl', ['$scope', '$rootScope', '$cookies', '$location', MapCtrl]);
    function MapCtrl($scope, $rootScope, $cookies, $location) {
        var cred = $cookies.get('STNCreds');
        if (cred == undefined || cred == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $rootScope.thisPage = "Map";
            $rootScope.activeMenu = "map"; 
            $scope.map = "Welcome to the new STN Map Page!!";
           
        }
    }
    //#endregion Map Controller

    //#region File Controller
    STNControllers.controller('FileUploadCtrl', ['$scope', '$location', '$cookies', 'Upload', 'multipartForm', 'fileTypeList', 'agencyList', FileUploadCtrl]);
    function FileUploadCtrl($scope, $location, $cookies, Upload, multipartForm, fileTypeList, agencyList) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.loggedInMember = {};
            $scope.loggedInMember.fullName = $cookies.get('usersName');
            $scope.loggedInMember.ID = $cookies.get('mID');
            $scope.map = "Welcome to the new STN File upload Page!!";
            $scope.allFileTypes = fileTypeList;
            $scope.allAgencies = agencyList;
            $scope.fileType = 0;
            $scope.aFile = {};
            $scope.toggleCaptionPreview = false;
            //#region Datepicker
            $scope.datepickrs = {};

            $scope.open = function ($event, which) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.datepickrs[which] = true;
            };
            $scope.format = 'MMM dd, yyyy';
            //#endregion Datepicker

            $scope.fileTypeChange = function () {
                $scope.fileType = $scope.aFile.FILETYPE_ID;
            };

            //  lat/long =is number
            $scope.isNum = function (evt) {
                var theEvent = evt || window.event;
                var key = theEvent.keyCode || theEvent.which;
                if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                    theEvent.returnValue = false;
                    if (theEvent.preventDefault) theEvent.preventDefault();
                }
            };

            // photo file caption
            $scope.ShowCaption = function () {
                if ($scope.toggleCaptionPreview == true) {
                    $scope.toggleCaptionPreview = false;
                    $scope.photoCaption = "";
                } else {
                    $scope.toggleCaptionPreview = true;
                    $scope.photoCaption = "This is the photo caption.";
                }
            };

            $scope.zones = [{ name: 'UTC' }, { name: 'PST' }, { name: 'MST' }, { name: 'CST' }, { name: 'EST' }];
            $scope.elevationStats = {};

            //submit file / datafile / 
            $scope.submit = function () {
                if ($scope.aFile.File) {
                    //determine if it's a data file or photo or all other to know which fields and objects to populate /create
                    //if loggedInMember.fullname != getuserNAME() .. they changed it.. need to create a source
                    //$scope.aFile -- all parts are here
                    //post the file.. then if datafile, post the dataFile..then upload to s3
                    var fileParts = {
                        FileEntity: {
                            FILETYPE_ID: $scope.aFile.FILETYPE_ID,
                            FILE_URL: $scope.aFile.FILE_URL,
                            PROCESSOR_ID: $scope.loggedInMember.ID,
                            FILE_DATE: $scope.aFile.FILE_DATE,
                            DESCRIPTION: $scope.aFile.DESCRIPTION,
                            HWM_ID: $scope.aFile.HWM_ID != undefined ? $scope.aFile.HWM_ID : 0,
                            SITE_ID: $scope.aFile.SITE_ID,
                            INSTRUMENT_ID: $scope.aFile.INSTRUMENT_ID != undefined ? $scope.aFile.INSTRUMENT_ID : 0
                        },
                        File: $scope.aFile.File
                    };

                    //$cookies.STNCreds before post https://www.youtube.com/watch?v=vLHgpOG1cW4
                    multipartForm.post(fileParts);

                }
            };
        }
    }
    //#endregion File Controller

    //#region Approval Controller
    STNControllers.controller('ApprovalCtrl', ['$scope', '$cookies', '$rootScope', '$location', '$http', 'stateList', 'instrumentList',  'allSensorTypes', 'HWM', 'DATA_FILE', 'INSTRUMENT', 'MEMBER', 'SITE', ApprovalCtrl]);
    function ApprovalCtrl($scope, $cookies, $rootScope, $location, $http, stateList, instrumentList, allSensorTypes, HWM, DATA_FILE, INSTRUMENT, MEMBER, SITE) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //TODO: Who can do approvals????????
            $rootScope.thisPage = "Approval";
            $rootScope.activeMenu = "approval";

            // watch for the session event to change and update
            $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                $scope.sessionEvent = $cookies.get('SessionEventName') != null ? $cookies.get('SessionEventName') : "All Events";
            });
            
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
            $http.defaults.headers.common['Accept'] = 'application/json';
            MEMBER.getAll(function success(response) {
                $scope.allMembers = response;
            }).$promise;

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
                var evID = $cookies.get('SessionEventID') != null ? $cookies.get('SessionEventID') : 0;
                //var evID = this.ChosenEvent.id != undefined ? this.ChosenEvent.id : 0;
                var sID = this.ChosenState.id != undefined ? this.ChosenState.id : 0;
                var mID = this.ChosenMember.id != undefined ? this.ChosenMember.id : 0;

                //go get the HWMs and DataFiles that need to be approved
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
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
                        var thisdfInst = $scope.allInstruments.filter(function (i) { return i.INSTRUMENT_ID == df.INSTRUMENT_ID; })[0];
                        var formattedDF = {};
                        var siteID = thisdfInst.SITE_ID;
                        var senType = $scope.allSensorTypes.filter(function (s) { return s.SENSOR_TYPE_ID == thisdfInst.SENSOR_TYPE_ID; })[0];
                        formattedDF.InstrID = thisdfInst.INSTRUMENT_ID;
                        SITE.query({ id: siteID }).$promise.then(function (response2) {
                            formattedDF.stringToShow = response2.SITE_NO + ": " + senType.SENSOR;
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
    STNControllers.controller('SiteSearchCtrl', ['$scope', '$cookies', '$rootScope', '$location', 'stateList', 'sensorTypes', 'networkNames', 'SITE', SiteSearchCtrl]);
    function SiteSearchCtrl($scope, $cookies, $rootScope, $location, stateList, sensorTypes, networkNames, SITE) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $rootScope.thisPage = "Site Search";
            $rootScope.activeMenu = "sites"; // report, settings
            //$scope.events = eventList;
            // watch for the session event to change and update
            $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                $scope.sessionEvent = $cookies.get('SessionEventName') != null ? $cookies.get('SessionEventName') : "All Events";
            });
            $scope.states = stateList;
            $scope.senTypes = sensorTypes;
            $scope.netNames = networkNames;
            $scope.Chosen = {};
            $scope.chosenStates = []; //used to join each abbrev to pass to call
            $scope.siteResponse = false;
            $scope.checkboxModel = {
                hwmOnly: 0,
                senOnly: 0,
                rdgOnly: 0,
                opDefined: 0
            };

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

            //filter options chosen, go get these sites to show in a table
            $scope.searchSites = function () {
                $(".page-loading").removeClass("hidden");
                var stateString = $scope.chosenStates.join();
                $scope.siteResponse = false;
                $scope.siteList = [];
                var evID = $cookies.get('SessionEventID') != null ? $cookies.get('SessionEventID') : 0;
                SITE.getAll({
                    Event: evID,
                    State: stateString,
                    SensorType: $scope.Chosen.sensor,
                    NetworkName: $scope.Chosen.network,
                    HWMOnly: $scope.checkboxModel.hwmOnly,
                    SensorOnly: $scope.checkboxModel.senOnly,
                    RDGOnly: $scope.checkboxModel.rdgOnly,
                    OPDefined: $scope.checkboxModel.opDefined
                },
                function success(response) {
                    $scope.siteList = response;
                    $scope.siteResponse = true;
                    $(".page-loading").addClass("hidden");
                }, function error(errorResponse) {
                    $(".page-loading").removeClass("hidden");
                    alert("Error: " + errorResponse.statusText);
                });
            };//end searchSites click action

            //add each state to an array to be joined in the GET
            $scope.stateClick = function (data) {
                if (data.selected == true) {
                    $scope.chosenStates.push(data.STATE_ABBREV);
                }
                if (data.selected == false) {
                    var ind = $scope.chosenStates.indexOf(data.STATE_ABBREV);
                    if (ind >= 0) {
                        $scope.chosenStates.splice(ind, 1);
                    }
                }
            };

            //clear the filter choices (start over)
            $scope.clearFilters = function () {
                $scope.checkboxModel = {
                    hwmOnly: 0,
                    senOnly: 0,
                    rdgOnly: 0,
                    opDefined: 0
                };
                $scope.Chosen = {};
                $scope.chosenStates = [];

                angular.forEach($scope.states, function (st) {
                    st.selected = false;
                });
            };
        }
    }
    //#endregion Site Search Controller

    //#region Reporting Controller
    STNControllers.controller('ReportingCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$http', '$uibModal', 'incompleteReports', 'allEvents', 'allStates', 'allReports', 'allEventTypes', 'allEventStatus', 'allAgencies', 'REPORT', 'MEMBER', ReportingCtrl]);
    function ReportingCtrl($scope, $rootScope, $cookies, $location, $http, $uibModal, incompleteReports, allEvents, allStates, allReports, allEventTypes, allEventStatus, allAgencies, REPORT, MEMBER) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //TODO: Who can do REPORTING????????
            $rootScope.thisPage = "Reporting";
            $rootScope.activeMenu = "report"; 
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
            $scope.datepickrs = {};
            $scope.open = function ($event, which) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.datepickrs[which] = true;
            };
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
            $scope.memberIncompletes = incompleteReports.filter(function (ir) { return ir.COMPLETE == 0; });
            $scope.events = allEvents;
            $scope.states = allStates;
            $scope.reports = allReports;
            
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
            $http.defaults.headers.common['Accept'] = 'application/json';
            MEMBER.query({ id: $cookies.get('mID') }, function success(response) {
                $scope.MemberLoggedIn = response;
                var memberAgency = allAgencies.filter(function (a) { return a.AGENCY_ID == $scope.MemberLoggedIn.AGENCY_ID; })[0];
                $scope.MemberLoggedIn.AGENCY_NAME = memberAgency.AGENCY_NAME;
                $scope.MemberLoggedIn.AGENCY_ADDRESS = memberAgency.ADDRESS + ", " + memberAgency.CITY + " " + memberAgency.STATE + " " + memberAgency.ZIP;
            }).$promise;
            MEMBER.getAll().$promise.then(function (response) {
                $scope.members = response;
            });

            $scope.agencies = allAgencies;
            $scope.eventTypes = allEventTypes;
            $scope.eventStats = allEventStatus;

            //#endregion global vars

            //#region Generate Report tab
            $scope.Statemodel = {};//binding to the state multi-select
            $scope.genSummary = {};//binding for the event chosen, and date chosen
            $scope.filteredReports = []; //result of filter options

            //each option the populate, need to show selection in 'Confirm Selections' section (date works)
            $scope.genRepChange = function () {
                $scope.EventName = $scope.events.filter(function (e) { return e.EVENT_ID == $scope.genSummary.EVENT_ID; })[0];
                var names = [];
                var abbrevs = [];
                angular.forEach($scope.Statemodel.value, function (state) {
                    names.push(state.STATE_NAME); abbrevs.push(state.STATE_ABBREV);
                });

                $scope.StateNames = names.join(', '); $scope.StateAbbrevs = abbrevs.join(',');
            };

            $scope.MetricDisplayModel = []; //hold all reportModels for 'Display Metrics Summary'
            //clicked Display Metrics Summary, show content in new tab
            $scope.displayMetricSum = function (valid) {
                if (valid == true) {
                    //#region scopes needed for this action
                    $scope.MetricDisplayModel = [];
                    $scope.GenRepEventModel = {};
                    $scope.totalRow = {}; //model to hold totals for tables last row
                    $scope.totalRow.notAcctForEmps = 0; $scope.totalRow.cumPField = 0; $scope.totalRow.yesPField = 0; $scope.totalRow.todPField = 0;
                    $scope.totalRow.tomPField = 0; $scope.totalRow.cumPOffice = 0; $scope.totalRow.yesPOffice = 0; $scope.totalRow.todPOffice = 0;
                    $scope.totalRow.tomPOffice = 0; $scope.totalRow.truck = 0; $scope.totalRow.boat = 0; $scope.totalRow.other = 0;

                    $scope.totalRow.gageVisits = 0; $scope.totalRow.gagesDown = 0; $scope.totalRow.disCtoDate = 0; $scope.totalRow.disCPlanned = 0;
                    $scope.totalRow.CheckMeasToDate = 0; $scope.totalRow.CheckMeasPlanned = 0; $scope.totalRow.indMeas = 0; $scope.totalRow.ratExt = 0;
                    $scope.totalRow.peaksOfRec = 0; $scope.totalRow.QWGageVis = 0; $scope.totalRow.contQWGageVis = 0; $scope.totalRow.contQWGageDown = 0;
                    $scope.totalRow.disQWSamples = 0; $scope.totalRow.sedSamples = 0;

                    $scope.totalRow.rdgPlan = 0; $scope.totalRow.rdgDep = 0; $scope.totalRow.rdgRec = 0; $scope.totalRow.rdgLost = 0;
                    $scope.totalRow.waterPlan = 0; $scope.totalRow.waterDep = 0; $scope.totalRow.waterRec = 0; $scope.totalRow.waterLost = 0;
                    $scope.totalRow.wavePlan = 0; $scope.totalRow.waveDep = 0; $scope.totalRow.waveRec = 0; $scope.totalRow.waveLost = 0;
                    $scope.totalRow.baroPlan = 0; $scope.totalRow.baroDep = 0; $scope.totalRow.baroRec = 0; $scope.totalRow.baroLost = 0;
                    $scope.totalRow.metPlan = 0; $scope.totalRow.metDep = 0; $scope.totalRow.metRec = 0; $scope.totalRow.metLost = 0;
                    $scope.totalRow.hwmFlag = 0; $scope.totalRow.hwmCol = 0;
                    //#endregion scopes needed for this action

                    //get metrics summary to show in new tab
                    $scope.Statemodel.value; //contains the states chosen
                    $scope.EventName;//event chosen
                    var abbrevs = [];
                    angular.forEach($scope.Statemodel.value, function (state) {
                        abbrevs.push(state.STATE_ABBREV);
                    });
                    var abbrevString = abbrevs.join(', ');
                    var thisDate = $scope.formatDate($scope.genSummary.SUM_DATE);
                    //need: 
                    //1. all reports
                    REPORT.getFilteredReports({
                        Event: $scope.EventName.EVENT_ID, States: abbrevString, Date: thisDate
                    }).$promise.then(function (result) {
                        //for each report, get all reports with that event and state
                        for (var x = 0; x < result.length; x++) {
                            //var evStReports = $scope.reports.filter(function (f) { return f.EVENT_ID == result[x].EVENT_ID && f.STATE == result[x].STATE; });
                            var thisRPModel = {};
                            thisRPModel.report = result[x]; var YesSWFsum = 0; var YesWQFsum = 0; var YesSWOsum = 0; var YesWQOsum = 0;
                            //cumulative person days totals
                            for (var a = 0; a < result.length; a++) { YesSWFsum += result[a].SW_YEST_FIELDPERS; }
                            for (var b = 0; b < result.length; b++) { YesWQFsum += result[b].WQ_YEST_FIELDPERS; }
                            for (var c = 0; c < result.length; c++) { YesSWOsum += result[c].SW_YEST_OFFICEPERS; }
                            for (var d = 0; d < result.length; d++) { YesWQOsum += result[d].WQ_YEST_OFFICEPERS; }

                            thisRPModel.FieldPYesSWTot = YesSWFsum;
                            thisRPModel.FieldPYesWQTot = YesWQFsum;
                            thisRPModel.OfficePYesSWTot = YesSWOsum;
                            thisRPModel.OfficePYesWQTot = YesWQOsum;

                            //add to totals for total row
                            $scope.totalRow.notAcctForEmps += (thisRPModel.report.SW_FIELDPERS_NOTACCT + thisRPModel.report.WQ_FIELDPERS_NOTACCT);
                            $scope.totalRow.cumPField += (thisRPModel.FieldPYesSWTot + thisRPModel.FieldPYesWQTot);
                            $scope.totalRow.yesPField += (thisRPModel.report.SW_YEST_FIELDPERS + thisRPModel.report.WQ_YEST_FIELDPERS);
                            $scope.totalRow.todPField += (thisRPModel.report.SW_TOD_FIELDPERS + thisRPModel.report.WQ_TOD_FIELDPERS);
                            $scope.totalRow.tomPField += (thisRPModel.report.SW_TMW_FIELDPERS + thisRPModel.report.WQ_TMW_FIELDPERS);
                            $scope.totalRow.cumPOffice += (thisRPModel.OfficePYesSWTot + thisRPModel.OfficePYesWQTot);
                            $scope.totalRow.yesPOffice += (thisRPModel.report.SW_YEST_OFFICEPERS + thisRPModel.report.WQ_YEST_OFFICEPERS);
                            $scope.totalRow.todPOffice += (thisRPModel.report.SW_TOD_OFFICEPERS + thisRPModel.report.WQ_TOD_OFFICEPERS);
                            $scope.totalRow.tomPOffice += (thisRPModel.report.SW_TMW_OFFICEPERS + thisRPModel.report.WQ_TMW_OFFICEPERS);
                            $scope.totalRow.truck += (thisRPModel.report.SW_AUTOS_DEPL + thisRPModel.report.WQ_AUTOS_DEPL);
                            $scope.totalRow.boat += (thisRPModel.report.SW_BOATS_DEPL + thisRPModel.report.WQ_BOATS_DEPL);
                            $scope.totalRow.other += (thisRPModel.report.SW_OTHER_DEPL + thisRPModel.report.WQ_OTHER_DEPL);

                            $scope.totalRow.gageVisits += thisRPModel.report.GAGE_VISIT; $scope.totalRow.gagesDown += thisRPModel.report.GAGE_DOWN;
                            $scope.totalRow.disCtoDate += thisRPModel.report.TOT_DISCHARGE_MEAS; $scope.totalRow.disCPlanned += thisRPModel.report.PLAN_DISCHARGE_MEAS;
                            $scope.totalRow.CheckMeasToDate += thisRPModel.report.TOT_CHECK_MEAS; $scope.totalRow.CheckMeasPlanned += thisRPModel.report.PLAN_CHECK_MEAS;
                            $scope.totalRow.indMeas = thisRPModel.report.PLAN_INDIRECT_MEAS; $scope.totalRow.ratExt = thisRPModel.report.RATING_EXTENS;
                            $scope.totalRow.peaksOfRec += thisRPModel.report.GAGE_PEAK_RECORD; $scope.totalRow.QWGageVis += thisRPModel.report.QW_GAGE_VISIT;
                            $scope.totalRow.contQWGageVis = thisRPModel.report.QW_CONT_GAGEVISIT; $scope.totalRow.contQWGageDown = thisRPModel.report.QW_GAGE_DOWN;
                            $scope.totalRow.disQWSamples += thisRPModel.report.QW_DISCR_SAMPLES; $scope.totalRow.sedSamples += thisRPModel.report.COLL_SEDSAMPLES;

                            $scope.totalRow.rdgPlan += thisRPModel.report.PLAN_RAPDEPL_GAGE; $scope.totalRow.rdgDep += thisRPModel.report.DEP_RAPDEPL_GAGE;
                            $scope.totalRow.rdgRec += thisRPModel.report.REC_RAPDEPL_GAGE; $scope.totalRow.rdgLost += thisRPModel.report.LOST_RAPDEPL_GAGE;
                            $scope.totalRow.waterPlan += thisRPModel.report.PLAN_WTRLEV_SENSOR; $scope.totalRow.waterDep += thisRPModel.report.DEP_WTRLEV_SENSOR;
                            $scope.totalRow.waterRec += thisRPModel.report.REC_WTRLEV_SENSOR; $scope.totalRow.waterLost += thisRPModel.report.LOST_WTRLEV_SENSOR;
                            $scope.totalRow.wavePlan += thisRPModel.report.PLAN_WV_SENS; $scope.totalRow.waveDep += thisRPModel.report.DEP_WV_SENS;
                            $scope.totalRow.waveRec += thisRPModel.report.REC_WV_SENS; $scope.totalRow.waveLost += thisRPModel.report.LOST_WV_SENS;
                            $scope.totalRow.baroPlan += thisRPModel.report.PLAN_BAROMETRIC; $scope.totalRow.baroDep += thisRPModel.report.DEP_BAROMETRIC;
                            $scope.totalRow.baroRec += thisRPModel.report.REC_BAROMETRIC; $scope.totalRow.baroLost += thisRPModel.report.LOST_BAROMETRIC;
                            $scope.totalRow.metPlan += thisRPModel.report.PLAN_METEOROLOGICAL; $scope.totalRow.metDep += thisRPModel.report.DEP_METEOROLOGICAL;
                            $scope.totalRow.metRec += thisRPModel.report.REC_METEOROLOGICAL; $scope.totalRow.metLost += thisRPModel.report.LOST_METEOROLOGICAL;
                            $scope.totalRow.hwmFlag += thisRPModel.report.HWM_FLAGGED; $scope.totalRow.hwmCol = thisRPModel.report.HWM_COLLECTED;

                            $scope.MetricDisplayModel.push(thisRPModel);
                        }//end forloop for ReportModelList
                        //2. this Event
                        $scope.GenRepEventModel = {};
                        $scope.GenRepEventModel.Event = $scope.EventName;
                        $scope.GenRepEventModel.EventType = $scope.eventTypes.filter(function (et) { return et.EVENT_TYPE_ID == $scope.EventName.EVENT_TYPE_ID; })[0];
                        $scope.GenRepEventModel.EventStat = $scope.eventStats.filter(function (es) { return es.EVENT_STATUS_ID == $scope.EventName.EVENT_STATUS_ID; })[0];
                        //3. event Coordinator info
                        $scope.GenRepEventModel.Coordinator = $scope.members.filter(function (m) { return m.MEMBER_ID == $scope.GenRepEventModel.Event.EVENT_COORDINATOR; })[0];
                        $scope.GenRepEventModel.CoordAgency = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.GenRepEventModel.Coordinator.AGENCY_ID; })[0];

                        //modal
                        var modalInstance = $uibModal.open({
                            templateUrl: 'MetricsSummary.html',
                            size: 'lg',
                            windowClass: 'rep-dialog',
                            resolve: {
                                thisReport: function () {
                                    return $scope.MetricDisplayModel;
                                },
                                thisEvent: function () {
                                    return $scope.GenRepEventModel;
                                },
                                theTotalRow: function () {
                                    return $scope.totalRow;
                                }
                            },
                                controller: function ($scope, $uibModalInstance, thisReport, thisEvent, theTotalRow) {
                                $scope.Report = thisReport;
                                $scope.Event = thisEvent;
                                $scope.totals = theTotalRow;
                                $scope.ok = function () {
                                    $uibModalInstance.dismiss('cancel');
                                };
                            }
                        });
                        modalInstance.result.then(function () {
                            //nothing                            
                        });//end modal
                    });
                }//end if valid = true
            };

            //clicked Display Contacts Summary, show content in new tab
            $scope.displayContactsSum = function (valid) {
                if (valid == true) {
                    //get metrics summary to show in new tab
                    //contains the states chosen     $scope.Statemodel.value; 
                    //event chosen    $scope.EventName[0];
                    var abbrevs = [];
                    angular.forEach($scope.Statemodel.value, function (state) {
                        abbrevs.push(state.STATE_ABBREV);
                    });
                    var abbrevString = abbrevs.join(', ');
                    var thisDate = $scope.formatDate($scope.genSummary.SUM_DATE);
                    $scope.reportModel = [];
                    //all filtered reports 
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    REPORT.getReportwithContacts({
                        Event: $scope.EventName.EVENT_ID, States: abbrevString, Date: thisDate
                    }).$promise.then(function (result) {
                        //loop through reports and get each's contacts
                        for (var x = 0; x < result.length; x++) {
                            var rep = {};
                            rep.repID = result[x].Report.REPORTING_METRICS_ID; rep.State = result[x].Report.STATE; rep.REPORT_DATE = result[x].Report.REPORT_DATE;
                            var submitter = $scope.members.filter(function (m) { return m.MEMBER_ID == result[x].Report.MEMBER_ID; })[0];
                            var submitterAgency = $scope.agencies.filter(function (a) { return a.AGENCY_ID == submitter.AGENCY_ID; });
                            var sub = {};
                            sub.FNAME = submitter.FNAME; sub.FNAME = submitter.FNAME;
                            sub.EMAIL = submitter.EMAIL; sub.PHONE = submitter.PHONE;
                            sub.AGENCYNAME = submitterAgency.AGENCY_NAME;
                            sub.AGENCYADD = submitterAgency.CITY + " " + submitterAgency.STATE + " " + submitterAgency.ZIP;
                            rep.submitter = sub;
                            rep.depC = result[x].ReportContacts.filter(function (x) { return x.TYPE == "Deployed Staff"; })[0];
                            rep.genC = result[x].ReportContacts.filter(function (x) { return x.TYPE == "General"; })[0];
                            rep.inlC = result[x].ReportContacts.filter(function (x) { return x.TYPE == "Inland Flood"; })[0];
                            rep.coastC = result[x].ReportContacts.filter(function (x) { return x.TYPE == "Coastal Flood"; })[0];
                            rep.waterC = result[x].ReportContacts.filter(function (x) { return x.TYPE == "Water Quality"; })[0];
                            $scope.reportModel.push(rep);
                        } //end for loop 

                        setTimeout(function () { showModal(); }, 3000);

                        //now send it all to the modal
                        var showModal = function () {
                            var modalInstance = $uibModal.open({
                                templateUrl: 'ContactMetricsSummary.html',
                                size: 'lg',
                                windowClass: 'rep-dialog',
                                resolve: {
                                    theseReports: function () {
                                        return $scope.reportModel;
                                    },
                                    thisEvent: function () {
                                        $scope.GenRepEventModel = {};
                                        $scope.GenRepEventModel.Event = $scope.EventName;
                                        $scope.GenRepEventModel.EventType = $scope.eventTypes.filter(function (et) { return et.EVENT_TYPE_ID == $scope.EventName.EVENT_TYPE_ID; })[0];
                                        $scope.GenRepEventModel.EventStat = $scope.eventStats.filter(function (es) { return es.EVENT_STATUS_ID == $scope.EventName.EVENT_STATUS_ID; })[0];
                                        //3. event Coordinator info
                                        $scope.GenRepEventModel.Coordinator = $scope.members.filter(function (m) { return m.MEMBER_ID == $scope.EventName.EVENT_COORDINATOR; })[0];
                                        $scope.GenRepEventModel.CoordAgency = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.GenRepEventModel.Coordinator.AGENCY_ID; })[0];
                                        return $scope.GenRepEventModel;
                                    }
                                },
                                    controller: function ($scope, $http, $uibModalInstance, theseReports, thisEvent) {
                                    $scope.Reports = theseReports;
                                    $scope.Event = thisEvent;
                                    $scope.ok = function () {
                                        $uibModalInstance.dismiss('cancel');
                                    };
                                }
                            });
                            modalInstance.result.then(function () {
                                //nothing
                            });
                        }; //end modal
                    });
                } //end if valid
            };

            //clicked generate csv
            $scope.getCSVfile = function (valid) {
                if (valid == true) {
                    //get reports and give a csv file back
                    $http.defaults.headers.common.Accept = 'text/csv';
                  
                    REPORT.getReportsCSV({ Event: $scope.genSummary.EVENT_ID, States: $scope.StateAbbrevs, Date: $scope.genSummary.SUM_DATE }).$promise.then(function (result) {
                        var anchor = angular.element('<a/>');
                        var joinedResponse = result.join("");
                        var file = new Blob([joinedResponse], { type: 'application/csv' });
                        var fileURL = URL.createObjectURL(file);
                        anchor.href = fileURL;
                        anchor.download = 'report.csv';
                        anchor.click();
                        var test;
                        //File.saveAs(blob, "report.csv");
                    }), function () {
                        console.log('error');
                    };
                }
            };//#endregion Generate Report tab
        }
    }

    STNControllers.controller('ReportingDashCtrl', ['$scope', '$cookies', '$filter', '$uibModal', '$state', '$http', 'CONTACT', 'MEMBER', 'allReportsAgain', ReportingDashCtrl]);
    function ReportingDashCtrl($scope, $cookies, $filter, $uibModal, $state, $http, CONTACT, MEMBER, allReportsAgain) {
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
            var modalInstance = $uibModal.open({
                templateUrl: 'ViewReport.html',
                controller: 'ReportModalCtrl',
                size: 'lg',
                windowClass: 'rep-dialog',
                resolve: {  //TODO :: Change this to get ReportModel --includes contacts
                    report: function () {
                        return r;
                    },
                    submitPerson: function () {
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                        $http.defaults.headers.common['Accept'] = 'application/json';
                        var member = {};
                        MEMBER.query({ id: r.MEMBER_ID }, function success(response) {
                            member.mem = response;
                            var memberAgency = $scope.agencies.filter(function (a) { return a.AGENCY_ID == member.mem.AGENCY_ID; })[0];
                            member.AGENCY_NAME = memberAgency.AGENCY_NAME;
                            member.AGENCY_ADDRESS = memberAgency.ADDRESS + ", " + memberAgency.CITY + " " + memberAgency.STATE + " " + memberAgency.ZIP;
                        }).$promise;
                        return member;
                    },
                    contacts: function () {
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                        $http.defaults.headers.common['Accept'] = 'application/json';
                        return CONTACT.getContactModel({ ContactModelByReport: r.REPORTING_METRICS_ID }).$promise;
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
                var event = $scope.events.filter(function (e) { return e.EVENT_ID == rep.EVENT_ID; })[0];
                rep.EVENT_NAME = event.EVENT_NAME;
                returnList.push(rep);
            }
            return returnList;
        }

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
                var formatDate = new Date($scope.THIS_DATE.date).setHours(0, 0, 0, 0);
                var thisDateReports = $scope.reportsToDate.filter(function (tdate) {
                    var reportDate = new Date(tdate.REPORT_DATE).setHours(0, 0, 0, 0);
                    return new Date(reportDate).getTime() == new Date(formatDate).getTime();
                });
                $scope.pickDateRpts = formatReport(thisDateReports);
                $scope.pickAdateReports = true;
            } else {
                alert("Pick a date first.");
            }

        };

        //complete the report button clicked -- send back to submit with report populated
        $scope.CompleteThisReport = function (rep) {
            $scope.$parent.newReport = rep;
            $scope.$parent.disabled = false;
            $scope.$parent.needToComplete = true;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
            $http.defaults.headers.common['Accept'] = 'application/json';
            CONTACT.getContactModel({ ContactModelByReport: rep.REPORTING_METRICS_ID }, function success(response) {
                $scope.$parent.DeployStaff = response.filter(function (d) { return d.TYPE == "Deployed Staff"; })[0];
                $scope.$parent.GenStaff = response.filter(function (d) { return d.TYPE == "General"; })[0];
                $scope.$parent.InlandStaff = response.filter(function (d) { return d.TYPE == "Inland Flood"; })[0];
                $scope.$parent.CoastStaff = response.filter(function (d) { return d.TYPE == "Coastal Flood"; })[0];
                $scope.$parent.WaterStaff = response.filter(function (d) { return d.TYPE == "Water Quality"; })[0];
            }).$promise.then(function () {
                $state.go('reporting.submitReport');
            });
        };

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
            });
            //6. this event
            $scope.ProjectAlertParts.Event = $scope.events.filter(function (e) { return e.EVENT_ID == rep.EVENT_ID; })[0];

            //modal
            var modalInstance = $uibModal.open({
                templateUrl: $scope.ProjectAlertParts.Event.EVENT_TYPE_ID == 1 ? 'FloodPA.html' : 'HurricanePA.html',
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
        };

    }

    STNControllers.controller('SubmitReportCtrl', ['$scope', '$http', '$cookies', '$uibModal', '$state', 'CONTACT', 'REPORT', SubmitReportCtrl]);
    function SubmitReportCtrl($scope, $http, $cookies, $uibModal, $state, CONTACT, REPORT) {
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
            var thisEvent = $scope.events.filter(function (e) { return e.EVENT_ID == evID; })[0];
            name = thisEvent.EVENT_NAME;
            return name;
        };

        //#region GET Report Contacts
        var getReportContacts = function (reportID) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
            $http.defaults.headers.common['Accept'] = 'application/json';
            CONTACT.getContactModel({ ContactModelByReport: reportID }, function success(response) {
                $scope.DeployStaff = response.filter(function (d) { return d.TYPE == "Deployed Staff"; })[0];
                $scope.GenStaff = response.filter(function (d) { return d.TYPE == "General"; })[0];
                $scope.InlandStaff = response.filter(function (d) { return d.TYPE == "Inland Flood"; })[0];
                $scope.CoastStaff = response.filter(function (d) { return d.TYPE == "Coastal Flood"; })[0];
                $scope.WaterStaff = response.filter(function (d) { return d.TYPE == "Water Quality"; })[0];
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
        };

        //Post/Put the Report and Report Contacts. Called twice (from within Modal (incomplete) and outside (complete))
        var PostPutReportAndReportContacts = function () {
            //POST or PUT
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
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
                        (new Date(repDate).getTime()) == (previousDay.getTime());
                })[0];
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                if (yesterdayRpt != undefined && yesterdayRpt.length > 0) {
                    // PERSONNEL populating
                    $scope.newReport.SW_YEST_FIELDPERS = yesterdayRpt.SW_TOD_FIELDPERS;
                    $scope.newReport.WQ_YEST_FIELDPERS = yesterdayRpt.WQ_TOD_FIELDPERS;
                    $scope.newReport.SW_YEST_OFFICEPERS = yesterdayRpt.SW_TOD_OFFICEPERS;
                    $scope.newReport.WQ_YEST_OFFICEPERS = yesterdayRpt.WQ_TOD_OFFICEPERS;

                    // CONTACTS populating 
                    getReportContacts(yesterdayRpt.REPORTING_METRICS_ID);
                }//end if yesterdayRpt != undefined
                else {
                    $scope.newReport.SW_YEST_FIELDPERS = 0;
                    $scope.newReport.WQ_YEST_FIELDPERS = 0;
                    $scope.newReport.SW_YEST_OFFICEPERS = 0;
                    $scope.newReport.WQ_YEST_OFFICEPERS = 0;
                }
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
                    var modalInstance = $uibModal.open({
                        templateUrl: 'saveReportModal.html',
                        controller: 'ConfirmReportModalCtrl',
                        size: 'sm'
                    });
                    modalInstance.result.then(function () {
                        //yes, post this as incomplete
                        $scope.newReport.COMPLETE = 0;
                        $scope.newReport.MEMBER_ID = $scope.MemberLoggedIn.MEMBER_ID;
                        PostPutReportAndReportContacts();
                    });//end modalInstance.result.then
                } else {
                    //the report is complete, just post/put it                        
                    $scope.newReport.MEMBER_ID = $scope.MemberLoggedIn.MEMBER_ID;
                    PostPutReportAndReportContacts();
                }
            }//end valid == true
        };

        //incomplete report was clicked, go get it and the contacts for it
        $scope.getIncompleteReport = function () {
            var reportId = this.ir.REPORTING_METRICS_ID;
            REPORT.query({ id: reportId }, function success(response) {
                $scope.newReport = response;
                $scope.fullReportForm.submit.$setDirty();
                //get contacts 
                getReportContacts(reportId);
            }).$promise;
        };
    }
    //#endregion Reporting Controller

    //#region SITE
    STNControllers.controller('SiteCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter', '$timeout',
        'thisSite', 'thisSiteNetworkNames', 'thisSiteNetworkTypes', 'thisSiteHousings', 'thisSiteOPs', 'thisSiteSensors', 'thisSiteHWMs', 'thisSiteFiles', 'thisSitePeaks',
        'SITE', 'LANDOWNER_CONTACT', 'MEMBER', 'DEPLOYMENT_TYPE', 'INSTRUMENT', 'INSTRUMENT_STATUS', 'SITE_HOUSING', 'NETWORK_NAME',
        'allHorDatums', 'allHorCollMethods', 'allStates', 'allCounties', 'allDeployPriorities', 'allHousingTypes', 'allNetworkNames', 'allNetworkTypes', 'allDeployTypes', 'allSensDeps', SiteCtrl]);
        function SiteCtrl($scope, $rootScope, $cookies, $location, $state, $http, $uibModal, $filter, $timeout,
        thisSite, thisSiteNetworkNames, thisSiteNetworkTypes, thisSiteHousings, thisSiteOPs, thisSiteSensors, thisSiteHWMs, thisSiteFiles, thisSitePeaks,
        SITE, LANDOWNER_CONTACT, MEMBER, DEPLOYMENT_TYPE, INSTRUMENT, INSTRUMENT_STATUS, SITE_HOUSING, NETWORK_NAME,
        allHorDatums, allHorCollMethods, allStates, allCounties, allDeployPriorities, allHousingTypes, allNetworkNames, allNetworkTypes, allDeployTypes, allSensDeps) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $rootScope.thisPage = "Site Dashboard";
            $scope.aSite = {};
            $scope.status = {
                mapOpen: false, siteOpen: true, opOpen: false, sensorOpen: false, hwmOpen: false, filesOpen: false, peakOpen: false
            };
            $scope.addedHouseType = []; //holder for when adding housing type to page from multiselect
            
            //open modal to edit or create a site
            $scope.openSiteCreate = function () {
                var dropdownParts =[allHorDatums, allHorCollMethods, allStates, allCounties, allHousingTypes, allDeployPriorities,
                    allNetworkNames, allNetworkTypes, allDeployTypes, allSensDeps];
                //modal
                var modalInstance = $uibModal.open({
                        templateUrl: 'SITEmodal.html',
                        controller: 'SITEmodalCtrl',
                        size: 'lg',
                        backdrop: 'static',
                        windowClass: 'rep-dialog',
                        resolve: {
                                allDropDownParts: function () {
                            return dropdownParts;
                        },
                                thisSiteStuff: function () {
                            if ($scope.aSite.SITE_ID != undefined) {
                                var origSiteHouses = $scope.originalSiteHousings != undefined ? $scope.originalSiteHousings : [];
                                var addedHouses = $scope.addedHouseType != undefined ? $scope.addedHouseType : [];
                                var sNetNames = thisSiteNetworkNames != undefined ? thisSiteNetworkNames : [];
                                var sNetTypes = thisSiteNetworkTypes != undefined ? thisSiteNetworkTypes : [];
                                var lo = $scope.landowner != undefined ? $scope.landowner : {
                            };

                                var siteRelatedStuff = [$scope.aSite, origSiteHouses, addedHouses, sNetNames, sNetTypes, lo];
                                return siteRelatedStuff;
                                }
                        }
                }
                });
                modalInstance.result.then(function (r) {
                    //nothing to do here
                });
        };

            // is this create new site or view existing??            
            if (thisSite != undefined) {
                //#region existingSite
                if (thisSite.SITE_ID != undefined) {
                    $scope.aSite = thisSite;                  

                    $scope.aSite.decDegORdms = 'dd';
                    $scope.aSite.HorizontalDatum = $scope.aSite.HDATUM_ID > 0 ? allHorDatums.filter(function (hd) { return hd.DATUM_ID == $scope.aSite.HDATUM_ID; })[0].DATUM_NAME : "---";
                    $scope.aSite.HorizontalCollectMethod = $scope.aSite.HCOLLECT_METHOD_ID != undefined && $scope.aSite.HCOLLECT_METHOD_ID > 0 ? allHorCollMethods.filter(function (hc) { return hc.HCOLLECT_METHOD_ID == $scope.aSite.HCOLLECT_METHOD_ID; })[0].HCOLLECT_METHOD : "---";
                    $scope.aSite.PriorityName = $scope.aSite.PRIORITY_ID != undefined && $scope.aSite.PRIORITY_ID > 0 ? allDeployPriorities.filter(function (dp) { return dp.PRIORITY_ID == $scope.aSite.PRIORITY_ID; })[0].PRIORITY_NAME: "---";

                    //$scope.markers = {
                    //    main: {
                    //        lat: $scope.aSite.LATITUDE_DD,
                    //        lng: $scope.aSite.LONGITUDE_DD,
                    //        focus: true,
                    //        message: $scope.aSite.SITE_NO,
                    //        draggable: false
                    //    }
                    //}
                    //angular.extend($scope, {
                    //    center: {
                    //        lat: $scope.aSite.LATITUDE_DD,
                    //        lng: $scope.aSite.LONGITUDE_DD,
                    //        zoom: 7
                    //    }
                    //});

                    //apply any site housings
                    if (thisSiteHousings.length > 0) {
                        $scope.originalSiteHousings = thisSiteHousings;
                        $scope.showSiteHouseTable = true;

                        for (var z = 0; z < $scope.originalSiteHousings.length; z++) {
                                //for each housingtypelist..make selected = true for these                       
                            var houseTypeName = allHousingTypes.filter(function (h) {
                                return h.HOUSING_TYPE_ID == $scope.originalSiteHousings[z].HOUSING_TYPE_ID;
                            })[0].TYPE_NAME;
                            var houseT = {
                                TYPE_NAME: houseTypeName,
                                HOUSING_TYPE_ID : $scope.originalSiteHousings[z].HOUSING_TYPE_ID,
                                SITE_HOUSING_ID: $scope.originalSiteHousings[z].SITE_HOUSING_ID,
                                LENGTH: $scope.originalSiteHousings[z].LENGTH,
                                MATERIAL: $scope.originalSiteHousings[z].MATERIAL,
                                NOTES: $scope.originalSiteHousings[z].NOTES,
                                AMOUNT: $scope.originalSiteHousings[z].AMOUNT
                            };
                            $scope.addedHouseType.push(houseT);
                        }
                    }//end if thisSiteHousings != undefined

                    //apply any site network names or types
                    $scope.siteNetworkNames = [];
                    if (thisSiteNetworkNames.length > 0) {
                        for (var a = 0; a < thisSiteNetworkNames.length; a++) {
                            var nn = allNetworkNames.filter(function (n) { return n.NETWORK_NAME_ID == thisSiteNetworkNames[a].NETWORK_NAME_ID; })[0];
                            $scope.siteNetworkNames.push(nn.NAME);
                        }
                    }
                    //apply any site network names or types
                    $scope.siteNetworkTypes = [];
                    if (thisSiteNetworkTypes.length > 0) {
                        for (var b = 0; b < thisSiteNetworkTypes.length; b++) {
                            var nt = allNetworkTypes.filter(function (nt) { return nt.NETWORK_TYPE_ID == thisSiteNetworkTypes[b].NETWORK_TYPE_ID; })[0];
                            $scope.siteNetworkTypes.push(nt.NETWORK_TYPE_NAME);
                        }
                    }
                    if ($scope.aSite.SENSOR_NOT_APPROPRIATE != null || $scope.aSite.SENSOR_NOT_APPROPRIATE > 0)
                        $scope.sensorNotAppr = "Yes";
                    else
                        $scope.sensorNotAppr = "No";


                    //get member name for display
                    if ($scope.aSite.MEMBER_ID != null) {
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                        $http.defaults.headers.common['Accept'] = 'application/json';
                        MEMBER.query({ id: $scope.aSite.MEMBER_ID }).$promise.then(function (response) {
                            $scope.aSite.Creator = response.FNAME + " " + response.LNAME;
                        }, function (error) {
                            $scope.aSite.Creator = "Not recorded";
                        }).$promise;
                    }

                    //get the landownerCOntact with getCreds
                    if ($scope.aSite.LANDOWNERCONTACT_ID != null) {
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                        $http.defaults.headers.common['Accept'] = 'application/json';
                        SITE.getSiteLandOwner({ id: $scope.aSite.SITE_ID }, function success(response) {
                            $scope.landowner = response;
                            $scope.addLandowner = true;
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        }).$promise;
                    }//end if site has landownercontact id

                } else {
                    //site != undefined but the site.SITE_ID is == this site doesn't exist
                    toastr.error("This site does not exist");
                    $(".page-loading").addClass("hidden");
                    $location.path('/Home').replace();//.notify(false);
                    $scope.apply;
                }
                    //#endregion existingSite
            } else {
                //open modal if new site for create
                $scope.openSiteCreate();
            }
        }//end else checkCreds is good
    }

    //#endregion SITE

    //#region OBJECTIVE_POINT
    STNControllers.controller('ObjectivePointCtrl', ['$scope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter', '$timeout', 'OBJECTIVE_POINT', 'thisSite', 'thisSiteOPs', 'allOPTypes', 'allHorDatums', 'allHorCollMethods', 'allVertDatums', 'allVertColMethods', 'allOPQualities', ObjectivePointCtrl]);
    function ObjectivePointCtrl($scope, $cookies, $location, $state, $http, $uibModal, $filter, $timeout, OBJECTIVE_POINT, thisSite, thisSiteOPs, allOPTypes, allHorDatums, allHorCollMethods, allVertDatums, allVertColMethods, allOPQualities) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //global vars
            $scope.opCount = { total: thisSiteOPs.length };
            $scope.SiteObjectivePoints = thisSiteOPs;

            $scope.showOPModal = function (OPclicked) {
                var passAllLists =[allOPTypes, allHorDatums, allHorCollMethods, allVertDatums, allVertColMethods, allOPQualities];
                var indexClicked = $scope.SiteObjectivePoints.indexOf(OPclicked);

                //modal
                var modalInstance = $uibModal.open({
                    templateUrl : 'OPmodal.html',
                    controller: 'OPmodalCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'rep-dialog',
                    resolve: {
                        allDropdowns: function () {
                            return passAllLists;
                        },
                        thisOP: function () {
                            return OPclicked != 0 ? OPclicked: "empty";
                        },
                        thisOPControls: function () {
                            if (OPclicked != 0) {
                                return OBJECTIVE_POINT.getOPControls({id: OPclicked.OBJECTIVE_POINT_ID}).$promise;
                            }
                        },
                        opSite: function () {
                            return thisSite;
                        }
                    }
                });
                modalInstance.result.then(function (createdOP) {
                    //is there a new op or just closed modal
                    if (createdOP[1] == 'created') {
                        $scope.SiteObjectivePoints.push(createdOP[0]);
                        $scope.opCount.total = $scope.SiteObjectivePoints.length;
                    }
                    if (createdOP[1] == 'updated') {
                        //this is from edit -- refresh page?
                        var indexClicked = $scope.SiteObjectivePoints.indexOf(OPclicked);
                        $scope.SiteObjectivePoints[indexClicked] = createdOP[0];
                    }
                    if (createdOP[1] == 'deleted') {
                        var indexClicked1 = $scope.SiteObjectivePoints.indexOf(OPclicked);
                        $scope.SiteObjectivePoints.splice(indexClicked1, 1);
                        $scope.opCount.total = $scope.SiteObjectivePoints.length;
                    }
                });
            };
        }
    }
    //#endregion OBJECTIVE_POINT

    //#region INSTRUMENT
    STNControllers.controller('SensorCtrl', ['$scope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter', '$timeout', 'thisSite', 'thisSiteSensors', 'allSensorBrands', 'allStatusTypes', 'allDeployTypes', 'allSensorTypes', 'allSensDeps', 'allHousingTypes', 'allEvents', 'INSTRUMENT', 'INSTRUMENT_STATUS', 'SITE', 'MEMBER', 'DEPLOYMENT_TYPE', SensorCtrl]);
    function SensorCtrl($scope, $cookies, $location, $state, $http, $uibModal, $filter, $timeout, thisSite, thisSiteSensors, allSensorBrands, allStatusTypes, allDeployTypes, allSensorTypes, allSensDeps, allHousingTypes, allEvents, INSTRUMENT, INSTRUMENT_STATUS, SITE, MEMBER, DEPLOYMENT_TYPE) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //global vars
            $scope.sensorCount = { total: thisSiteSensors.length };           
            $scope.statusTypeList = allStatusTypes;
            $scope.deployTypeList = allDeployTypes;
            var tempDepTypeID = 0;
            //fix deployment types so that "Temperature" becomes 2 : Temperature (Met sensor)-SensorType:2 and Temperature (pressure transducer)-SensorType:1
            for (var d = 0; d < $scope.deployTypeList.length; d++) {
                if ($scope.deployTypeList[d].METHOD === "Temperature") {
                    tempDepTypeID = $scope.deployTypeList[d].DEPLOYMENT_TYPE_ID;
                    $scope.deployTypeList[d].METHOD = "Temperature (Met sensor)";
                }
            }
            $scope.deployTypeList.push({DEPLOYMENT_TYPE_ID: tempDepTypeID, METHOD: "Temperature (Pressure Transducer)" });

            $scope.sensDepTypes = allSensDeps;
            $scope.showProposed = false; //they want to add a proposed sensor, open options
            $scope.SiteSensors = thisSiteSensors;
            $scope.showHideProposed = function () {
                $scope.showProposed = !$scope.showProposed;
            }
           
            //add these checked Proposed sensors to this site
            $scope.AddProposed = function () {
                var proposedToAdd = {}; var propStatToAdd = {};
                var Time_STAMP = utcDateTime();
                for (var dt = 0; dt < $scope.deployTypeList.length; dt++) {
                    if ($scope.deployTypeList[dt].selected == true) {
                        if ($scope.deployTypeList[dt].METHOD.substring(0, 4) == "Temp") {
                            proposedToAdd = {
                                DEPLOYMENT_TYPE_ID: $scope.deployTypeList[dt].DEPLOYMENT_TYPE_ID,
                                SITE_ID: thisSite.SITE_ID,
                                SENSOR_TYPE_ID: $scope.deployTypeList[dt].METHOD == "Temperature (Pressure Transducer)" ? 1 : 2,
                                EVENT_ID: $cookies.get('SessionEventID') != undefined ? $cookies.get('SessionEventID') : null,
                                Deployment_Type: $scope.deployTypeList[dt].METHOD
                            }
                        } else {
                            proposedToAdd = {
                                DEPLOYMENT_TYPE_ID: $scope.deployTypeList[dt].DEPLOYMENT_TYPE_ID,
                                SITE_ID: thisSite.SITE_ID,
                                SENSOR_TYPE_ID: $scope.sensDepTypes.filter(function (sdt) { return sdt.DEPLOYMENT_TYPE_ID == $scope.deployTypeList[dt].DEPLOYMENT_TYPE_ID })[0].SENSOR_TYPE_ID,
                                EVENT_ID: $cookies.get('SessionEventID') != undefined ? $cookies.get('SessionEventID') : null,
                                Deployment_Type: $scope.deployTypeList[dt].METHOD
                            }
                        }
                        //now post it
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                        $http.defaults.headers.common['Accept'] = 'application/json';
                        INSTRUMENT.save(proposedToAdd).$promise.then(function (response) {
                            proposedToAdd.INSTRUMENT_ID = response.INSTRUMENT_ID;
                            var propStatToAdd = { INSTRUMENT_ID: response.INSTRUMENT_ID, STATUS_TYPE_ID: 4, COLLECTION_TEAM_ID: $cookies.get('mID'), TIME_STAMP: Time_STAMP, TIME_ZONE: 'UTC' };
                            
                            INSTRUMENT_STATUS.save(propStatToAdd).$promise.then(function (statResponse) {
                                var instToPushToList = {
                                    Instrument: proposedToAdd,
                                    InstrumentStats: [statResponse]
                                };
                                //clean up ...all unchecked and then hide
                                for (var dep = 0; dep < $scope.deployTypeList.length; dep++) {
                                    $scope.deployTypeList[dep].selected = false;
                                }
                                

                                $timeout(function () {
                                    // anything you want can go here and will safely be run on the next digest.
                                    $scope.showProposed = false;
                                    $scope.SiteSensors.push(instToPushToList);
                                    $scope.sensorCount = { total: $scope.SiteSensors.length };
                                });

                            });//end INSTRUMENT_STATUS.save
                        }); //end INSTRUMENT.save
                    }//end if selected == true
                }//end foreach deployTypeList
            }//end AddProposed()

            //want to deploy/view a sensor, 
            /*which modal? 
             1: deploy proposed (sensor, 'depProp'), deploy new('0', 'deploy'), see deployed to view/edit(sensor, 'viewDep'). 
             2: retrieve deployed(sensor, 'retrieve'). 
             3: view/edit retrieved with deployed on top(sensor, 'viewRet')
             */
            $scope.showSensorModal = function (sensorClicked, modalNeeded) {
                var passAllLists = [allSensorTypes, allSensorBrands, allHousingTypes, allSensDeps, allEvents];
                var indexClicked = $scope.SiteSensors.indexOf(sensorClicked);
                $(".page-loading").removeClass("hidden"); //loading...
                //modal (dependent on 2nd param passed in here)
                
                var modalInstance = $uibModal.open({
                    templateUrl: 'Sensormodal.html',
                    controller: 'SensormodalCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'rep-dialog',
                    resolve: {
                        allDropdowns: function () {
                            return passAllLists;
                        },
                        allDepTypes: function () {
                            return DEPLOYMENT_TYPE.getAll().$promise;
                        },
                        thisSensor: function () {
                            return sensorClicked != 0 ? sensorClicked : "empty";
                        },
                        SensorSite: function () {
                            return thisSite;
                        },
                        siteOPs: function () {
                            return SITE.getSiteOPs({ id: thisSite.SITE_ID }).$promise;
                        },
                        allMembers: function () {
                            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                            $http.defaults.headers.common['Accept'] = 'application/json';
                            return MEMBER.getAll().$promise;
                        }
                    }
                });
                modalInstance.result.then(function (createdSensor) {
                    //is there a new op or just closed modal
                    if (createdSensor[1] == 'created') {
                        $scope.SiteSensors.push(createdSensor[0]); thisSiteSensors.push(createdSensor[0]);
                        $scope.sensorCount.total = $scope.SiteSensors.length;
                    }
                    if (createdSensor[1] == 'updated') {
                        //this is from edit -- refresh page?
                        var indexClicked = $scope.SiteSensors.indexOf(sensorClicked);
                        $scope.SiteSensors[indexClicked] = createdSensor[0];
                    }
                    if (createdSensor[1] == 'deleted') {
                        var indexClicked1 = $scope.SiteSensors.indexOf(sensorClicked);
                        $scope.SiteSensors.splice(indexClicked1, 1);
                        $scope.sensorCount.total = $scope.SiteSensors.length;
                    }
                });
            };

            // watch for the session event to change and update
            $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                $scope.sessionEventName = newValue != undefined ? newValue : "All Events";
                $scope.sessionEventExists = $scope.sessionEventName != "All Events" ? true : false;
                if (newValue != undefined) {
                    $scope.SiteSensors = thisSiteSensors.filter(function (h) { return h.Instrument.EVENT_ID == $cookies.get('SessionEventID'); });
                    $scope.sensorCount = { total: $scope.SiteSensors.length };
                } else {
                    $scope.SiteSensors = thisSiteSensors;
                    $scope.sensorCount = { total: $scope.SiteSensors.length };
                }
            });
        } //end else not auth
    }

    //#endregion INSTRUMENT

    //#region HWM
    STNControllers.controller('HWMCtrl', ['$scope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter', '$timeout', 'thisSite', 'thisSiteHWMs', 'allHWMTypes', 'allHWMQualities', 'allHorDatums', 'allMarkers', 'allHorCollMethods', 'allVertDatums', 'allVertColMethods', 'allEvents', 'MEMBER', HWMCtrl]);
    function HWMCtrl($scope, $cookies, $location, $state, $http, $uibModal, $filter, $timeout, thisSite, thisSiteHWMs, allHWMTypes, allHWMQualities, allHorDatums, allMarkers, allHorCollMethods, allVertDatums, allVertColMethods, allEvents, MEMBER) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
            } else {
            //global vars
            $scope.hwmCount = { total: thisSiteHWMs.length };
            $scope.SiteHWMs = thisSiteHWMs;
            // watch for the session event to change and update
            $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                $scope.sessionEventName = newValue != undefined ? newValue : "All Events";
                $scope.sessionEventExists = $scope.sessionEventName != "All Events" ? true : false;
                if (newValue != undefined) {
                    $scope.SiteHWMs = thisSiteHWMs.filter(function (h) { return h.EVENT_ID == $cookies.get('SessionEventID'); });
                    $scope.hwmCount = { total: $scope.SiteHWMs.length };
                } else {
                    $scope.SiteHWMs = thisSiteHWMs;
                    $scope.hwmCount = { total: $scope.SiteHWMs.length };
                }
            });

            $scope.showHWMModal = function (HWMclicked) {
                var passAllLists = [allHWMTypes, allHWMQualities, allHorDatums, allHorCollMethods, allVertDatums, allVertColMethods, allMarkers, allEvents];
                var indexClicked = $scope.SiteHWMs.indexOf(HWMclicked);

                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'HWMmodal.html',
                    controller: 'HWMmodalCtrl',
                        size: 'lg',
                        backdrop: 'static',
                        windowClass: 'rep-dialog',
                        resolve: {
                            allDropdowns: function () {
                                return passAllLists;
                            },
                            thisHWM: function () {
                                return HWMclicked != 0 ? HWMclicked: "empty";
                            },
                            hwmSite: function () {
                                return thisSite;
                            },
                            allMembers: function () {
                                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                                $http.defaults.headers.common['Accept'] = 'application/json';
                                return MEMBER.getAll().$promise;
                            }
                       }
                });

                modalInstance.result.then(function (createdHWM) {
                    //is there a new HWM or just closed modal
                    if (createdHWM[1]== 'created') {
                        $scope.SiteHWMs.push(createdHWM[0]);
                        $scope.hwmCount.total = $scope.SiteHWMs.length;
                        }
                    if (createdHWM[1]== 'updated') {
                            //this is from edit -- refresh page?
                        var indexClicked = $scope.SiteHWMs.indexOf(HWMclicked);
                        $scope.SiteHWMs[indexClicked]= createdHWM[0];
                        }
                    if (createdHWM[1]== 'deleted') {
                        var indexClicked1 = $scope.SiteHWMs.indexOf(HWMclicked);
                        $scope.SiteHWMs.splice(indexClicked1, 1);
                        $scope.hwmCount.total = $scope.SiteHWMs.length;
                    }
                });
            }; //end showHWMModal function
        } //end stncreds good
    } //#endregion HWM

    //#region QuickHWM
    STNControllers.controller('QuickHWMCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter',
        'allHorDatums', 'allHorCollMethods', 'allStates', 'allCounties', 'allOPTypes', 'allVertDatums', 'allVertColMethods', 
        'allOPQualities', 'allHWMTypes', 'allHWMQualities', 'allMarkers', 'SITE', 'OBJECTIVE_POINT', 'HWM', QuickHWMCtrl]);
    function QuickHWMCtrl($scope, $rootScope, $cookies, $location, $state, $http, $uibModal, $filter, allHorDatums, allHorCollMethods, allStates,
        allCounties, allOPTypes, allVertDatums, allVertColMethods, allOPQualities, allHWMTypes, allHWMQualities, allMarkers, SITE, OBJECTIVE_POINT, HWM) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //global vars
            $rootScope.thisPage = "Quick HWM";
            $scope.qhwmForm = {}; //forms within the accordion .Site, .OP, .HWM
            //called a few times to format just the date (no time)
            var makeAdate = function (d) {
                var aDate = new Date();
                if (d != "") {
                    //provided date
                    aDate = new Date(d);
                }

                var year = aDate.getFullYear();
                var month = aDate.getMonth();
                var day = ('0' + aDate.getDate()).slice(-2);
                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var dateWOtime = new Date(monthNames[month] + " " + day + ", " + year);
                return dateWOtime;
            }//end makeAdate()
            $scope.decDegORdms = {};
            $scope.aSite = { MEMBER_ID: $cookies.get('mID') };
            $scope.aOP = {DATE_ESTABLISHED: makeAdate("")};
            $scope.aHWM = { HWM_ENVIRONMENT: 'Riverine', BANK: 'N/A', FLAG_DATE: makeAdate(""), STILLWATER:0 };
            $scope.status = { siteOpen: true, opOpen: false, hwmOpen: false }; //accordion for parts
            $scope.removeOPCarray = []; //holder if they remove any OP controls
            $scope.addedIdentifiers = []; //holder for added Identifiers
            $scope.showControlIDinput = false; //initially hide the area containing added control Identifiers
            //dropdowns
            $scope.horDatumList = allHorDatums; $scope.horCollMethodList = allHorCollMethods;
            $scope.stateList = allStates; $scope.allCountyList = allCounties; $scope.stateCountyList = [];
            $scope.opTypeList = allOPTypes; $scope.vertDatumList = allVertDatums;
            $scope.vertCollMethodList = allVertColMethods; $scope.opQualList = allOPQualities;
            $scope.hwmTypeList = allHWMTypes; $scope.hwmQualList = allHWMQualities; $scope.markerList = allMarkers;
            //default radios
            $scope.FTorMETER = 'ft';
            $scope.FTorCM = 'ft';

            //want to add identifier
            $scope.addNewIdentifier = function () {
                $scope.addedIdentifiers.push({ OBJECTIVE_POINT_ID: $scope.aOP.OBJECTIVE_POINT_ID, IDENTIFIER: "", IDENTIFIER_TYPE: "" });
                $scope.showControlIDinput = true;
            }//end addNewIdentifier for OP

            //#region Datepicker
            $scope.datepickrs = {};
            $scope.open = function ($event, which) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.datepickrs[which] = true;
            };
            //#endregion

            //#region lat/long stuff
            
            $scope.decDegORdms.val = 'dd';
            $scope.DMS = {}; //holder of deg min sec values

            //convert deg min sec to dec degrees
            var azimuth = function (deg, min, sec) {
                var azi = 0;
                if (deg < 0) {
                    azi = -1.0 * deg + 1.0 * min / 60.0 + 1.0 * sec / 3600.0;
                    return (-1.0 * azi).toFixed(5);
                }
                else {
                    azi = 1.0 * deg + 1.0 * min / 60.0 + 1.0 * sec / 3600.0;
                    return (azi).toFixed(5);
                }
            }

            //convert dec degrees to dms
            var deg_to_dms = function (deg) {
                if (deg < 0) {
                    deg = deg.toString();

                    //longitude, remove the - sign
                    deg = deg.substring(1);
                }
                var d = Math.floor(deg);
                var minfloat = (deg - d) * 60;
                var m = Math.floor(minfloat);
                var s = ((minfloat - m) * 60).toFixed(3);

                return ("" + d + ":" + m + ":" + s);
            }

            //they changed radio button for dms dec deg
            $scope.latLongChange = function () {
                if ($scope.decDegORdms.val == "dd") {
                    //they clicked Dec Deg..
                    if ($scope.DMS.LADeg != undefined) {
                        //convert what's here for each lat and long
                        $scope.aSite.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                        $scope.aSite.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                        var test;
                    }
                } else {
                    //they clicked dms (convert lat/long to dms)
                    if ($scope.aSite.LATITUDE_DD != undefined) {
                        var latDMS = (deg_to_dms($scope.aSite.LATITUDE_DD)).toString();
                        var ladDMSarray = latDMS.split(':');
                        $scope.DMS.LADeg = ladDMSarray[0];
                        $scope.DMS.LAMin = ladDMSarray[1];
                        $scope.DMS.LASec = ladDMSarray[2];

                        var longDMS = deg_to_dms($scope.aSite.LONGITUDE_DD);
                        var longDMSarray = longDMS.split(':');
                        $scope.DMS.LODeg = longDMSarray[0] * -1;
                        $scope.DMS.LOMin = longDMSarray[1];
                        $scope.DMS.LOSec = longDMSarray[2];
                    }
                }
            }

            //  lat/long =is number
            $scope.isNum = function (evt) {
                var theEvent = evt || window.event;
                var key = theEvent.keyCode || theEvent.which;
                if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                    theEvent.returnValue = false;
                    if (theEvent.preventDefault) theEvent.preventDefault();
                }
            };

            //get address parts and existing sites 
            $scope.getAddress = function () {
                //clear them all first
                delete $scope.aSite.ADDRESS; delete $scope.aSite.CITY; delete $scope.aSite.STATE;
                $scope.stateCountyList = []; delete $scope.aSite.ZIP;

                $(".page-loading").removeClass("hidden"); //loading...
                var geocoder = new google.maps.Geocoder(); //reverse address lookup
                var latlng = new google.maps.LatLng($scope.aSite.LATITUDE_DD, $scope.aSite.LONGITUDE_DD);
                geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        //parse the results out into components ('street_number', 'route', 'locality', 'administrative_area_level_2', 'administrative_area_level_1', 'postal_code'
                        var address_components = results[0].address_components;
                        var components = {};
                        $.each(address_components, function (k, v1) {
                            $.each(v1.types, function (k2, v2) {
                                components[v2] = v1.long_name;
                            });
                        });

                        $scope.aSite.ADDRESS = components.street_number != undefined ? components.street_number + " " + components.route : components.route;
                        $scope.aSite.CITY = components.locality;

                        var thisState = $scope.stateList.filter(function (s) { return s.STATE_NAME == components.administrative_area_level_1; })[0];
                        if (thisState != undefined) {
                            $scope.aSite.STATE = thisState.STATE_ABBREV;
                            $scope.stateCountyList = $scope.allCountyList.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });
                            $scope.aSite.COUNTY = components.administrative_area_level_2;
                            $scope.aSite.ZIP = components.postal_code;
                            $scope.$apply();
                            $(".page-loading").addClass("hidden");
                        } else {
                            $(".page-loading").addClass("hidden");
                            toastr.error("The Latitude/Longitude did not return a location within the U.S.");
                        }
                    } else {
                        $(".page-loading").addClass("hidden");
                        toastr.error("There was an error getting address. Please try again.");
                    }
                });
               // 
            }//end getAddress()

            //#endregion lat/long stuff
            
            // watch for the session event to change and update
            $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                $scope.sessionEventName = newValue != undefined ? newValue : "All Events";
                $scope.sessionEventExists = $scope.sessionEventName != "All Events" ? true : false;
            });

            //when SITE.state changes, update county list
            $scope.updateCountyList = function (s) {
                var thisState = $scope.stateList.filter(function (st) { return st.STATE_ABBREV == s; })[0];
                $scope.stateCountyList = $scope.allCountyList.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });
            }//end updateCountyList() for Site

            //make uncertainty cleared and disabled when 'unquantified' is checked
            $scope.UnquantChecked = function () {
                if ($scope.aOP.UNQUANTIFIED == 1)
                    $scope.aOP.UNCERTAINTY = "";
            }//end unquantChecked() for op

            //just need an OBJECTIVE_POINT object to post/put
            var trimOP = function (op) {
                var OBJ_PT = {
                    OBJECTIVE_POINT_ID: op.OBJECTIVE_POINT_ID != undefined ? op.OBJECTIVE_POINT_ID : 0,
                    NAME: op.NAME,
                    DESCRIPTION: op.DESCRIPTION,
                    ELEV_FT: op.ELEV_FT != undefined ? op.ELEV_FT : null,
                    DATE_ESTABLISHED: op.DATE_ESTABLISHED,
                    OP_IS_DESTROYED: op.OP_IS_DESTROYED != undefined ? op.OP_IS_DESTROYED : 0,
                    OP_NOTES: op.OP_NOTES != undefined ? op.OP_NOTES : null,
                    SITE_ID: op.SITE_ID,
                    VDATUM_ID: op.VDATUM_ID != undefined ? op.VDATUM_ID : 0,
                    LATITUDE_DD: op.LATITUDE_DD,
                    LONGITUDE_DD: op.LONGITUDE_DD,
                    HDATUM_ID: op.HDATUM_ID != undefined ? op.HDATUM_ID : 0,
                    HCOLLECT_METHOD_ID: op.HCOLLECT_METHOD_ID != undefined ? op.HCOLLECT_METHOD_ID : 0,
                    VCOLLECT_METHOD_ID: op.VCOLLECT_METHOD_ID != undefined ? op.VCOLLECT_METHOD_ID : 0,
                    OP_TYPE_ID: op.OP_TYPE_ID,
                    DATE_RECOVERED: op.DATE_RECOVERED != undefined ? op.DATE_RECOVERED : null,
                    UNCERTAINTY: op.UNCERTAINTY != undefined ? op.UNCERTAINTY : null,
                    UNQUANTIFIED: op.UNQUANTIFIED != undefined ? op.UNQUANTIFIED : null,
                    OP_QUALITY_ID: op.OP_QUALITY_ID != undefined ? op.OP_QUALITY_ID : null,
                }
                return OBJ_PT;
            }

            //fix default radios and lat/long
            var formatDefaults = function (theOP) {
                //$scope.OP.FTorMETER needs to be 'ft'. if 'meter' ==convert value to ft 
                if (theOP.FTorMETER == "meter") {
                    $scope.aOP.FTorMETER = 'ft';
                    $scope.aOP.ELEV_FT = $scope.aOP.ELEV_FT * 3.2808;
                }
                //$scope.OP.FTorCM needs to be 'ft'. if 'cm' ==convert value to ft 
                if (theOP.FTorCM == "cm") {
                    $scope.aOP.FTorCM = 'ft'
                    $scope.aOP.UNCERTAINTY = $scope.aOP.UNCERTAINTY / 30.48;
                }                
            }

            $scope.siteErrors = false; $scope.opErrors = false; $scope.hwmErrors = false; 
            $scope.create = function () {
                $(".page-loading").removeClass("hidden");
                 var theForm = $scope.qhwmForm.quickHWM; $scope.siteErrors = false; $scope.opErrors = false; $scope.hwmErrors = false;
                 if (theForm.$valid) {                    
                    //site POST
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    
                    var createdSiteID = 0;
                    if ($scope.aSite.LONGITUDE_DD > 0)
                        $scope.aSite.LONGITUDE_DD = $scope.aSite.LONGITUDE_DD * (-1);
                    //POST site
                    SITE.save($scope.aSite, function success(response) {
                        createdSiteID = response.SITE_ID;
                        $scope.aOP.SITE_ID = createdSiteID; $scope.aOP.LATITUDE_DD = response.LATITUDE_DD; $scope.aOP.LONGITUDE_DD = response.LONGITUDE_DD;
                        $scope.aOP.HDATUM_ID = response.HDATUM_ID; $scope.aOP.HCOLLECT_METHOD_ID = response.HCOLLECT_METHOD_ID;

                        $scope.aHWM.SITE_ID = createdSiteID; $scope.aHWM.WATERBODY = response.WATERBODY; $scope.aHWM.LATITUDE_DD = response.LATITUDE_DD;
                        $scope.aHWM.LONGITUDE_DD = response.LONGITUDE_DD; $scope.aHWM.HCOLLECT_METHOD_ID = response.HCOLLECT_METHOD_ID;
                        $scope.aHWM.HDATUM_ID = response.HDATUM_ID; $scope.aHWM.FLAG_TEAM_ID = response.MEMBER_ID; $scope.aHWM.EVENT_ID = $cookies.get('SessionEventID');

                        //OP stuff POST
                        var createdOP = {};
                        //post
                        formatDefaults($scope.aOP); //$scope.OP.FTorMETER, FTorCM, decDegORdms                               
                        var OPtoPOST = trimOP($scope.aOP); //make it an OBJECTIVE_POINT for saving

                        OBJECTIVE_POINT.save(OPtoPOST, function success(response) {
                            createdOP = response;
                            if ($scope.addedIdentifiers.length > 0) {
                                //post each one
                                for (var opc = 0; opc < $scope.addedIdentifiers.length; opc++)
                                    OBJECTIVE_POINT.createOPControlID({ id: response.OBJECTIVE_POINT_ID }, $scope.addedIdentifiers[opc]).$promise;
                            }
                            //HWM stuff POST
                            var createdHWM = {};
                            //if they entered a survey date or elevation, then set survey member as the flag member (flagging and surveying at same time
                            if ($scope.aHWM.SURVEY_DATE != undefined)
                                $scope.aHWM.SURVEY_TEAM_ID = $scope.aHWM.FLAG_TEAM_ID;

                            if ($scope.aHWM.ELEV_FT != undefined) {
                                //make sure they added the survey date if they added an elevation
                                if ($scope.aHWM.SURVEY_DATE == undefined)
                                    $scope.aHWM.SURVEY_DATE = makeAdate("");

                                $scope.aHWM.SURVEY_TEAM_ID = $scope.aHWM.FLAG_TEAM_ID;
                            }
                            HWM.save($scope.aHWM).$promise.then(function (response) {
                                toastr.success("Quick HWM created");
                                $(".page-loading").addClass("hidden");
                                $location.path('/Site/' + createdSiteID + '/SiteDashboard').replace();//.notify(false);
                                $scope.apply;
                            });//end HWM.save()
                        });//end OP.save()
                    });//end SITE.save()

                 } else {
                     $(".page-loading").addClass("hidden");
                    $scope.status.siteOpen = true;
                    $scope.status.opOpen = true;
                    $scope.status.hwmOpen = true;
                    
                    angular.element("[name='" + theForm.$name + "']").find('.ng-invalid:visible:first').focus();

                    if (theForm.SITE_DESCRIPTION.$invalid || theForm.LATITUDE_DD.$invalid || theForm.LONGITUDE_DD.$invalid || theForm.HDATUM_ID.$invalid || theForm.HCOLLECT_METHOD_ID.$invalid || theForm.WATERBODY.$invalid || theForm.STATE.$invalidv || theForm.COUNTY.$invalid) {
                        $scope.siteErrors = true;
                    }
                    if (theForm.OP_TYPE_ID.$invalid || theForm.NAME.$invalid || theForm.DESCRIPTION.$invalid || theForm.de.$invalid) {
                        $scope.opErrors = true;
                    }
                    if (theForm.HWM_TYPE_ID.$invalid || theForm.HWM_ENVIRONMENT.$invalid || theForm.HWM_QUALITY_ID.$invalid || theForm.fd.$invalid) {
                        $scope.hwmErrors = true; 
                    }
                    toastr.error("Quick HWM not created.")
                }
            }


        }//end else (logged in)
    }
    //#endregion QuickHWM

    //#region FILE
    STNControllers.controller('FileCtrl', ['$scope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter', '$timeout', 'thisSite', 'thisSiteFiles', FileCtrl]);
    function FileCtrl($scope, $cookies, $location, $state, $http, $uibModal, $filter, $timeout, thisSite, thisSiteFiles) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //global vars
            $scope.fileCount = { total: thisSiteFiles.length };
        }
    }
    //#endregion FILE

    //#region PEAK
    STNControllers.controller('PeakCtrl', ['$scope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter', '$timeout', 'thisSite', 'thisSitePeaks', PeakCtrl]);
    function PeakCtrl($scope, $cookies, $location, $state, $http, $uibModal, $filter, $timeout, thisSite, thisSitePeaks) {
        if ($cookies.get('STNCreds') == undefined || $cookies.get('STNCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //global vars
            $scope.peakCount = { total: thisSitePeaks.length };
        }
    }
    //#endregion PEAK
})();