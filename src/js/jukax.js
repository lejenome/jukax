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
                                ;
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
                            if (data.get("data") == undefined) {
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
        if (old_pw != "" && old_pw != null && new_pw != "" && new_pw != null) {
            user.updatePassword(old_pw, new_pw, {
                success: function(u) {
                    user = u;
                    user.refresh({
                        success: function(u) {
                            user = u;
                            if ("success" in fn) {
                                fn.success();
                            }
                        },
                        failure: function(u, e) {
                            if ("failure" in fn) {
                                fn.failure({type: 7, message: e});
                            }
                        }});
                },
                failure: function(user, errorString) {
                    if ("failure" in fn) {
                        fn.failure({type: 10, message: e});
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

var eventsCleanup = new function(fn) {
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