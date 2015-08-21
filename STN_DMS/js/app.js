(function () {
    "use strict"; 
    var app = angular.module('app',
        ['ngResource', 'ui.router', 'ngCookies', 'ui.mask', 'ui.bootstrap', 'isteven-multi-select',
            'STNResource', 'STNControllers', 'STNBusinessServices']);
    
    app.run(function ($rootScope, $location, getUserRole, getUserID) {
        
        $rootScope
            .$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    
                    $("#ui-view").html("");
                    $(".page-loading").removeClass("hidden");

                    //check to see if they are going to project info
                    if (toState.url == "/") {
                        //make username focus
                        $("#userNameFocus").focus();
                    };
                });

        $rootScope
            .$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    $(".page-loading").addClass("hidden");
                });
    });

    //app.config(function that defines the config code. 'ui.select', 'ngSanitize',
    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 
        function ($stateProvider, $urlRouterProvider, $locationProvider){
            //if no active state, display state associated with this fragment identifier
            $urlRouterProvider.otherwise("/");

            //http://stackoverflow.com/questions/19721125/resolve-http-request-before-running-app-and-switching-to-a-route-or-state
            //http://stackoverflow.com/questions/22537311/angular-ui-router-login-authentication
            $stateProvider
                //#region entryPoint
                .state("entry", {
                    url: "/",
                    templateUrl: "partials/entryView.html",
                    controller: "mainCtrl"
                })
                //#endregion entryPoint

                //#region entry point once logged in
                .state("home", {
                    url: "/Home",
                    templateUrl: "partials/homeBase.html",
                    controller: "HomeCtrl",
                    resolve: {
                        e: 'EVENT',
                        eventList: function (e) {
                            return e.getAll().$promise;
                        },
                        a: 'AGENCY',
                        agencyList: function (a) {
                            return a.getAll().$promise;
                        },
                        r: 'ROLE',
                        roleList: function (r) {
                            return r.getAll().$promise;
                        }
                    }
                })
                //#endregion entry point once logged in

                //#region map page
                .state("map", {
                    url: "/Map",
                    templateUrl: "partials/Map.html",
                    controller: "MapCtrl"
                })
                //#endregion

                //#region approval page
                .state("approval", {
                    url: "/Approval",
                    templateUrl: "partials/Approval.html",
                    controller: "ApprovalCtrl",
                    resolve: {
                        e: 'EVENT',
                        eventList: function (e) {
                            return e.getAll().$promise;
                        },
                        s: 'STATE',
                        stateList: function (s) {
                            return s.getAll().$promise;
                        },
                        i: 'INSTRUMENT',
                        instrumentList: function (i) {
                            return i.getAll().$promise;
                        },
                        st: 'SENSOR_TYPE',
                        allSensorTypes: function (st) {
                            return st.getAll().$promise;
                        },
                    }
                })
                //#endregion

                //#region sitesSearch page
                .state("siteSearch", {
                    url: "/SiteSearch",
                    templateUrl: "partials/SiteSearch.html",
                    controller: "SiteSearchCtrl",
                    resolve: {
                        e: 'EVENT',
                        eventList: function (e) {
                            return e.getAll().$promise;
                        },
                        s: 'STATE',
                        stateList: function (s) {
                            return s.getAll().$promise;
                        },
                        sensT: 'SENSOR_TYPE',
                        sensorTypes: function (sensT) {
                            return sensT.getAll().$promise;
                        },
                        netwN: 'NETWORK_NAME',
                        networkNames: function (netwN) {
                            return netwN.getAll().$promise;
                        }
                    }
                })
                //#endregion

                //#region reporting (abstract)
                .state("reporting", {
                    url: "/Reporting",
                    abstract: true,
                    templateUrl: "partials/Reporting/reporting.html",
                    controller: "ReportingCtrl",
                    resolve: {
                        e: 'EVENT',
                        allEvents: function (e) {
                            return e.getAll().$promise;
                        },
                        state: 'STATE',
                        allStates: function (state) {
                            return state.getAll().$promise;
                        },
                        r: 'REPORT',
                        allReports: function (r) {
                            return r.getAll().$promise;
                        },
                        et: 'EVENT_TYPE', 
                        allEventTypes: function(et) {
                            return et.getAll().$promise;
                        },
                        es: 'EVENT_STATUS',
                        allEventStatus: function (es) {
                            return es.getAll().$promise;
                        },
                        ag: 'AGENCY',
                        allAgencies: function (ag) {
                            return ag.getAll().$promise;
                        },
                        incompleteReports: function (r, getUserID, $http, getCreds) {
                            var mID = getUserID();
                            return r.getMemberReports({ memberId: mID }).$promise;
                        }
                    }                        
                })
                //#endregion reporting (abstract)

                //#region reporting.reportDash
                .state("reporting.reportDash", {
                    url: "/Dashboard",
                    templateUrl: "partials/Reporting/reportDash.html",
                    controller: "ReportingDashCtrl",
                    resolve: {
                        r: 'REPORT',
                        allReportsAgain: function (r) {
                            return r.getAll().$promise;
                        }
                    }
                })//#endregion reporting.reportDash

                //#region reporting.SubmitReport
                .state("reporting.submitReport", {
                    url: "/SubmitReport",
                    templateUrl: "partials/Reporting/submitReport.html",
                    controller: "SubmitReportCtrl",
                })
                //#endregion reporting.SubmitReport

                //#region reporting.GenerateReport
                .state("reporting.generateReport", {
                    url: "/GenerateReport",
                    templateUrl: "partials/Reporting/generateReport.html"                    
                })//#endregion reporting.GenerateReport
          
                //#region settings 
                .state("settings", {
                    url: "/Settings",                    
                    templateUrl: "partials/Settings.html",
                    controller: "SettingsCtrl"
                })
                //#endregion settings
                
                //#region members (abstract)
                .state("members", {
                    url: "/Members",
                    abstract: true,
                    templateUrl: "partials/Member/memberHolderView.html",
                    controller: "memberCtrl",
                    resolve: {
                        r: 'ROLE',
                        allRoles: function(r){
                            return r.getAll().$promise;
                        },
                        a: 'AGENCY',
                        allAgencies: function(a){
                            return a.getAll().$promise;
                        }
                    }
                })//#endregion members
                
                //#region members.MembersList
                .state("members.MembersList", {
                    url: "/MembersList",
                    templateUrl: "partials/Member/membersList.html"
                })
                //#endregion members.MembersList

                //#region members.MemberInfo
                .state("members.MemberInfo", {
                    url: "/memberInfo/:id",
                    templateUrl: "partials/Member/memberInfo.html",
                    controller: "memberInfoCtrl",
                    resolve: {
                        m: 'MEMBER',
                        thisMember: function (m, $stateParams, $http, getCreds) {                           
                            var memberId = $stateParams.id;
                            if (memberId > 0) {
                                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                                $http.defaults.headers.common['Accept'] = 'application/json';
                                return m.query(
                                    { id: memberId }).$promise;
                            }
                        }
                    }
                })//#endregion members.MemberInfo

                //#region events
                .state("events", {
                    url: "/Events",
                    abstract: true,
                    templateUrl: "partials/Event/eventHolderView.html",
                    controller: "eventCtrl",
                    resolve: {
                        e: 'EVENT',
                        allEvents: function (e) { 
                            return e.getAll().$promise;
                        },
                        et: 'EVENT_TYPE',
                        allEventTypes: function (et) {
                            return et.getAll().$promise;
                        },
                        es: 'EVENT_STATUS',
                        allEventStats: function (es) {
                            return es.getAll().$promise;
                        }                       
                    }
                })//#endregion events
                
                //#region events.EventsList
                .state("events.EventsList", {
                    url: "/EventsList",
                    templateUrl: "partials/Event/eventsList.html"
                })
                //#endregion events.EventsList

                //#region events.EventInfo
                .state("events.EventInfo", {
                    url: "/eventInfo/:id",
                    templateUrl: "partials/Event/EventInfo.html",
                    controller: "eventInfoCtrl",
                    resolve: {
                        e: 'EVENT',
                        thisEvent: function (e, $stateParams) {
                            var eventId = $stateParams.id;
                            if (eventId > 0) {
                                return e.query(
                                    { id: eventId }).$promise;
                            }
                        }
                    }
                })//#endregion events.EventInfo

                //#region resources
                .state("resources", {
                    url: "/Resources",
                    abstract: true,
                    templateUrl: "partials/Resources/resourcesHolderView.html",
                    controller: "resourcesCtrl",
                    resolve: {
                        state: 'STATE',
                        allStates: function (state) {
                            return state.getAll().$promise;
                        },
                        ag: 'AGENCY',
                        allAgencies: function (ag) {
                            return ag.getAll().$promise;
                        },
                        c: 'CONTACT_TYPE',
                        allContactTypes: function (c) {
                            return c.getAll().$promise;
                        },
                        d: 'DEPLOYMENT_PRIORITY',
                        allDeployPriorities: function (d) {
                            return d.getAll().$promise;
                        },                        
                        es: 'EVENT_STATUS',
                        allEventStats: function (es) {
                            return es.getAll().$promise;
                        },
                        et: 'EVENT_TYPE',
                        allEventTypes: function (et) {
                            return et.getAll().$promise;
                        },
                        ft: 'FILE_TYPE',
                        allFileTypes: function (ft) {
                            return ft.getAll().$promise;
                        },
                        hcm: 'HORIZONTAL_COLL_METHODS',
                        allHorCollMethods: function (hcm) {
                            return hcm.getAll().$promise;
                        },
                        hd: 'HORIZONTAL_DATUM',
                        allHorDatums: function (hd) {
                            return hd.getAll().$promise;
                        },
                        ht: 'HOUSING_TYPE',
                        allHouseTypes: function (ht) {
                            return ht.getAll().$promise;
                        },                        
                        hq: 'HWM_QUALITY',
                        allHWMqualities: function (hq) {
                            return hq.getAll().$promise;
                        },
                        hwmT: 'HWM_TYPE',
                        allHWMtypes: function (hwmT) {
                            return hwmT.getAll().$promise;
                        },
                        icc: 'INST_COLL_CONDITION',
                        allInstCollectConditions: function (icc) {
                            return icc.getAll().$promise;
                        },
                        m: 'MARKER',
                        allMarkers: function (m) {
                            return m.getAll().$promise;
                        },
                        nn: 'NETWORK_NAME',
                        allNetworkNames: function(nn) {
                            return nn.getAll().$promise;
                        },
                        opq: 'OP_QUALITY',
                        allObjPtQualities: function(opq) {
                            return opq.getAll().$promise;
                        },
                        opt: 'OP_TYPE',
                        allObjPtTypes: function(opt) {
                            return opt.getAll().$promise;
                        },
                        sb: 'SENSOR_BRAND',
                        allSensorBrands: function(sb) {
                            return sb.getAll().$promise;
                        },
                        dt: 'DEPLOYMENT_TYPE',
                        allDeploymentTypes: function(dt) {
                            return dt.getAll().$promise;
                        },
                        sstat: 'STATUS_TYPE',
                        allStatusTypes: function (sstat) {
                            return sstat.getAll().$promise;
                        },
                        st: 'SENSOR_TYPE',
                        allSensorTypes: function(st) {
                            return st.getAll().$promise;
                        },
                        nt: 'NETWORK_TYPE',
                        allNetworkTypes: function(nt) {
                            return nt.getAll().$promise;
                        },
                        vcm: 'VERTICAL_COLL_METHOD',
                        allVerticalCollMethods: function(vcm) {
                            return vcm.getAll().$promise;
                        },
                        vd: 'VERTICAL_DATUM',
                        allVerticalDatums: function(vd) {
                            return vd.getAll().$promise;
                        }
                    }
                })//#endregion resources

                //#region resources.ResourcesList
                .state("resources.ResourcesList", {
                    url: "/ResourcesList",
                    templateUrl: "partials/Resources/resourcesList.html"
                })
                //#endregion resources.ResourcesList

                //#region all lookup htmls
                //#region resources.ResourcesList.agency
                .state("resources.ResourcesList.agency", {
                    url: "/Agencies",
                    templateUrl: "partials/Resources/PageContent/Agency.html"
                })
                //#endregion resources.ResourcesList.agency
   
                //#region resources.ResourcesList.ContactType
                .state("resources.ResourcesList.ContactType", {
                    url: "/ContactTypes",
                    templateUrl: "partials/Resources/PageContent/ContactType.html"
                })
                //#endregion resources.ResourcesList.ContactType

                //#region resources.ResourcesList.DepPriority
                .state("resources.ResourcesList.DepPriority", {
                    url: "/DeploymentPriorities",
                    templateUrl: "partials/Resources/PageContent/DepPriority.html"
                })
                //#endregion resources.ResourcesList.DepPriority
                
                //#region resources.ResourcesList.EventStatus
                .state("resources.ResourcesList.EventStatus", {
                    url: "/EventStatus",
                    templateUrl: "partials/Resources/PageContent/EventStatus.html"
                })
                //#endregion resources.ResourcesList.EventStatus

                //#region resources.ResourcesList.EventType
                .state("resources.ResourcesList.EventType", {
                    url: "/EventTypes",
                    templateUrl: "partials/Resources/PageContent/EventType.html"
                })
                //#endregion resources.ResourcesList.EventType

                //#region resources.ResourcesList.FileType
                .state("resources.ResourcesList.FileType", {
                    url: "/FileTypes",
                    templateUrl: "partials/Resources/PageContent/FileType.html"
                })
                //#endregion resources.ResourcesList.FileType

                //#region resources.ResourcesList.HorCollMethd
                .state("resources.ResourcesList.HorCollMethd", {
                    url: "/HorizontalCollMethods",
                    templateUrl: "partials/Resources/PageContent/HorCollMethd.html"
                })
                //#endregion resources.ResourcesList.HorCollMethd
        
                //#region resources.ResourcesList.HorDatum
                .state("resources.ResourcesList.HorDatum", {
                    url: "/HorizontalDatums",
                    templateUrl: "partials/Resources/PageContent/HorDatum.html"
                })
                //#endregion resources.ResourcesList.HorDatum

                //#region resources.ResourcesList.HousingType
                .state("resources.ResourcesList.HousingType", {
                    url: "/HousingTypes",
                    templateUrl: "partials/Resources/PageContent/HousingType.html"
                })
                //#endregion resources.ResourcesList.HousingType
                
                //#region resources.ResourcesList.HWMQual
                .state("resources.ResourcesList.HWMQual", {
                    url: "/HWMQualities",
                    templateUrl: "partials/Resources/PageContent/HWMQual.html"
                })
                //#endregion resources.ResourcesList.HWMQual
                
                //#region resources.ResourcesList.HWMType
                .state("resources.ResourcesList.HWMType", {
                    url: "/HWMTypes",
                    templateUrl: "partials/Resources/PageContent/HWMType.html"
                })
                //#endregion resources.ResourcesList.HWMType
                
                //#region resources.ResourcesList.InstrCollCondition
                .state("resources.ResourcesList.InstrCollCondition", {
                    url: "/InstrCollConditions",
                    templateUrl: "partials/Resources/PageContent/InstrCollCondition.html"
                })
                //#endregion resources.ResourcesList.InstrCollCondition

                //#region resources.ResourcesList.Marker
                .state("resources.ResourcesList.Marker", {
                    url: "/Markers",
                    templateUrl: "partials/Resources/PageContent/Marker.html"
                })
                //#endregion resources.ResourcesList.Marker
                
                //#region resources.ResourcesList.NetworkNames
                .state("resources.ResourcesList.NetworkNames", {
                    url: "/NetworkNames",
                    templateUrl: "partials/Resources/PageContent/NetworkNames.html"
                })
                //#endregion resources.ResourcesList.NetworkNames
                 
                //#region resources.ResourcesList.OPquality
                .state("resources.ResourcesList.OPquality", {
                    url: "/ObjPointQualities",
                    templateUrl: "partials/Resources/PageContent/OPquality.html"
                })
                //#endregion resources.ResourcesList.OPquality

                //#region resources.ResourcesList.OPType
                .state("resources.ResourcesList.OPType", {
                    url: "/ObjPointType",
                    templateUrl: "partials/Resources/PageContent/OPType.html"
                })
                //#endregion resources.ResourcesList.OPType
        
                //#region resources.ResourcesList.SensorBrand
                .state("resources.ResourcesList.SensorBrand", {
                    url: "/SensorBrands",
                    templateUrl: "partials/Resources/PageContent/SensorBrand.html"
                })
                //#endregion resources.ResourcesList.SensorBrand

                //#region resources.ResourcesList.DepType
                .state("resources.ResourcesList.SenDepType", {
                    url: "/SensorDeploymentTypes",
                    templateUrl: "partials/Resources/PageContent/DepType.html"
                })
                //#endregion resources.ResourcesList.DepType
                
                //#region resources.ResourcesList.StatusType
                .state("resources.ResourcesList.StatusType", {
                    url: "/StatusTypes",
                    templateUrl: "partials/Resources/PageContent/StatusType.html"
                })
                //#endregion resources.ResourcesList.StatusType
                
                //#region resources.ResourcesList.SensorType
                .state("resources.ResourcesList.SensorType", {
                    url: "/SensorTypes",
                    templateUrl: "partials/Resources/PageContent/SensorType.html"
                })
                //#endregion resources.ResourcesList.SensorType
                
                //#region resources.ResourcesList.NetworkType
                .state("resources.ResourcesList.NetworkType", {
                    url: "/NetworkTypes",
                    templateUrl: "partials/Resources/PageContent/NetworkType.html"
                })
                //#endregion resources.ResourcesList.NetworkType

                //#region resources.ResourcesList.VertCollMethod
                .state("resources.ResourcesList.VertCollMethod", {
                    url: "/VerticalCollMethods",
                    templateUrl: "partials/Resources/PageContent/VertCollMethod.html"
                })
                //#endregion resources.ResourcesList.VertCollMethod
                
                //#region resources.ResourcesList.VertDatum
                .state("resources.ResourcesList.VertDatum", {
                    url: "/VerticalDatums",
                    templateUrl: "partials/Resources/PageContent/VertDatum.html"
                })
            //#endregion resources.ResourcesList.VertDatum
                 
                //#endregion all lookup htmls
                

            $locationProvider.html5Mode(false).hashPrefix('!');
            //$locationProvider.html5Mode({ enabled: true, requireBase: false });
        }
    ]);

}());
