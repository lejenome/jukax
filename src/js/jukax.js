var user, data, bucket;
var ERROR_SAVING_DATA = 3;
var ERROR_CREATING_USER = 4;
var ERROR_QUERY_FAILURE = 5;
var ERROR_LOGIN = 6;
var ERROR_REFRESHING_DATA = 7;
var ERROR_DELETING_USER = 8;
var ERROR_UNVALID_INPUT = 9;
var ERROR_UPDATING_PASSWORD = 10;
var ERROR_CLEANINGUP_EVENTS = 11;

var initialize = function(appID, appKey, kii_site) {
    kii_site = typeof kii_site !== 'undefined' ? kii_site : KiiSite.US;
    Kii.initializeWithSite(appID, appKey, kii_site);
};

var accountCreate = function(username, password, fn) {
    fn = typeof fn !== 'undefined' ? fn : {};
    try {
        user = KiiUser.userWithUsername(username, password);
        user.register({
            success: function(Auser) {
                bucket = Auser.bucketWithName("data");
                data = bucket.createObject();
                data.set("data", {});
                data.saveAllFields({
                    success: function(theObject) {
                        theObject.refresh({
                            success: function(obj) {
                                data = obj;
                                if ("success" in fn) {
                                    fn.success();
                                }
                            },
                            failure: function(obj, error) {
                                if ("failure" in fn) {
                                    fn.failure({type: 7, message: error});
                                }
                            }});
                    },
                    failure: function(theObject, errorString) {
                        if ("failure" in fn) {
                            fn.failure({type: 3, message: errorString});
                        }
                    }
                });
            },
            failure: function(theUser, errorString) {
                if ("failure" in fn) {
                    fn.failure({type: 4, message: errorString});
                }
            }
        });
    } catch (e) {
        throw e.message;
    }
};

var accountLogin = function(username, password, fn) {
    fn = typeof fn !== 'undefined' ? fn : {};
    KiiUser.authenticate(username, password, {
        success: function(Auser) {
            user = Auser;
            bucket = user.bucketWithName("data");
            var query = KiiQuery.queryWithClause();
            var queryCallbacks = {
                success: function(queryPerformed, r, nextQuery) {
                    r[0].refresh({
                        success: function(obj) {
                            data = obj;
                            if (typeof data.get("data") === 'undefined') {
                                data.set("data", {});
                            }
                            data.save({
                                success: function(obj) {
                                    data = obj;
                                    if ("success" in fn) {
                                        fn.success();
                                    }
                                },
                                failure: function(obj, errorString) {
                                    if ("failure" in fn) {
                                        fn.failure({type: 3, message: errorString});
                                    }
                                }});
                        },
                        failure: function(obj, errorString) {
                            if ("failure" in fn) {
                                fn.failure({type: 7, message: errorString});
                            }
                        }});
                },
                failure: function(queryPerformed, errorString) {
                    if ("failure" in fn) {
                        fn.failure({type: 5, message: errorString});
                    }
                }
            };
            bucket.executeQuery(query, queryCallbacks);
        },
        failure: function(theUser, errorString) {
            if ("failure" in fn) {
                fn.failure({type: 6, message: errorString});
            }
        }
    });

};

var accountLogout = function() {
    data.save({
        success: function() {
            KiiUser.logOut();
        },
        failure: function() {
            KiiUser.logOut();
        }});
};

var accountDelete = function(fn) {
    fn = typeof fn !== 'undefined' ? fn : {};
    user.delete({
        success: function() {
            if ("success" in fn) {
                fn.success();
            }
        },
        failure: function(user, errorString) {
            if ("failure" in fn) {
                fn.failure({type: 8, message: errorString});
            }
        }});
};

var accountUpdatePassword = function(old_pw, new_pw, fn) {
    try {
        var name = user.getUsername();
        if (old_pw != "" && old_pw != null && new_pw != "" && new_pw != null) {
            user.updatePassword(old_pw, new_pw, {
                success: function(u) {
                    accountLogin(name, new_pw, fn);
                },
                failure: function(user, errorString) {
                    if ("failure" in fn) {
                        fn.failure({type: 10, message: errorString});
                    }
                }});
        } else {
            if ("failure" in fn) {
                fn.failure({type: 9, message: "Unvalid Input"});
            }
        }
    } catch (e) {
        throw e.message
    }
};

var eventsCleanup = function(fn) {
    data.delete({
        success: function() {
            data = user.bucketWithName("data").createObject();
            data.set("data", {});
            data.save({
                success: function(o) {
                    data = o;
                    data.refresh({
                        success: function(d) {
                            data = d
                            if ("success" in fn) {
                                fn.success();
                            }
                        },
                        failure: function(obj, errorString) {
                            if ("failure" in fn) {
                                fn.failure({type: 7, message: errorString});
                            }
                        }});
                },
                failure: function(obj, errorString) {
                    if ("failure" in fn) {
                        fn.failure({type: 3, message: errorString});
                    }
                }});
        },
        failure: function(obj, errorString) {
            if ("failure" in fn) {
                fn.failure({type: 11, message: errorString});
            }
        }});
};

var eventsNew = eventsUpdate = function(YMD, event) {//YMD : Year+Month+Day String
    var eventIndex = -1;
    var _event = {};
    var eventsData= data.get("data");
    if (!(YMD in eventsData)) {
        eventsData[YMD] = [];
    }
    if ("created" in event || event.created == null) {
        //eventIndex=-1;
        event.created = new Date().getTime();
    } else {
        for (var j = 0; j < eventsData[YMD].length; j++) {
            if (eventsData[YMD][j].created == event.created) {
                eventIndex = j;
                break;
            }
        }
    }
    _event.title = "title" in event ? event.title : "Note";
    _event.where = "where" in event ? event.where : "";
    _event.note = "note" in event ? event.note : "";
    _event.time = "time" in event ? event.time : "";
    _event.repeat = "repeat" in event ? event.repeat : "once";
    _event.reminder = "reminder" in event ? event.reminder : "no";
    _event.level = "level" in event ? event.level : "A";
    _event.created = event.created;
    
    if (eventIndex > -1) {
        eventsData[YMD][eventIndex] = _event;
    } else {
        eventsData[YMD].push(_event);
        eventsData[YMD].sort(function(a, b) {
            return parseInt(a.time.split(":").join("")) - parseInt(b.time.split(":").join(""));
        });
    }
    data.set("data",eventsData);
    data.save({
        success: function(obj) {
            data = obj;
            //....?????
        }, failure: function() {
            //....?????    
        }});
};

var eventsDelete = function(YMD, created) {
    if (!(YMD in data.get("data"))) {
        return;
    }
    var eventIndex = -1;
    for (var j = 0; j < data.get("data")[YMD].length; j++) {
        if (data.get("data")[YMD][j].created == created) {
            eventIndex = j;
            break;
        }
    }
    if (eventIndex == -1) {
        return;
    }
    data.get("data")[YMD].splice(eventIndex, 1);
    data.save({
        success: function(obj) {
            data = obj;
            //.....??????
        }, failure: function() {
            //.....??????
        }});
};

var eventsObject = function() {
    return {title: "", where: "", note: "", time: "", repeat: "once", reminder: "no", level: "A", created: new Date().getTime()};
};

var eventsGet = function(YMD, created) {
    if (!(YMD in data.get("data"))) {
        return null;
    }
    if (created !== undefined) {
        var eventIndex = -1;
        for (var j = 0; j < data.get("data")[YMD].length; j++) {
            if (data.get("data")[YMD][j].created == created) {
                eventIndex = j;
                break;
            }
        }
        if (eventIndex > -1) {
            return data.get("data")[YMD][eventIndex];
        }
        else {
            return null;
        }
    }
    return data.get("data")[YMD];
};

var dataGet = function() {
    return data;
};
var userGet = function() {
    return user;
};

var jukax = window.jukax = {
    userGet: userGet,
    dataGet: dataGet,
    bucket: bucket,
    ERROR_SAVING_DATA: ERROR_SAVING_DATA,
    ERROR_CREATING_USER: ERROR_CREATING_USER,
    ERROR_QUERY_FAILURE: ERROR_QUERY_FAILURE,
    ERROR_LOGIN: ERROR_LOGIN,
    ERROR_REFRESHING_DATA: ERROR_REFRESHING_DATA,
    ERROR_DELETING_USER: ERROR_DELETING_USER,
    ERROR_UNVALID_INPUT: ERROR_UNVALID_INPUT,
    ERROR_UPDATING_PASSWORD: ERROR_UPDATING_PASSWORD,
    ERROR_CLEANINGUP_EVENTS: ERROR_CLEANINGUP_EVENTS,
    initialize: initialize,
    accountCreate: accountCreate,
    accountLogin: accountLogin,
    accountLogout: accountLogout,
    accountUpdatePassword: accountUpdatePassword,
    accountDelete: accountDelete,
    eventsCleanup: eventsCleanup,
    eventsNew: eventsNew,
    eventsUpdate: eventsUpdate,
    eventsDelete: eventsDelete,
    eventsObject: eventsObject,
    eventsGet: eventsGet
};