(function () {
    "use strict"; 
    var ModalControllers = angular.module('ModalControllers',  []);
 
    //popup confirm box
    ModalControllers.controller('ConfirmModalCtrl', ['$scope', '$modalInstance', 'nameToRemove', 'what', ConfirmModalCtrl]);
    function ConfirmModalCtrl($scope, $modalInstance, nameToRemove, what) {
        //#region switch (long)
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
            case "Objective Point":
                $scope.nameToRmv = nameToRemove.NAME;
                break;
            case "HWM":
                var aDate = new Date(nameToRemove.FLAG_DATE);
                var year = aDate.getFullYear();
                var month = aDate.getMonth();
                var day = ('0' + aDate.getDate()).slice(-2);
                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var dateWOtime = monthNames[month] + " " + day + ", " + year;
                
                $scope.nameToRmv = "Flagged on: " + dateWOtime;
                break;
        }
        //#endregion

        $scope.what = what;

        $scope.ok = function () {
            $modalInstance.close(nameToRemove);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    //popup confirm box
    ModalControllers.controller('ConfirmReportModalCtrl', ['$scope', '$modalInstance', ConfirmReportModalCtrl]);
    function ConfirmReportModalCtrl($scope, $modalInstance) {

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    ModalControllers.controller('ReportModalCtrl', ['$scope', '$modalInstance', 'report', 'submitPerson', 'contacts', ReportModalCtrl]);
    function ReportModalCtrl($scope, $modalInstance, report, submitPerson, contacts) {
        $scope.ReportView = {};
        $scope.ReportView.Report = report;
        $scope.ReportView.submitter = submitPerson;
        $scope.ReportView.deployStaff = contacts.filter(function (d) { return d.TYPE == "Deployed Staff"; });
        $scope.ReportView.generalStaff = contacts.filter(function (d) { return d.TYPE == "General"; });
        $scope.ReportView.inlandStaff = contacts.filter(function (d) { return d.TYPE == "Inland Flood"; });
        $scope.ReportView.coastStaff = contacts.filter(function (d) { return d.TYPE == "Coastal Flood"; });
        $scope.ReportView.waterStaff = contacts.filter(function (d) { return d.TYPE == "Water Quality"; });

        $scope.ok = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    ModalControllers.controller('ProjAlertModalCtrl', ['$scope', '$modalInstance', 'ProjAlert', ProjAlertModalCtrl]);
    function ProjAlertModalCtrl($scope, $modalInstance, ProjAlert) {
        $scope.ProjAlertParts = ProjAlert;
        $scope.ok = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    ModalControllers.controller('SITEmodalCtrl', ['$scope', '$cookies', '$location', '$state', '$http', '$timeout', '$modalInstance', '$filter', 'allDropDownParts', 'thisSiteStuff', 'SITE', 'SITE_HOUSING', 'MEMBER', 'INSTRUMENT', 'INSTRUMENT_STATUS', 'LANDOWNER_CONTACT', SITEmodalCtrl]);
    function SITEmodalCtrl($scope, $cookies, $location, $state, $http, $timeout, $modalInstance, $filter, allDropDownParts, thisSiteStuff, SITE, SITE_HOUSING, MEMBER, INSTRUMENT, INSTRUMENT_STATUS, LANDOWNER_CONTACT) {
        //dropdowns
        $scope.HorizontalDatumList = allDropDownParts[0];
        $scope.HorCollMethodList = allDropDownParts[1];
        $scope.StateList = allDropDownParts[2];
        $scope.AllCountyList = allDropDownParts[3];
        $scope.stateCountyList = [];
        $scope.HousingTypeList = allDropDownParts[4];
        $scope.DepPriorityList = allDropDownParts[5]
        $scope.NetNameList = allDropDownParts[6];
        $scope.NetTypeList = allDropDownParts[7];
        $scope.ProposedSens = allDropDownParts[8];
        $scope.SensorDeployment = allDropDownParts[9];

        //globals 
        $scope.addedHouseType = [];
        $scope.aSite = {};
        $scope.aSite.decDegORdms = 'dd';
        $scope.DMS = {}; //holder of deg min sec values
        $scope.originalSiteHousings = [];
        $scope.checked = ""; $scope.checkedName = "Not Defined"; //comparers for disabling network names if 'Not Defined' checked
        $scope.landowner = {};
        $scope.addLandowner = false; //hide landowner fields
        $scope.disableSensorParts = false; //toggle to disable/enable sensor housing installed and add proposed sensor
        $scope.showSiteHouseTable = false;
        $scope.addedHouseType = []; //holder for when adding housing type to page from multiselect
        $scope.siteHousesModel = {};
        //$scope.LOCATION = { Latitude: '28.206323', Longitude: '-80.650249' };
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
            if ($scope.aSite.decDegORdms == "dd") {
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
                    var test;
                }
            }
        }

        //networkName check event.. if "Not Defined" chosen, disable the other 2 checkboxes
        $scope.whichOne = function (n) {
            if (n.NAME == "Not Defined" && n.selected == true) {
                //they checked "not defined"
                for (var nn = 0; nn < $scope.NetNameList.length; nn++) {
                    //unselect all but not defined
                    if ($scope.NetNameList[nn].NAME != "Not Defined")
                        $scope.NetNameList[nn].selected = false;
                }
                //make these match so rest get disabled
                $scope.checked = "Not Defined";
            }
            //they they unchecked not define, unmatch vars so the other become enabled
            if (n.NAME == "Not Defined" && n.selected == false)
                $scope.checked = "";
        };

        //toggle dim on div for sensor not appropriate click
        $scope.dimAction = function () {
            if ($scope.aSite.SENSOR_NOT_APPROPRIATE == 1) {
                $scope.disableSensorParts = true;
                //clear radio and checkboxes if disabling
                for (var x = 0; x < $scope.ProposedSens.length; x++) {
                    $scope.ProposedSens[x].selected = false;
                }
                $scope.aSite.IS_PERMANENT_HOUSING_INSTALLED = "No";
            } else {
                $scope.disableSensorParts = false;
            }
        };

        if (thisSiteStuff != undefined) {
            //#region existing site 
            //$scope.aSite[0], $scope.originalSiteHousings[1], $scope.addedHouseType[2], thisSiteNetworkNames[3], siteNetworkTypes[4], $scope.landowner[5]
            $scope.aSite = thisSiteStuff[0];

            //if this site is not appropriate for sensor, dim next 2 fields
            if ($scope.aSite.SENSOR_NOT_APPROPRIATE > 0) {
                $scope.disableSensorParts = true;
                //clear radio and checkboxes if disabling
                for (var x = 0; x < $scope.ProposedSens.length; x++) {
                    $scope.ProposedSens[x].selected = false;
                }
                $scope.aSite.IS_PERMANENT_HOUSING_INSTALLED = "No";
            }

            //update countiesList with this state's counties
            var thisState = $scope.StateList.filter(function (s) { return s.STATE_ABBREV == $scope.aSite.STATE; })[0];
            $scope.stateCountyList = $scope.AllCountyList.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });

            //apply any site housings for EDIT
            if (thisSiteStuff[1].length > 0) {
                //var test = ;
                $scope.originalSiteHousings = thisSiteStuff[1];
                $scope.showSiteHouseTable = true;
                $scope.addedHouseType = thisSiteStuff[2];
                $scope.landowner = thisSiteStuff[5];
                $scope.addLandowner = $scope.landowner.FNAME != undefined || $scope.landowner.LNAME != undefined || $scope.landowner.ADDRESS != undefined || $scope.landowner.PRIMARYPHONE != undefined ? true : false;

                //go through HousingTypeList and add selected Property.
                for (var i = 0; i < $scope.HousingTypeList.length; i++) {
                    //for each one, if thisSiteHousings has this id, add 'selected:true' else add 'selected:false'
                    for (var y = 0; y < $scope.originalSiteHousings.length; y++) {
                        if ($scope.originalSiteHousings[y].HOUSING_TYPE_ID == $scope.HousingTypeList[i].HOUSING_TYPE_ID) {
                            $scope.HousingTypeList[i].selected = true;
                            y = $scope.originalSiteHousings.length; //ensures it doesn't set it as false after setting it as true
                        }
                        else {
                            $scope.HousingTypeList[i].selected = false;
                        }
                    }
                    if ($scope.originalSiteHousings.length == 0)
                        $scope.HousingTypeList[i].selected = false;
                }

            }//end if thisSiteHousings != undefined

            //apply any site network names or types
            if (thisSiteStuff[3].length > 0) {
                //for each $scope.NetNameList .. add .selected property = true/false if thissitenetworknames ==
                for (var a = 0; a < $scope.NetNameList.length; a++) {
                    for (var e = 0; e < thisSiteStuff[3].length; e++) {
                        if (thisSiteStuff[3][e].NETWORK_NAME_ID == $scope.NetNameList[a].NETWORK_NAME_ID) {
                            $scope.NetNameList[a].selected = true;
                            e = thisSiteStuff[3].length;
                        } else {
                            $scope.NetNameList[a].selected = false;
                        }
                        if (thisSiteStuff[3].length == 0)
                            $scope.NetNameList[a].selected = false;
                    }
                }
                if ($scope.NetNameList[0].selected = true) {
                    //make these match so rest get disabled
                    $scope.checked = "Not Defined";
                }
            }//end if thisSiteNetworkNames != undefined

            if (thisSiteStuff[4].length > 0) {
                //for each $scope.NetTypeList .. add .selected property = true/false if thissitenetworktypes ==
                for (var ni = 0; ni < $scope.NetTypeList.length; ni++) {
                    for (var ny = 0; ny < thisSiteStuff[4].length; ny++) {
                        if (thisSiteStuff[4][ny].NETWORK_TYPE_ID == $scope.NetTypeList[ni].NETWORK_TYPE_ID) {
                            $scope.NetTypeList[ni].selected = true;
                            ny = thisSiteStuff[4].length;
                        } else {
                            $scope.NetTypeList[ni].selected = false;
                        }
                        if (thisSiteStuff[4].length == 0)
                            $scope.NetTypeList[ni].selected = false;
                    }
                }
            }//end if thisSiteNetworkNames != undefined

            //site PUT
            $scope.save = function (valid) {
                if (valid == true) {
                    $(".page-loading").removeClass("hidden");
                    //update the site
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    //did they add or edit the landowner
                    if ($scope.addLandowner == true) {
                        //there's a landowner.. edit or add?
                        if ($scope.aSite.LANDOWNERCONTACT_ID != null) {
                            //put
                            LANDOWNER_CONTACT.update({ id: $scope.aSite.LANDOWNERCONTACT_ID }, $scope.landowner).$promise.then(function () {
                                PUTsite();
                            });
                        } else if ($scope.landowner.FNAME != undefined || $scope.landowner.LNAME != undefined || $scope.landowner.TITLE != undefined ||
                                $scope.landowner.ADDRESS != undefined || $scope.landowner.CITY != undefined || $scope.landowner.PRIMARYPHONE != undefined) {
                            //they added something.. POST (rather than just clicking button and not)
                            LANDOWNER_CONTACT.save($scope.landowner, function success(response) {
                                $scope.aSite.LANDOWNERCONTACT_ID = response.LANDOWNERCONTACTID;
                                PUTsite();
                            }, function error(errorResponse) { toastr.error("Error adding Landowner: " + errorResponse.statusText); });
                        } else {
                            PUTsite();
                        }
                    }
                } else {
                    alert("Please populate all required fields.");
                }
            };//end save

            var PUTsite = function () {
                SITE.update({ id: $scope.aSite.SITE_ID }, $scope.aSite, function success(response) {
                    toastr.success("Site updated");
                    //update site housings (remove them all and add what's here) //did they add one? did they remove one? did they edit one?                                  
                    for (var sh = 0; sh < $scope.originalSiteHousings.length; sh++) {
                        SITE_HOUSING.delete({ id: $scope.originalSiteHousings[sh].SITE_HOUSING_ID }, $scope.originalSiteHousings[sh]).$promise;
                    }//end for each old sitehouse (delete)

                    //clear this out after deleting all of them;
                    setTimeout(function () { $scope.originalSiteHousings = []; }, 3000);
                    //now POST if any
                    for (var siteh = 0; siteh < $scope.addedHouseType.length; siteh++) {
                        SITE.postSiteHousing({ id: $scope.aSite.SITE_ID }, $scope.addedHouseType[siteh], function success(okResponse) {
                            var i = siteh;
                            $scope.originalSiteHousings.push($scope.addedHouseType[i]);
                        }, function error(errorR) {
                            $(".page-loading").addClass("hidden");
                            var notsuccessful;
                        }).$promise;
                    }//end foreach newsitehousings (post)

                    //update site networkNames (delete all and re-add)
                    for (var nn = 0; nn < $scope.NetNameList.length; nn++) {
                        if ($scope.NetNameList[nn].selected == true) {
                            //post it (if it's there already, it won't do anything)
                            var NNtoAdd = { NETWORK_NAME_ID: $scope.NetNameList[nn].NETWORK_NAME_ID, NAME: $scope.NetNameList[nn].NAME };
                            SITE.postSiteNetworkName({ id: $scope.aSite.SITE_ID }, NNtoAdd, function success(responseSNNames) {
                                var nothingNeeded;
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }).$promise;
                        } else {
                            //delete it
                            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                            var NNtoDelete = { NETWORK_NAME_ID: $scope.NetNameList[nn].NETWORK_NAME_ID, NAME: $scope.NetNameList[nn].NAME };
                            SITE.deleteSiteNetworkName({ id: $scope.aSite.SITE_ID }, NNtoDelete).$promise;
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        }
                    }//end for each NetNameList

                    //update site networkTypes (delete all and re-add)
                    for (var nt = 0; nt < $scope.NetTypeList.length; nt++) {
                        if ($scope.NetTypeList[nt].selected == true) {
                            //post it (if it's there already, it won't do anything)
                            var NTtoAdd = { NETWORK_TYPE_ID: $scope.NetTypeList[nt].NETWORK_TYPE_ID, NETWORK_TYPE_NAME: $scope.NetTypeList[nt].NETWORK_TYPE_NAME };
                            SITE.postSiteNetworkType({ id: $scope.aSite.SITE_ID }, NTtoAdd, function success(responseSNTypes) {
                                var nothingNeeded;
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }).$promise;
                        } else {
                            //delete it
                            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                            var NTtoDelete = { NETWORK_TYPE_ID: $scope.NetTypeList[nt].NETWORK_TYPE_ID, NETWORK_TYPE_NAME: $scope.NetTypeList[nt].NETWORK_TYPE_NAME };
                            SITE.deleteSiteNetworkType({ id: $scope.aSite.SITE_ID }, NTtoDelete).$promise;
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        }
                    } //end for each NetTypeList
                }, function error(errorResponse) {
                    toastr.error("Error updating Site: " + errorResponse.statusText);
                }).$promise.then(function () {
                    $modalInstance.dismiss('cancel');
                    $(".page-loading").addClass("hidden");
                    $location.path('/Site/' + $scope.aSite.SITE_ID + '/SiteDashboard').replace();//.notify(false);
                    $scope.apply;
                });//end SITE.save(...
            }; // end PUTsite()
            //#endregion existing site 
        }
        else {
            //#region this is a NEW SITE CREATE (site == undefined)
            //get logged in member to make them creator
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
            $http.defaults.headers.common['Accept'] = 'application/json';
            MEMBER.query({ id: $cookies.get('mID') }, function success(response) {
                $scope.aSite.Creator = response.FNAME + " " + response.LNAME;
                $scope.aSite.MEMBER_ID = response.MEMBER_ID;
                $scope.aSite.IS_PERMANENT_HOUSING_INSTALLED = "No";
                $scope.aSite.ACCESS_GRANTED = "Not Needed";
                //TODO: get member's id in there too
            }, function error(errorResponse) {
                toastr.error("Error getting Member info: " + errorResponse.statusText);
            });

            //create this site clicked
            $scope.create = function (valid) {
                if (valid == true) {
                    $(".page-loading").removeClass("hidden");
                    //POST landowner, if they added one
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    delete $scope.aSite.Creator;
                    if ($scope.addLandowner == true) {
                        if ($scope.landowner.FNAME != undefined || $scope.landowner.LNAME != undefined || $scope.landowner.TITLE != undefined ||
                                       $scope.landowner.ADDRESS != undefined || $scope.landowner.CITY != undefined || $scope.landowner.PRIMARYPHONE != undefined) {
                            LANDOWNER_CONTACT.save($scope.landowner, function success(response) {
                                $scope.aSite.LANDOWNERCONTACT_ID = response.LANDOWNERCONTACTID;
                                //now post the site
                                postSite();
                            }, function error(errorResponse) {
                                $(".page-loading").addClass("hidden");
                                toastr.error("Error posting landowner: " + errorResponse.statusText);
                            });
                        } else {
                            postSite();
                        }
                    } else {
                        postSite();
                    }
                } else {
                    alert("Please populate all required fields.");
                }
            };

            var postSite = function () {
                //make sure longitude is < 0, otherwise * (-1),
                var createdSiteID = 0;
                if ($scope.aSite.LONGITUDE_DD > 0)
                    $scope.aSite.LONGITUDE_DD = $scope.aSite.LONGITUDE_DD * (-1);
                //POST site
                SITE.save($scope.aSite, function success(response) {
                    createdSiteID = response.SITE_ID;
                    //POST site_HouseTypes 
                    for (var ht = 0; ht < $scope.addedHouseType.length; ht++) {
                        $scope.addedHouseType[ht].SITE_ID = createdSiteID;
                        delete $scope.addedHouseType[ht].TYPE_NAME;
                        //now post it
                        SITE.postSiteHousing({ id: createdSiteID }, $scope.addedHouseType[ht], function success(houseResponse) {
                            toastr.success("Site Housing Added");
                        }, function error(errorResponse) {
                            $(".page-loading").removeClass("hidden");
                            toastr.error("Error added Site Housing: " + errorResponse.statusText);
                        }).$promise;
                    }//end foreach addedHouseType
                    //now go deal with networkNames and networkTypes
                    POSTnetworks(createdSiteID);

                }, function error(errorResponse) {
                    toastr.error("Error creating Site: " + errorResponse.statusText);
                });
            };

            var POSTnetworks = function (newSiteId) {
                //POST site_NetworkNames
                //loop through $scope.NetNameList for selected == true --post each
                for (var nn = 0; nn < $scope.NetNameList.length; nn++) {
                    if ($scope.NetNameList[nn].selected == true) {
                        //post it
                        var siteNetName = { NETWORK_NAME_ID: $scope.NetNameList[nn].NETWORK_NAME_ID, NAME: $scope.NetNameList[nn].NAME };
                        SITE.postSiteNetworkName({ id: newSiteId }, siteNetName, function success(netNameResponse) {
                            toastr.success("Site Network Name added");
                        }, function error(errorResponse) {
                            $(".page-loading").removeClass("hidden");
                            toastr.error("Error adding Network Name: " + errorResponse.statusText);
                        }).$promise;
                    }//end if selected
                }//end for each netnamelist

                //POST site_NetworkTypes 
                //loop through $scope.NetTypeList for selected == true --post each
                for (var nt = 0; nt < $scope.NetTypeList.length; nt++) {
                    if ($scope.NetTypeList[nt].selected == true) {
                        //post it
                        var siteNetType = { NETWORK_TYPE_ID: $scope.NetTypeList[nt].NETWORK_TYPE_ID, NETWORK_TYPE_NAME: $scope.NetTypeList[nt].NETWORK_TYPE_NAME };
                        SITE.postSiteNetworkType({ id: newSiteId }, siteNetType, function success(netTypeResponse) {
                            toastr.success("Site Network Type added");
                        }, function error(errorResponse) {
                            $(".page-loading").removeClass("hidden");
                            toastr.error("Error adding Network Type: " + errorResponse.statusText);
                        }).$promise;
                    }//end if selected
                }//end for each nettypelist

                //see if they checked any proposed sensors and POST those 
                if ($scope.disableSensorParts == false) {
                    for (var ps = 0; ps < $scope.ProposedSens.length; ps++) {
                        if ($scope.ProposedSens[ps].selected == true) {
                            //POST it
                            var sensorTypeID = $scope.SensorDeployment.filter(function (sd) { return sd.DEPLOYMENT_TYPE_ID == $scope.ProposedSens[ps].DEPLOYMENT_TYPE_ID; })[0].SENSOR_TYPE_ID;
                            var inst = { DEPLOYMENT_TYPE_ID: $scope.ProposedSens[ps].DEPLOYMENT_TYPE_ID, SITE_ID: newSiteId, SENSOR_TYPE_ID: sensorTypeID };
                            INSTRUMENT.save(inst, function success(instResponse) {
                                //INSTRUMENT_STATUS (INSTRUMENT_ID, STATUS_TYPE_ID =4, COLLECTION_TEAM_ID = memberID)
                                var instStat = { INSTRUMENT_ID: instResponse.INSTRUMENT_ID, STATUS_TYPE_ID: 4, COLLECTION_TEAM_ID: $scope.aSite.MEMBER_ID };
                                INSTRUMENT_STATUS.save(instStat, function success(insStatResponse) {
                                    toastr.success("Proposed Sensor Added");
                                }, function error(errorResponse) {
                                    $(".page-loading").removeClass("hidden");
                                    toastr.error("Error adding Proposed Sensor");
                                }).$promise;
                            }).$promise;
                        }//end if selected == true
                    }//end for each proposedSens
                } //end if sensor parts aren't disabled
                //now update page
                $timeout(function () {
                    $modalInstance.dismiss('cancel');
                    $(".page-loading").addClass("hidden");
                    $location.path('/Site/' + newSiteId + '/SiteDashboard').replace();//.notify(false);
                    $scope.apply;
                }, 3000);
            }; //end POSTnetworks

            //#endregion this is a NEW SITE CREATE (site == undefined)

        }//end new site

        //  lat/long =is number
        $scope.isNum = function (evt) {
            var theEvent = evt || window.event;
            var key = theEvent.keyCode || theEvent.which;
            if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                theEvent.returnValue = false;
                if (theEvent.preventDefault) theEvent.preventDefault();
            }
        };

        //multiselect one checked..
        $scope.HouseTypeClick = function (ht) {
            //add/remove house type and inputs to table row                
            if (ht.selected == true) {
                var houseT = { TYPE_NAME: ht.TYPE_NAME, HOUSING_TYPE_ID: ht.HOUSING_TYPE_ID, LENGTH: ht.LENGTH, MATERIAL: ht.MATERIAL, NOTES: ht.NOTES, AMOUNT: 1 };
                $scope.addedHouseType.push(houseT);
                $scope.showSiteHouseTable = true;
            }
            if (ht.selected == false) {
                var i = $scope.addedHouseType.indexOf($scope.addedHouseType.filter(function (h) { return h.TYPE_NAME == ht.TYPE_NAME; })[0]);
                $scope.addedHouseType.splice(i, 1);
                if ($scope.addedHouseType.length == 0) {
                    $scope.showSiteHouseTable = false;
                }
            }
        };

        //get address parts and existing sites 
        $scope.getAddress = function () {
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

                    var thisState = $scope.StateList.filter(function (s) { return s.STATE_NAME == components.administrative_area_level_1; })[0];
                    if (thisState != undefined) {
                        $scope.aSite.STATE = thisState.STATE_ABBREV;
                        $scope.stateCountyList = $scope.AllCountyList.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });
                        $scope.aSite.COUNTY = components.administrative_area_level_2;
                        $scope.aSite.ZIP = components.postal_code;
                        //see if there are any sites within a 0.0005 buffer of here for them to use instead
                        SITE.query({ Latitude: $scope.aSite.LATITUDE_DD, Longitude: $scope.aSite.LONGITUDE_DD, Buffer: 0.0005 }, function success(response) {
                            var closeSites = response.Sites;
                            alert("Number of nearby Sites: " + closeSites.length);
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        }).$promise;
                    } else {
                        toastr.error("The Latitude/Longitude did not return a location within the U.S.");
                    }
                } else {
                    toastr.error("There was an error getting address. Please try again.");
                }
            });
        };

        // want to add a landowner contact
        $scope.showLandOwnerPart = function () {
            $scope.addLandowner = true;
        };

        //when state changes, update county list
        $scope.updateCountyList = function (s) {
            var thisState = $scope.StateList.filter(function (st) { return st.STATE_ABBREV == s; })[0];
            $scope.stateCountyList = allCounties.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });
        };

        //cancel modal
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }

    ModalControllers.controller('OPmodalCtrl', ['$scope', '$cookies', '$http', '$modalInstance', '$modal', 'allDropdowns', 'thisOP', 'thisOPControls', 'opSite', 'OBJECTIVE_POINT', 'OP_CONTROL_IDENTIFIER', OPmodalCtrl]);
    function OPmodalCtrl($scope, $cookies, $http, $modalInstance, $modal, allDropdowns, thisOP, thisOPControls, opSite, OBJECTIVE_POINT, OP_CONTROL_IDENTIFIER) {
        //defaults for radio buttons
        //dropdowns
        $scope.OPTypeList = allDropdowns[0];
        $scope.HDList = allDropdowns[1];
        $scope.HCollectMethodList = allDropdowns[2];
        $scope.VDatumList = allDropdowns[3];
        $scope.VCollectMethodList = allDropdowns[4];
        $scope.OPQualityList = allDropdowns[5];
        $scope.OP = {};
        $scope.removeOPCarray = []; //holder if they remove any OP controls
        $scope.thisOPsite = opSite; //this OP's SITE
        $scope.addedIdentifiers = []; //holder for added Identifiers
        $scope.showControlIDinput = false; //initially hide the area containing added control Identifiers
        $scope.DMS = {}; //object for Deg Min Sec values
        $scope.OPFiles = []; //holder for op files added
        $scope.photoFiles = [];
        //make uncertainty cleared and disabled when 'unquantified' is checked
        $scope.UnquantChecked = function () {
            if ($scope.OP.UNQUANTIFIED == 1)
                $scope.OP.UNCERTAINTY = "";
        }

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
        }

        if (thisOP != "empty") {
            //#region existing OP
            $scope.OP = thisOP;
            //formatted as date for datepicker
            $scope.OP.DATE_ESTABLISHED = makeAdate($scope.OP.DATE_ESTABLISHED);

            if ($scope.OP.DATE_RECOVERED != null)
                $scope.OP.DATE_RECOVERED = makeAdate($scope.OP.DATE_RECOVERED);

            if (thisOPControls.length > 0) {
                $scope.addedIdentifiers = thisOPControls;
                $scope.showControlIDinput = true;
            }
            //see if there's any OPFiles
            OBJECTIVE_POINT.getOPFiles({ id: $scope.OP.OBJECTIVE_POINT_ID }, function success(response) {
                $scope.OPFiles = response;
            }, function error(errorResponse) {
                toastr.error("Error getting OP files: " + errorResponse.statusText);
            });

            /*carousel TODO
            $scope.myInterval = 5000;
            $scope.noWrapSlides = false;
            var slides = $scope.slides = [];
            $scope.addSlide = function () {
                var newWidth = 600 + slides.length + 1;
                slides.push({
                    image: '//placekitten.com/' + newWidth + '/300',
                    text: ['More', 'Extra', 'Lots of', 'Surplus'][slides.length % 4] + ' ' +
                      ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
                });
            };
            for (var i = 0; i < 4; i++) {
                $scope.addSlide();
            }*/

            //#endregion 
        } else {
            //#region new OP 
            $scope.OP.LATITUDE_DD = opSite.LATITUDE_DD;
            $scope.OP.LONGITUDE_DD = opSite.LONGITUDE_DD;
            $scope.OP.HDATUM_ID = opSite.HDATUM_ID;
            //default today for establised date
            $scope.OP.DATE_ESTABLISHED = makeAdate("");
            //#endregion
        }

        //default radios (has to come after OP is set one way or another)
        $scope.OP.decDegORdms = 'dd';
        $scope.OP.FTorMETER = 'ft';
        $scope.OP.FTorCM = 'ft';

        //want to add identifier
        $scope.addNewIdentifier = function () {
            $scope.addedIdentifiers.push({ OBJECTIVE_POINT_ID: $scope.OP.OBJECTIVE_POINT_ID, IDENTIFIER: "", IDENTIFIER_TYPE: "" });
            $scope.showControlIDinput = true;
        }

        //Datepicker
        $scope.datepickrs = {};
        $scope.open = function ($event, which) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.datepickrs[which] = true;
        };

        //lat/long =is number
        $scope.isNum = function (evt) {
            var theEvent = evt || window.event;
            var key = theEvent.keyCode || theEvent.which;
            if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                theEvent.returnValue = false;
                if (theEvent.preventDefault) theEvent.preventDefault();
            }
        };

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
            if ($scope.OP.decDegORdms == "dd") {
                //they clicked Dec Deg..
                if ($scope.DMS.LADeg != undefined) {
                    //convert what's here for each lat and long
                    $scope.OP.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                    $scope.OP.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                    //clear
                    $scope.DMS = {};
                }
            } else {
                //they clicked dms (convert lat/long to dms)
                if ($scope.OP.LATITUDE_DD != undefined) {
                    var latDMS = (deg_to_dms($scope.OP.LATITUDE_DD)).toString();
                    var ladDMSarray = latDMS.split(':');
                    $scope.DMS.LADeg = ladDMSarray[0];
                    $scope.DMS.LAMin = ladDMSarray[1];
                    $scope.DMS.LASec = ladDMSarray[2];

                    var longDMS = deg_to_dms($scope.OP.LONGITUDE_DD);
                    var longDMSarray = longDMS.split(':');
                    $scope.DMS.LODeg = longDMSarray[0] * -1;
                    $scope.DMS.LOMin = longDMSarray[1];
                    $scope.DMS.LOSec = longDMSarray[2];
                    //clear
                    $scope.OP.LATITUDE_DD = undefined; $scope.OP.LONGITUDE_DD = undefined;
                }
            }
        }

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

        //cancel modal
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        //fix default radios and lat/long
        var formatDefaults = function (theOP) {
            //$scope.OP.FTorMETER needs to be 'ft'. if 'meter' ==convert value to ft 
            if (theOP.FTorMETER == "meter") {
                $scope.OP.FTorMETER = 'ft';
                $scope.OP.ELEV_FT = $scope.OP.ELEV_FT * 3.2808;
            }
            //$scope.OP.FTorCM needs to be 'ft'. if 'cm' ==convert value to ft 
            if (theOP.FTorCM == "cm") {
                $scope.OP.FTorCM = 'ft'
                $scope.OP.UNCERTAINTY = $scope.OP.UNCERTAINTY / 30.48;
            }
            //$scope.OP.decDegORdms needs to be 'dd'. if 'dms' ==convert $scope.DMS values to dd
            if (theOP.decDegORdms == "dms") {
                $scope.OP.decDegORdms = 'dd';
                $scope.OP.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                $scope.OP.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                $scope.DMS = {};
                $scope.OP.SITE_ID = $scope.thisOPsite.SITE_ID;
            }
        }

        //Create this OP
        $scope.create = function () {
            if (this.OPForm.$valid) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';
                var createdOP = {};
                //post
                formatDefaults($scope.OP); //$scope.OP.FTorMETER, FTorCM, decDegORdms                               
                var OPtoPOST = trimOP($scope.OP); //make it an OBJECTIVE_POINT for saving

                OBJECTIVE_POINT.save(OPtoPOST, function success(response) {
                    toastr.success("Objective Point created");
                    createdOP = response;
                    if ($scope.addedIdentifiers.length > 0) {
                        //post each one
                        for (var opc = 0; opc < $scope.addedIdentifiers.length; opc++)
                            OBJECTIVE_POINT.createOPControlID({ id: response.OBJECTIVE_POINT_ID }, $scope.addedIdentifiers[opc]).$promise;
                    }
                }).$promise.then(function () {
                    var sendBack = [createdOP, 'created'];
                    $modalInstance.close(sendBack);
                });
            } else {
                alert("Please populate all required fields");
            }
        } //end Create

        //X was clicked next to existing Control Identifier to have it removed, store in remove array for Save()
        $scope.RemoveID = function (opControl) {
            //only add to remove list if it's an existing one to DELETE
            var i = $scope.addedIdentifiers.indexOf(opControl);
            if (opControl.OP_CONTROL_IDENTIFIER_ID != undefined) {
                $scope.removeOPCarray.push(opControl);
                $scope.addedIdentifiers.splice(i, 1);
            } else {
                $scope.addedIdentifiers.splice(i, 1);
            }
        }

        //Save this OP
        $scope.save = function () {
            if ($scope.OPForm.$valid) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common['Accept'] = 'application/json';

                var updatedOP = {};
                //if there's an OP_CONTROL_IDENTIFIER_ID, PUT .. else POST
                if ($scope.addedIdentifiers.length > 0) {
                    for (var i = 0; i < $scope.addedIdentifiers.length; i++) {
                        if ($scope.addedIdentifiers[i].OP_CONTROL_IDENTIFIER_ID != undefined) {
                            //existing: PUT
                            OP_CONTROL_IDENTIFIER.update({ id: $scope.addedIdentifiers[i].OP_CONTROL_IDENTIFIER_ID }, $scope.addedIdentifiers[i]).$promise;
                        } else {
                            //post each one
                            OBJECTIVE_POINT.createOPControlID({ id: $scope.OP.OBJECTIVE_POINT_ID }, $scope.addedIdentifiers[i]).$promise;
                        }
                    }//end foreach addedIdentifier
                }//end if there's addedidentifiers

                //if there's any in removeOPCarray, DELETE those
                if ($scope.removeOPCarray.length > 0) {
                    for (var r = 0; r < $scope.removeOPCarray.length; r++) {
                        OP_CONTROL_IDENTIFIER.delete({ id: $scope.removeOPCarray[r].OP_CONTROL_IDENTIFIER_ID }).$promise;
                    }//end foreach removeOPCarray
                }//end if there's removeOPCs

                //look at OP.FTorMETER ("ft"), OP.FTorCM ("ft"), and OP.decDegORdms ("dd"), make sure site_ID is on there and send it to trim before PUT
                formatDefaults($scope.OP); //$scope.OP.FTorMETER, FTorCM, decDegORdms
                var OPtoPOST = trimOP($scope.OP);
                //$http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                OBJECTIVE_POINT.update({ id: OPtoPOST.OBJECTIVE_POINT_ID }, OPtoPOST, function success(response) {
                    toastr.success("Objective Point updated");
                    updatedOP = response;
                    //    delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                }).$promise.then(function () {
                    var sendBack = [updatedOP, 'updated'];
                    $modalInstance.close(sendBack);
                });
            } else {
                alert("Please populated all required fields");
            }
        } //end Save

        //delete this OP from the SITE
        $scope.deleteOP = function () {
            //TODO:: Delete the files for this OP too or reassign to the Site?? Services or client handling?
            var DeleteModalInstance = $modal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    nameToRemove: function () {
                        return $scope.OP;
                    },
                    what: function () {
                        return "Objective Point";
                    }
                }
            });

            DeleteModalInstance.result.then(function (opToRemove) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                OBJECTIVE_POINT.delete({ id: opToRemove.OBJECTIVE_POINT_ID }, opToRemove).$promise.then(function () {
                    toastr.success("Objective Point Removed");
                    var sendBack = ["de", 'deleted'];
                    $modalInstance.close(sendBack);
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
            }, function () {
                //logic for cancel
            });//end modal
        }
    }//end OPmodalCtrl

    ModalControllers.controller('HWMmodalCtrl', ['$scope', '$cookies', '$http', '$modalInstance', '$modal', 'allDropdowns', 'thisHWM', 'hwmSite', 'allMembers', 'HWM', HWMmodalCtrl]);
    function HWMmodalCtrl($scope, $cookies, $http, $modalInstance, $modal, allDropdowns, thisHWM, hwmSite, allMembers, HWM) {
        //TODO:: check to see if they chose an event.. if not, they need to before creating a hwm
        //dropdowns
        $scope.hwmTypeList = allDropdowns[0];
        $scope.hwmQualList = allDropdowns[1];
        $scope.HDatumsList = allDropdowns[2];
        $scope.hCollMList = allDropdowns[3];
        $scope.VDatumsList = allDropdowns[4];
        $scope.vCollMList = allDropdowns[5];
        $scope.markerList = allDropdowns[6];
        $scope.eventList = allDropdowns[7];
        $scope.userRole = $cookies.get('usersRole');
        $scope.FlagMember = ""; //just for show on page
        $scope.SurveyMember = ""; //just for show on page
        $scope.showEventDD = false; //toggle to show/hide event dd (admin only)

        //button click to show event dropdown to change it on existing hwm (admin only)
        $scope.showChangeEventDD = function () {
            $scope.showEventDD = !$scope.showEventDD;
        }

        //change event = apply it to the $scope.EventName
        $scope.ChangeEvent = function () {
            $scope.EventName = $scope.eventList.filter(function (el) { return el.EVENT_ID == $scope.aHWM.EVENT_ID; })[0].EVENT_NAME;
        }
        // $scope.sessionEvent = $cookies.get('SessionEventName');
        $scope.LoggedInMember = allMembers.filter(function (m) { return m.MEMBER_ID == $cookies.get('mID'); })[0];

        $scope.aHWM = {};
        $scope.DMS = {};
        $scope.thisHWMsite = hwmSite;

        //Datepicker
        $scope.datepickrs = {};
        $scope.open = function ($event, which) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.datepickrs[which] = true;
        };

        //cancel
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
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
            if ($scope.aHWM.decDegORdms == "dd") {
                //they clicked Dec Deg..
                if ($scope.DMS.LADeg != undefined) {
                    //convert what's here for each lat and long
                    $scope.aHWM.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                    $scope.aHWM.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                    //clear
                    $scope.DMS = {};
                }
            } else {
                //they clicked dms (convert lat/long to dms)
                if ($scope.aHWM.LATITUDE_DD != undefined) {
                    var latDMS = (deg_to_dms($scope.aHWM.LATITUDE_DD)).toString();
                    var ladDMSarray = latDMS.split(':');
                    $scope.DMS.LADeg = ladDMSarray[0];
                    $scope.DMS.LAMin = ladDMSarray[1];
                    $scope.DMS.LASec = ladDMSarray[2];

                    var longDMS = deg_to_dms($scope.aHWM.LONGITUDE_DD);
                    var longDMSarray = longDMS.split(':');
                    $scope.DMS.LODeg = longDMSarray[0] * -1;
                    $scope.DMS.LOMin = longDMSarray[1];
                    $scope.DMS.LOSec = longDMSarray[2];
                    //clear
                    $scope.aHWM.LATITUDE_DD = undefined; $scope.aHWM.LONGITUDE_DD = undefined;
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

        if (thisHWM != "empty") {
            //#region existing HWM
            $scope.aHWM = thisHWM;
            //get this hwm's event name
            $scope.EventName = $scope.eventList.filter(function (e) { return e.EVENT_ID == $scope.aHWM.EVENT_ID; })[0].EVENT_NAME;
            //date formatting
            $scope.aHWM.FLAGGED_DATE = makeAdate($scope.aHWM.FLAGGED_DATE);

            //if this is surveyed, date format and get survey member's name
            if ($scope.aHWM.SURVEY_DATE != null) {
                $scope.aHWM.SURVEY_DATE = makeAdate($scope.aHWM.SURVEY_DATE);
                $scope.SurveyMember = allMembers.filter(function (m) { return m.MEMBER_ID == $scope.aHWM.SURVEY_TEAM_ID; })[0];
            }

            //get flagging member's name
            $scope.FlagMember = allMembers.filter(function (m) { return m.MEMBER_ID == $scope.aHWM.FLAG_TEAM_ID; })[0];

            //save aHWM
            $scope.save = function () {                
                if ($scope.HWMForm.$valid) {
                    var updatedHWM = {};
                    if ($scope.aHWM.SURVEY_DATE != undefined)
                        $scope.aHWM.SURVEY_TEAM_ID = $cookies.get('mID');

                    if ($scope.aHWM.ELEV_FT != undefined) {
                        //make sure they added the survey date if they added an elevation
                        if ($scope.aHWM.SURVEY_DATE == undefined)
                            $scope.aHWM.SURVEY_DATE = makeAdate("");

                        $scope.aHWM.SURVEY_TEAM_ID = $cookies.get('mID');
                    }
                
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    HWM.update({ id: $scope.aHWM.HWM_ID }, $scope.aHWM).$promise.then(function (response) {
                        toastr.success("HWM updated");
                        updatedHWM = response;
                        var sendBack = [updatedHWM, 'updated'];
                        $modalInstance.close(sendBack);
                    });                
                } else {
                    alert("Please populate all required fields.");
                }
            }//end save()

            //delete aHWM
            $scope.deleteHWM = function () {
                //TODO:: Delete the files for this OP too or reassign to the Site?? Services or client handling?
                var DeleteModalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return $scope.aHWM
                        },
                        what: function () {
                            return "HWM";
                        }
                    }
                });

                DeleteModalInstance.result.then(function (hwmToRemove) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    HWM.delete({ id: hwmToRemove.HWM_ID }, hwmToRemove).$promise.then(function () {
                        toastr.success("HWM Removed");
                        var sendBack = ["de", 'deleted'];
                        $modalInstance.close(sendBack);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            }

            //#endregion existing HWM
        } else {
            //#region new HWM
            //use site's LAT, LONG, WATERBODY, HDATUM, HCOLLECTMETHOD, set FLAGDATE with today
            $scope.aHWM = {
                SITE_ID: $scope.thisHWMsite.SITE_ID,
                EVENT_ID: $cookies.get('SessionEventID'),
                HWM_ENVIRONMENT: 'Riverine',
                BANK: 'N/A',
                STILLWATER: 0,
                LATITUDE_DD: hwmSite.LATITUDE_DD,
                LONGITUDE_DD: hwmSite.LONGITUDE_DD,
                WATERBODY: hwmSite.WATERBODY,
                HDATUM_ID: hwmSite.HDATUM_ID,
                HCOLLECT_METHOD_ID: hwmSite.HCOLLECT_METHOD_ID,
                FLAG_DATE: makeAdate(""),
                FLAG_TEAM_ID: $scope.LoggedInMember.MEMBER_ID //need to make this FLAG_MEMBER_ID ... and at SiteCtrl level get all members and pass to these modals to filter for member info to show
            };
            $scope.EventName = $cookies.get('SessionEventName');
            $scope.FlagMember = $scope.LoggedInMember;

            $scope.create = function () {
                if (this.HWMForm.$valid) {
                    var createdHWM = {};
                    //if they entered a survey date or elevation, then set survey member as the flag member (flagging and surveying at same time
                    if ($scope.aHWM.SURVEY_DATE != undefined) 
                        $scope.aHWM.SURVEY_TEAM_ID = $scope.FLAG_TEAM_ID;

                    if ($scope.aHWM.ELEV_FT != undefined) {
                        //make sure they added the survey date if they added an elevation
                        if ($scope.aHWM.SURVEY_DATE == undefined)
                            $scope.aHWM.SURVEY_DATE = makeAdate("");

                        $scope.aHWM.SURVEY_TEAM_ID = $scope.FLAG_TEAM_ID;
                    }

                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    HWM.save($scope.aHWM).$promise.then(function (response) {
                        createdHWM = response;
                        toastr.success("HWM created");
                        var sendBack = [createdHWM, 'created'];
                        $modalInstance.close(sendBack);
                    });
                } else {
                    alert("Please populate all required fields");
                }
            }//end create()
            //#endregion new HWM
        }
        //radio button defaults
        $scope.aHWM.decDegORdms = 'dd';



    } //end HWM

    ModalControllers.controller('SessionEventmodalCtrl', ['$scope', '$rootScope', '$cookies', '$modalInstance', 'allEvents', 'allEventTypes', 'allStates', 'EVENT', SessionEventmodalCtrl]);
    function SessionEventmodalCtrl($scope, $rootScope, $cookies, $modalInstance, allEvents, allEventTypes, allStates, EVENT) {
        $scope.EventList = allEvents;
        $scope.EventTypeList = allEventTypes;
        $scope.StateList = allStates;
        var chosenEv = $cookies.get('SessionEventID'); //see if we need to select the session event
        $scope.event = { EventChosen: chosenEv != undefined ? Number(chosenEv) : "" };

        //filters chosen, only show these events
        $scope.filterEvents = function () {
            //?Date: null, Type: 0, State: null
            var d = $scope.event.DATE != null && $scope.event.DATE != undefined ? $scope.event.DATE : null;
            var t = $scope.event.TYPE != null && $scope.event.TYPE != undefined ? $scope.event.TYPE : 0;
            var s = $scope.event.STATE != null && $scope.event.STATE != undefined ? $scope.event.STATE : null;
            EVENT.getFilteredEvents({ Date: d, Type: t, State: s }).$promise.then(function (response) {
                $scope.EventList = response;
            });
        }

        //event has been chosen. Set it as session event
        $scope.setEvent = function () {
            $scope.evID = $scope.event.EventChosen;
            var eventName = allEvents.filter(function (x) { return x.EVENT_ID == $scope.evID; })[0];
            $cookies.put('SessionEventID', $scope.evID);
            $cookies.put('SessionEventName', eventName.EVENT_NAME);

            $rootScope.sessionEvent = "Session Event: " + eventName.EVENT_NAME + ".";
            $modalInstance.dismiss('cancel');
        }

        //they want to clear the session event
        $scope.clearEvent = function () {
            $scope.event = {};
            $cookies.remove('SessionEventID');
            $cookies.remove('SessionEventName');
            $rootScope.sessionEvent = "";
            $modalInstance.dismiss('cancel');
        }

        //Datepicker
        $scope.datepickrs = {};
        $scope.open = function ($event, which) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.datepickrs[which] = true;
        };

        //cancel
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    };

}());