$(function() {

    function performRegistration() {
        $.mobile.showPageLoadingMsg();
        var username = $("#username").val();
        var password = $("#password").val();
        try {
            jukax.accountCreate(username, password, {
                success: function() {
                    buildCal(year, month);
                    $.mobile.changePage("#cal");
                    $.mobile.hidePageLoadingMsg();
                },
                failure: function(e) {
                    $.mobile.hidePageLoadingMsg();
                    if (e.type == jukax.ERROR_CREATING_USER) {
                        alert("Unable to register: " + e.message);
                    }
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
        jukax.accountLogin(username, password, {success:
                    function() {
                        buildCal(year, month);
                        $.mobile.changePage("#cal");
                        $.mobile.hidePageLoadingMsg();
                    }, failure: function(e) {
                $.mobile.hidePageLoadingMsg();
                if (e.type == jukax.ERROR_LOGIN) {
                    alert("Unable to login: " + e.message);
                }
            }});

    }
    ;

    jukax.initialize("ea716d13", "60ac553a1539a79cf9f44a98642be971", KiiSite.US);

    //Click Events
    $("#register-button").click(performRegistration);
    $("#login-button").click(performLogin);
    $("#logout").click(jukax.accountDelete({success: function() {
            $.mobile.changePage("#login");
        }}));
    $("#logout2").click(jukax.accountDelete({success: function() {
            $.mobile.changePage("#login");
        }}));
    $("#deleteaccountbutton").click(jukax.accountDelete({success: function() {
            $.mobile.changePage("#login");
        }}));
    $("#updatepasswordbutton").click(function() {
        try {
            jukax.accountUpdatePassword(
                    $("#updatepasswordnew").val(),
                    $("#updatepasswordold").val(),
                    {success: function() {
                            $("#updatepasswordmessage").text("Done!").css("color", "gree").show();
                            setTimeout(function() {
                                $("#updatepasswordmessage").hide();
                            }, 3000);
                        }, failure: function(e) {
                            if (e.type == jukax.ERROR_UNVALID_INPUT) {
                                alert(e.message);
                            } else if (e.type == jukax.ERROR_UPDATING_PASSWORD) {
                                $("#updatepasswordmessage").text("Failed!").css("color", "red").show();
                                setTimeout(function() {
                                    $("#updatepasswordmessage").hide();
                                }, 3000);
                            } else {
                                $("#updatepasswordmessage").text("Relogin needed!").css("color", "yellow").show();
                                setTimeout(function() {
                                    $("#updatepasswordmessage").hide();
                                    $.mobile.changePage("#login");
                                }, 3000);
                            }
                        }});
        }
        catch (e) {
            $("#updatepasswordmessage").text("Failed!").css("color", "red").show();
            setTimeout(function() {
                $("#updatepasswordmessage").hide();
            }, 3000);
        }
        ;
        $("#updatepasswordnew").val("");
        $("#updatepasswordold").val("")
    });
    $("#deletedatabutton").click(jukax.eventsCleanup({
        success: function() {
            buildCal(year, month);
            $("#deletedatamessage").text("Done!").css("color", "gree").show();
            setTimeout(function() {
                $("#deletedatamessage").hide();
            }, 3000);
        },
        failure: function(e) {
            if (e.type == jukax.ERROR_CLEANINGUP_EVENTS) {
                $("#deletedatamessage").text("Failed!").css("color", "red").show();
                setTimeout(function() {
                    $("#deletedatamessage").hide();
                }, 3000);
            } else {
                $("#deletedatamessage").text("Relogin needed!").css("color", "yellow").show();
                setTimeout(function() {
                    $("#deletedatamessage").hide();
                    $.mobile.changePage("#login");
                }, 3000);
            }
        }}));





    $("#prevMonth").click(_.prevMonth);
    $("#nextMonth").click(_.nextMonth);
    _.newb.click(_.newEvent);
    $("#save").click(_.saveEvent);
    $("#gotoEvents").click(_.buildeventsList);
//$("#cal-container").niceScroll();


});
