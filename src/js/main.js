$(function() {

    function performRegistration() {
        $.mobile.showPageLoadingMsg();
        var username = $("#username").val();
        var password = $("#password").val();
        try {
            jukax.accountCreate(username, password, {
                success:function() {
                    buildCal(year, month);
                    $.mobile.changePage("#cal");
                    $.mobile.hidePageLoadingMsg();
                },
                failure: function(o) {
                    $.mobile.hidePageLoadingMsg();
                    if (o.type==jukax.ERROR_CREATING_USER) {alert("Unable to register: " + o.message);}
            }});
        } catch (e) {
            $.mobile.hidePageLoadingMsg();
            alert("Unable to register: " + e.message);
            Kii.logger("Unable to register user: " + e.message);
        }
    }

    function performLogin() {
        $.mobile.showPageLoadingMsg();
        var username = $("#username").val();
        var password = $("#password").val();
        jukax.accountLogin(username, password, {success:, failure});
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
    ;
    Kii.initializeWithSite("ea716d13", "60ac553a1539a79cf9f44a98642be971", KiiSite.US);

    $("#register-button").click(performRegistration);
    $("#login-button").click(performLogin);
    $("#prevMonth").click(_.prevMonth);
    $("#nextMonth").click(_.nextMonth);
    _.newb.click(_.newEvent);
    $("#logout").click(_.logout);
    $("#logout2").click(_.logout);
    $("#save").click(_.saveEvent);
    $("#gotoEvents").click(_.buildeventsList);
    $("#deletedatabutton").click(_.deleteData);
    $("#updatepasswordbutton").click(_.updatePassword);
    $("#deleteaccountbutton").click(_.deleteAccount);
//$("#cal-container").niceScroll();


});
