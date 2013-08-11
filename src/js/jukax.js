var user, data, bucket;
var ERROR_SAVING_DATA = 3;
var ERROR_CREATING_USER = 4;
var ERROR_QUERY_FAILURE = 5;
var ERROR_LOGIN = 6;
var ERROR_REFRESHING_DATA = 7;

Kii.initializeWithSite("ea716d13", "60ac553a1539a79cf9f44a98642be971", KiiSite.US);

var accountCreate = function(username, password, fn) {
    fn = typeof fn !== 'undefined' ? fn : {
    }
    ;
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
                                    fn.failure({type: 7, message: error})
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

}
