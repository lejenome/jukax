var user, data, bucket;
var ERROR_SAVING_DATA = 3;
var ERROR_CREATING_USER = 4;
var 

Kii.initializeWithSite("ea716d13", "60ac553a1539a79cf9f44a98642be971", KiiSite.US);

var accountCreate = function(username, password, fn={}){
    try{
        user = KiiUser.userWithUsername(username, password);
        user.register({
            success: function(Auser) {
                bucket = Auser.bucketWithName("data");
                    data = bucket.createObject();
                    data.set("data", {});
                    data.saveAllFields({
                        success: function(theObject) {
                            theObject.refresh({ success:function(){
                                data = obj;
                                if( "success" in fn ) {fn.success();}
                            }});
                        },
                            failure: function(theObject, errorString) {
                                if ( "failure" in fn) {fn.failure( {type: 3, message: errorString} );}
                            }
                        });
                    },
                    failure: function(theUser, errorString) {
                        if ( "failure" in fn) { fn.failure( {type: 4, message: errorString} );}
                    }
                });
    } catch (e) {
        throw e.message;
    }
};

var accountLogin = function(username, password, fn={}){
    KiiUser.authenticate(username, password, {
            success: function(Auser) {
                _.user = Auser;
                _.bucket = _.user.bucketWithName("data");
                var query = KiiQuery.queryWithClause();
                var queryCallbacks = {
                    success: function(queryPerformed, r, nextQuery) {
                        r[0].refresh({success: function(obj) {
                                _.data = obj;
                                if (_.data.get("data") == undefined) {
                                    _.data.set("data", {});
                                }
                                _.data.save({ success:_.login_next(obj) });
                            }});
                    },
                    failure: function(queryPerformed, anErrorString) {
                        console.log("query failure");
                    }
                };
                _.bucket.executeQuery(query, queryCallbacks);
            },
            failure: function(theUser, anErrorString) {
                $.mobile.hidePageLoadingMsg();
                alert("Unable to register: " + anErrorString);
                Kii.logger("Unable to register user: " + anErrorString);
            }
        });

}