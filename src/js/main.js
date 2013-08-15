$(function() {

    /*var user, data, bucket;*/
    var monthField = $("#monthField"), listview = $("#listview"), newb = $("#new");
    var date = new Date();
    var year = date.getFullYear().toString(), month = (date.getMonth() + 1).toString(), day = date.getDate().toString();
    if (month.length == 1) {
        month = "0" + month;
    }
    var lastPage="#cal";//last page cal or events
    var form = {title: $("#title"), where: $("#where"), note: $("#note"), time: $("#time"),
        repeat: "once", reminder: "no", level: $("#level-A"), created: null};

//DONE
    /*var login_next = function(obj){
     data = obj;
     buildCal(year, month);
     $.mobile.changePage("#cal");
     $.mobile.hidePageLoadingMsg();
     }
     */

//show next month
    var nextMonth = function() {
        if (month == "12") {
            month = "01";
            year = (parseInt(year) + 1).toString();
        }
        else {
            month = (parseInt(month) + 1).toString();
        }
        if (month.length == 1) {
            month = "0" + month;
        }
        buildCal(year, month);
    };

//show prev month
    var prevMonth = function() {
        if (month == "01") {
            month = "12";
            year = (parseInt(year) - 1).toString();
        }
        else {
            month = (parseInt(month) - 1).toString();
        }
        if (month.length == 1) {
            month = "0" + month;
        }
        buildCal(year, month);
    };

//Updating the list of events on the selected day
    var updateListview = function() {
        $.mobile.showPageLoadingMsg();
        listview.empty();
        var YMD = year + month + day;
        var events = jukax.eventsGet(YMD);
        if (events != null) {
            for (var i = 0; i < events.length; i++) {
                var row = $("<li></li>");
                var link = $("<a></a>").click(function() {
                    editEvent($(this).data("created"), YMD);
                });
                if (events[i].level == "C") {
                    row.data("theme", "b");
                }
                else if (events[i].level == "B") {
                    row.data("theme", "e");
                }
                else {
                    row.data("theme", "d");
                }
                $(link).data("created", events[i].created);
                $(link).append("<h3>" + events[i].title + "<small>  (" + events[i].where + ")</small></h3>");
                $(link).append("<p>" + events[i].note + "</p>");
                $(link).append($("<p></p>").attr("class", "ui-li-aside").text(events[i].time));
                $(row).append(link);
                listview.append(row);
            }
        }
        listview.listview("refresh");
        $.mobile.hidePageLoadingMsg();
    };

//DONE
    var newEventAction = function() {
        day = $(this).text();
        updateListview();
        newb.click(newEvent);
        newb.show();
    };

//return the nbre of days on a month
    var daysInMonth = function(year, month) {
        return [31, (((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    };

//months US short symbol
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//Create new calendar item
    var newTD = function(str, date) {
        var td = $("<td></td>");
        if (str != null) {
            td.text(str);
            td.click(newEventAction);
        }
        else {
            td.attr("colspan", "1");
        }
        if (date != null && jukax.eventsGet(date)) {
            td.attr("class", "date_has_event");
        }
        return td;
    };

//Building the calendar on a given Month
    var buildCal = function(year, month) {
        this.year = year;
        this.month = month;
        var d = new Date(parseInt(year), parseInt(month) - 1, 1);
        var tbody = $("tbody");
        tbody.empty();
        var i = 1, j = 1;
        var tr = $("<tr></tr>");
        var td;
        while (i < d.getDay() || (d.getDay() == 0 && i < 7)) {
            tr.append(newTD(null, null));
            i++;
        }
        d.setDate(daysInMonth(parseInt(year), parseInt(month) - 1));
        var x = d.getDate() + i;
        while (i < x) {
            tr.append(newTD(j.toString(), year + month + j.toString));
            if ((i) % 7 == 0) {
                tbody.append(tr);
                tr = $("<tr></tr>");
            }
            i++;
            j++;
        }
        if (d.getDay() != 0) {
            i = d.getDay();
            while (i < 7) {
                tr.append(newTD(null, null));
                i++;
            }
            tbody.append(tr);
        }
        listview.empty();
        newb.hide();
        monthField.text(months[parseInt(month) - 1] + " " + year);
        $("#controlgroup").controlgroup();

    };

//DONE
    /*
     var logout = function() {
     data.save({success: function() {
     KiiUser.logOut();
     $.mobile.changePage("#login");
     }});
     };
     */

//DONE
    var editEvent = function(created, YMD) {
        var e = jukax.eventsGet(YMD, created);
        if (e == null) {
            newEvent();
        }
        else {
            form.title.val(e.title);
            form.where.val(e.where);
            form.note.val(e.note);
            form.time.val(e.time);
            /*form.repeat = $('#repeat option[value="'+e.repeat+'"]').attr("selected", true).checkboxradio("refresh").val();
             form.reminder = $('#reminder option[value="'+e.reminder+'"]').attr("selected", true).val();*/
            form.level = $("#level-radio :radio").attr("checked", false).closest("#level-radio").find("#level-" + e.level).attr("checked", true);
            form.created = e.created;
            $("#delete").click(function() {
                deleteEvent(created, YMD);
            });
            $("#delete").show();
            $.mobile.changePage("#eventPage");
        }
    };

//DONE
    
    var getHM = function(){//get Hours:Minutes String
        var time=new Date();
        var hours = time.getHours().toString();
        var minutes = time.getMinutes().toString();
        if (hours.length ==1){hours="0"+hours;}
        if (minutes.length == 1){minutes="0"+minutes;}
        return hours+":"+minutes;
    }
    var newEvent = function() {
        form.title.val("");
        form.where.val("");
        form.note.val("");
        form.time.val(getHM());
        form.level = $("#level-radio :radio").attr("checked", false).closest("#level-radio").find("#level-A").val();
        form.created = null;
        $("#delete").hide();
        $.mobile.changePage("#eventPage");
        $("#level-radio :radio").checkboxradio("refresh")
    };

//DONE
    var saveEvent = function() {
        var event = {title: form.title.val(), where: form.where.val(), note: form.note.val(), time: form.time.val(),
            repeat: "once", reminder: "no", level: $("#level-radio input:checked").val(), created: form.createdd};
        jukax.eventsUpdate(year + month + day, event);
        updateListview();
        $.mobile.changePage(lastPage);
    };

//DONE
    var deleteEvent = function(created, YMD) {
        jukax.eventsDelete(YMD, created);
        updateListview();
        buildeventsList();
        $.mobile.changePage(lastPage);
    };

//DONE
    var buildeventsList = function() {
        $.mobile.showPageLoadingMsg();
        var evlist = $("#eventsList");
        evlist.empty()
        for (date in jukax.dataGet().get("data")) {
            var events = jukax.eventsGet(date);
            if (events == null) {
                continue;
            }
            evlist.append($("<li></li>").data("role", "list-divider").data("theme", "a").text(date.substring(6) + "/" + date.substr(4, 2) + "/" + date.substr(0, 4)
                    ).append($("<span></span>").attr("class", "ui-li-count").data("theme", "a").text(events.length.toString())));

            for (var i = 0; i < events.length; i++) {
                var row = $("<li></li>");
                var link = $("<a></a>").click(function() {
                    editEvent($(this).data("created"), $(this).data("date"));
                });
                if (events[i].level == "C") {
                    row.data("theme", "b");
                }
                else if (events[i].level == "B") {
                    row.data("theme", "e");
                }
                else {
                    row.data("theme", "d");
                }
                $(link).data("created", events[i].created);
                $(link).data("date", date);
                $(link).append("<h3>" + events[i].title + "<small>  (" + events[i].where + ")</small></h3>");
                $(link).append("<p>" + events[i].note + "</p>");
                $(link).append($("<p></p>").attr("class", "ui-li-aside").text(events[i].time));
                $(row).append(link);
                evlist.append(row);
            }
        }
        $.mobile.changePage("#events");
        lastPage="#events"
        evlist.listview("refresh");
        $.mobile.hidePageLoadingMsg();
    }

//DONE
    /*
     var deleteData = function() {
     data.delete({success: function() {
     data = user.bucketWithName("data").createObject();
     data.set("data", {});
     data.save({success: function(o) {
     data = o;
     data.refresh({success: function(d) {
     data = d
     buildCal(year, month);
     $.mobile.changePage("#cal");
     }});
     }});
     }});
     }
     */

//DONE
    /*var updatePassword = function() {
     var p = $("#updatepasswordnew").val();
     try {
     if (p != "" && p != null && p != undefined) {
     user.updatePassword($("#updatepasswordold").val(), p, {success: function(u) {
     $("#updatepasswordnew").val("");
     $("#updatepasswordold").val("");
     user = u;
     user.refresh({success: function(u) {
     user = u;
     $.mobile.changePage("#cal");
     },
     failure: function(u, e) {
     console.log(e);
     }});
     }});
     }
     } catch (e) {
     console.log("error updating password");
     }
     }
     */

//DONE
    /*
     var deleteAccount = function() {
     user.delete({success: function() {
     $.mobile.changePage("#login");
     }});
     }
     */












    function performRegistration() {
        $.mobile.showPageLoadingMsg();
        var username = $("#username").val();
        var password = $("#password").val();
        try {
            jukax.accountCreate(username, password, {
                success: function() {
                    buildCal(year, month);
                    $.mobile.changePage("#cal");
        $("#username").val("");
        $("#password").val("");
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
        $("#username").val("");
        $("#password").val("");
                        $.mobile.hidePageLoadingMsg();
                    }, failure: function(e) {
                $.mobile.hidePageLoadingMsg();
                if (e.type == jukax.ERROR_LOGIN) {
                    alert("Unable to login: " + e.message);
                }
            }});

    }

    jukax.initialize("ea716d13", "60ac553a1539a79cf9f44a98642be971", KiiSite.US);

    //Click Events
    $("#register-button").click(performRegistration);
    $("#login-button").click(performLogin);
    $("#logout").click(function() {
        jukax.accountLogout();
        $.mobile.changePage("#login");
    });
    $("#logout2").click(function() {
        jukax.accountLogout();
        $.mobile.changePage("#login");   
    });
    $("#deleteaccountbutton").click(function() {
        jukax.accountDelete({success: function() {
            $("#deleteaccountmessage").text("Done!").css("color", "gree").show();
                            setTimeout(function() {
                                $("#deleteaccountmessage").hide();
                                $.mobile.changePage("#login");
                            }, 2000);
            },
                            failure:function(){
                                $("#deleteaccountmessage").text("Failed!").css("color", "red").show();
                                setTimeout(function() {
                                    $("#deleteaccountmessage").hide();
                                    $.mobile.loadPage("#login");
                                }, 3000);
                            
                            }});
    });
    $("#updatepasswordbutton").click(function() {
        try {
            jukax.accountUpdatePassword(
                    $("#updatepasswordold").val(),
                $("#updatepasswordnew").val(),
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
    $("#deletedatabutton").click(function() {
        jukax.eventsCleanup({
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
            }})
    });
    $("#gotoCal").click(function(){
        lastPage="#cal";
        $.mobile.changePage("#cal");
    });





    $("#prevMonth").click(prevMonth);
    $("#nextMonth").click(nextMonth);
    newb.click(newEvent);
    $("#save").click(saveEvent);
    $("#gotoEvents").click(buildeventsList);
    $("#backbutton").click(function(){
        $.mobile.changePage(lastPage);
    });
    $("#cal").niceScroll();
     $("#events").niceScroll();

});
