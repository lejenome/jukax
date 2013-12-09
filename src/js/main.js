/* global $ */
$(function () {
    "use strict";
    // disable var++ errors on JSLint
    /* jslint plusplus: true */
    // stop some "<X>" was used before it was def error
    /* jslint devel: true */
    /* jslint browser: true */
    /* global jukax */


    /*var user, data, bucket;*/
    var monthField = $("#monthField"), // current month on the calendar
        listview = $("#listview"), // list of events on selected day
        newb = $("#new"), // new button to create new event on selected day
        lastPage = "#cal", //last page cal or events
        form = {
            title: $("#title"),
            where: $("#where"),
            note: $("#note"),
            time: $("#time"),
            repeat: "once",
            reminder: "no",
            level: $("#level-A"),
            created: null
        },
        //functions list
        newEventAction,
        date = new Date(),
        //months US short symbol
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        year = date.getFullYear().toString(),
        month = (date.getMonth() + 1).toString(),
        day = date.getDate().toString();

    if (month.length === 1) {
        month = "0" + month;
    }
    
    newEventAction = function () {
        day = $(this).text();
        updateListview();
        newb.click(newEvent);
        newb.show();
    };

    function nextMonth() { //show next month
        if (month === "12") {
            month = "01";
            year = (parseInt(year, 10) + 1).toString();
        } else {
            month = (parseInt(month, 10) + 1).toString();
        }
        if (month.length === 1) {
            month = "0" + month;
        }
        buildCal(year, month);
    }

    function prevMonth() { //show prev month
        if (month === "01") {
            month = "12";
            year = (parseInt(year, 10) - 1).toString();
        } else {
            month = (parseInt(month, 10) - 1).toString();
        }
        if (month.length === 1) {
            month = "0" + month;
        }
        buildCal(year, month);
    }

    //Updating the list of events on the selected day
    function updateListview() {
        $.mobile.loading("show");
        listview.empty();
        var YMD = year + month + day,
            events = jukax.eventsGet(YMD),
            i,
            row,
            link,
            linkEvent = function () {
                editEvent($(this).data("created"), YMD);
            };
        if (events !== null) {
            for (i = 0; i < events.length; i++) {
                row = $("<li></li>");
                link = $("<a></a>").click(linkEvent);
                if (events[i].level === "C") {
                    row.data("theme", "b");
                } else if (events[i].level === "B") {
                    row.data("theme", "e");
                } else {
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
        $.mobile.loading("hide");
        // Add event delete by swaping left/right on supported devices
        $(document).on("swipeleft swiperight", "#listview li", function (event) {
            var listitem = $(this),
                // These are the classnames used for the CSS transition
                dir = event.type === "swipeleft" ? "left" : "right",
                // Check if the browser supports the transform (3D) CSS transition
                transition = $.support.cssTransform3d ? dir : false;
            confirmAndDelete(listitem, transition);
        });
    }

    //return the nbre of days on a month
    function daysInMonth(year, month) {
        return [31, (((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    //Create new calendar item
    function newTD(str, date) {
        var td = $("<td></td>");
        if (str !== null) {
            td.text(str);
            td.click(newEventAction);
        } else {
            td.attr("colspan", "1");
        }
        if (date !== null && jukax.eventsGet(date)) {
            td.attr("class", "date_has_event");
        }
        return td;
    }

    //Building the calendar on a given Month
    function buildCal(year, month) {
        window.year = year;
        window.month = month;
        var d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1),
            i = 1,
            j = 1,
            tr = $("<tr></tr>"),
            /*td,*/
            tbody = $("tbody"),
            x;
        tbody.empty();

        while (i < d.getDay() || (d.getDay() === 0 && i < 7)) {
            tr.append(newTD(null, null));
            i++;
        }
        d.setDate(daysInMonth(parseInt(year, 10), parseInt(month, 10) - 1));
        x = d.getDate() + i;
        while (i < x) {
            tr.append(newTD(j.toString(), year + month + j.toString));
            if (i % 7 === 0) {
                tbody.append(tr);
                tr = $("<tr></tr>");
            }
            i++;
            j++;
        }
        if (d.getDay() !== 0) {
            i = d.getDay();
            while (i < 7) {
                tr.append(newTD(null, null));
                i++;
            }
            tbody.append(tr);
        }
        listview.empty();
        newb.hide();
        monthField.text(months[parseInt(month, 10) - 1] + " " + year);
        $("#controlgroup").controlgroup();

    }

    function editEvent(created, YMD) {
        var e = jukax.eventsGet(YMD, created);
        if (e === null) {
            newEvent();
        } else {
            form.title.val(e.title);
            form.where.val(e.where);
            form.note.val(e.note);
            form.time.val(e.time);
            /*form.repeat = $('#repeat option[value="'+e.repeat+'"]').attr("selected", true).checkboxradio("refresh").val();
             form.reminder = $('#reminder option[value="'+e.reminder+'"]').attr("selected", true).val();*/
            form.level = $("#level-radio :radio").attr("checked", false).closest("#level-radio").find("#level-" + e.level).attr("checked", true);
            form.created = e.created;
            $("#delete").click(function () {
                deleteEvent(created, YMD);
            });
            $("#delete").show();
            $.mobile.changePage("#eventPage");
        }
    }

    function getHM() { //get Hours:Minutes String
        var time = new Date(),
            hours = time.getHours().toString(),
            minutes = time.getMinutes().toString();
        if (hours.length === 1) {
            hours = "0" + hours;
        }
        if (minutes.length === 1) {
            minutes = "0" + minutes;
        }
        return hours + ":" + minutes;
    }

    function newEvent() {
        form.title.val("");
        form.where.val("");
        form.note.val("");
        form.time.val(getHM());
        form.level = $("#level-radio :radio").attr("checked", false).closest("#level-radio").find("#level-A").val();
        form.created = null;
        $("#delete").hide();
        $.mobile.changePage("#eventPage");
        $("#level-radio :radio").checkboxradio("refresh");
    }

    function saveEvent() {
        var event = {
            title: form.title.val(),
            where: form.where.val(),
            note: form.note.val(),
            time: form.time.val(),
            repeat: "once",
            reminder: "no",
            level: $("#level-radio input:checked").val(),
            created: form.createdd
        };
        jukax.eventsUpdate(year + month + day, event);
        updateListview();
        $.mobile.changePage(lastPage);
    }

    function deleteEvent(created, YMD) {
        jukax.eventsDelete(YMD, created);
        updateListview();
        if (lastPage == "#events") {
            buildeventsList();
        }
        $.mobile.changePage(lastPage);
    }

    function confirmAndDelete(listitem, transition) {
        // Highlight the list item that will be removed
        listitem.children(".ui-btn").addClass("ui-btn-active");
        // Show the confirmation popup
        $("#confirmDelete").popup("open");
        // Proceed when the user confirms
        $("#confirmDelete .yes").on("click", function () {
            jukax.eventsDelete(year + month + day, listitem.children("a").data("created"));
            // Remove with a transition
            if (transition) {
                listitem
                // Add the class for the transition direction
                .addClass(transition)
                // When the transition is done...
                .on("webkitTransitionEnd transitionend otransitionend", function () {
                    // ...the list item will be removed
                    listitem.remove();
                    // ...the list will be refreshed and the temporary class for border styling removed
                    listview.listview("refresh").find(".border-bottom").removeClass("border-bottom");
                })
                // During the transition the previous button gets bottom border
                .prev("li").children("a").addClass("border-bottom")
                // Remove the highlight
                .end().end().children(".ui-btn").removeClass("ui-btn-active");
            }
            // If it's not a touch device or the CSS transition isn't supported just remove the list item and refresh the list
            else {
                listitem.remove();
                listview.listview("refresh");
            }
        });
        // Remove active state and unbind when the cancel button is clicked
        $("#confirmDelete .cancel").on("click", function () {
            listitem.removeClass("ui-btn-active");
            $("#confirmDelete .yes").off();
        });
    }

    function buildeventsList() {
        $.mobile.loading("show");
        var evlist = $("#eventsList"),
            i,
            events,
            row,
            link,
            datesData,
            date,
            linkEvent = function () {
                editEvent($(this).data("created"), $(this).data("date"));
            };
        evlist.empty();
        datesData = jukax.dataGet().get("data");
        for (date in datesData) {
            if (!datesData.hasOwnProperty(date)) {
                events = null;
            }
            events = jukax.eventsGet(date);
            if (events) {
                evlist.append($("<li></li>").data("role", "list-divider").data("theme", "a").text(date.substring(6) + "/" + date.substr(4, 2) + "/" + date.substr(0, 4)).append($("<span></span>").attr("class", "ui-li-count").data("theme", "a").text(events.length.toString())));

                for (i = 0; i < events.length; i++) {
                    row = $("<li></li>");
                    link = $("<a></a>").click(linkEvent);
                    if (events[i].level === "C") {
                        row.data("theme", "b");
                    } else if (events[i].level === "B") {
                        row.data("theme", "e");
                    } else {
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
        }
        $.mobile.changePage("#events");
        lastPage = "#events";
        evlist.listview("refresh");
        $.mobile.loading("hide");
        // Add event delete by swaping left/right on supported devices
        /*$(document).on("swipeleft swiperight", "#eventsList li", function (event) {
            var listitem = $(this),
                // These are the classnames used for the CSS transition
                dir = event.type === "swipeleft" ? "left" : "right",
                // Check if the browser supports the transform (3D) CSS transition
                transition = $.support.cssTransform3d ? dir : false;
            confirmAndDeleteFromEventsList(listitem, transition);
        });*/
    }

    function confirmAndDeleteFromEventsList(listitem, transition) {
        var eventsList = $("#eventsList");
        // Highlight the list item that will be removed
        listitem.children(".ui-btn").addClass("ui-btn-active");
        // Show the confirmation popup
        $("#confirmDeleteFromEventsList").popup("open");
        // Proceed when the user confirms
        $("#confirmDeleteFromEventsList .yes").on("click", function () {
            jukax.eventsDelete(year + month + day, listitem.children("a").data("created"));
            // Remove with a transition
            if (transition) {
                listitem
                // Add the class for the transition direction
                .addClass(transition)
                // When the transition is done...
                .on("webkitTransitionEnd transitionend otransitionend", function () {
                    // ...the list item will be removed
                    listitem.remove();
                    // ...the list will be refreshed and the temporary class for border styling removed
                    eventsList.listview("refresh").find(".border-bottom").removeClass("border-bottom");
                })
                // During the transition the previous button gets bottom border
                .prev("li").children("a").addClass("border-bottom")
                // Remove the highlight
                .end().end().children(".ui-btn").removeClass("ui-btn-active");
            }
            // If it's not a touch device or the CSS transition isn't supported just remove the list item and refresh the list
            else {
                listitem.remove();
                eventsList.listview("refresh");
            }
            buildeventsList();
        });
        // Remove active state and unbind when the cancel button is clicked
        $("#confirmDeleteFromEventsList .cancel").on("click", function () {
            listitem.removeClass("ui-btn-active");
            $("#confirmDeleteFromEventsList .yes").off();
        });

    }

    function performRegistration() {
        $.mobile.loading("show");
        var username = $("#username").val(),
            password = $("#password").val();
        try {
            jukax.accountCreate(username, password, {
                success: function () {
                    buildCal(year, month);
                    $.mobile.changePage("#cal");
                    $("#username").val("");
                    $("#password").val("");
                    $.mobile.loading("hide");
                },
                failure: function (e) {
                    $.mobile.loading("hide");
                    if (e.type === jukax.ERROR_CREATING_USER) {
                        alert("Unable to register: " + e.message);
                    }
                }
            });
        } catch (e) {
            $.mobile.loading("hide");
            alert("Unable to register: " + e.message);
        }
    }

    function performLogin() {
        $.mobile.loading("show");
        var username = $("#username").val(),
            password = $("#password").val();
        jukax.accountLogin(username, password, {
            success: function () {
                buildCal(year, month);
                $.mobile.changePage("#cal");
                $("#username").val("");
                $("#password").val("");
                $.mobile.loading("hide");
            },
            failure: function (e) {
                $.mobile.loading("hide");
                if (e.type === jukax.ERROR_LOGIN) {
                    alert("Unable to login: " + e.message);
                }
            }
        });

    }
    jukax.storagesSet({
        Kii: true
    });
    jukax.initializeKii("ea716d13", "60ac553a1539a79cf9f44a98642be971");

    //Click Events
    $("#register-button").click(performRegistration);
    $("#login-button").click(performLogin);
    $("#logout").click(function () {
        jukax.accountLogout();
        $.mobile.changePage("#login");
    });
    $("#logout2").click(function () {
        jukax.accountLogout();
        $.mobile.changePage("#login");
    });
    $("#deleteaccountbutton").click(function () {
        jukax.accountDelete({
            success: function () {
                $("#deleteaccountmessage").text("Done!").css("color", "gree").show();
                setTimeout(function () {
                    $("#deleteaccountmessage").hide();
                    $.mobile.changePage("#login");
                }, 2000);
            },
            failure: function () {
                $("#deleteaccountmessage").text("Failed!").css("color", "red").show();
                setTimeout(function () {
                    $("#deleteaccountmessage").hide();
                    $.mobile.loadPage("#login");
                }, 3000);
            }
        });
    });
    $("#updatepasswordbutton").click(function () {
        try {
            jukax.accountUpdatePassword(
                $("#updatepasswordold").val(),
                $("#updatepasswordnew").val(), {
                    success: function () {
                        $("#updatepasswordmessage").text("Done!").css("color", "gree").show();
                        setTimeout(function () {
                            $("#updatepasswordmessage").hide();
                        }, 3000);
                    },
                    failure: function (e) {
                        if (e.type === jukax.ERROR_UNVALID_INPUT) {
                            alert(e.message);
                        } else if (e.type === jukax.ERROR_UPDATING_PASSWORD) {
                            $("#updatepasswordmessage").text("Failed!").css("color", "red").show();
                            setTimeout(function () {
                                $("#updatepasswordmessage").hide();
                            }, 3000);
                        } else {
                            $("#updatepasswordmessage").text("Relogin needed!").css("color", "yellow").show();
                            setTimeout(function () {
                                $("#updatepasswordmessage").hide();
                                $.mobile.changePage("#login");
                            }, 3000);
                        }
                    }
                }
            );
        } catch (e) {
            $("#updatepasswordmessage").text("Failed!").css("color", "red").show();
            setTimeout(function () {
                $("#updatepasswordmessage").hide();
            }, 3000);
        }
        $("#updatepasswordnew").val("");
        $("#updatepasswordold").val("");
    });
    $("#deletedatabutton").click(function () {
        jukax.eventsCleanup({
            success: function () {
                buildCal(year, month);
                $("#deletedatamessage").text("Done!").css("color", "gree").show();
                setTimeout(function () {
                    $("#deletedatamessage").hide();
                }, 3000);
            },
            failure: function (e) {
                if (e.type === jukax.ERROR_CLEANINGUP_EVENTS) {
                    $("#deletedatamessage").text("Failed!").css("color", "red").show();
                    setTimeout(function () {
                        $("#deletedatamessage").hide();
                    }, 3000);
                } else {
                    $("#deletedatamessage").text("Relogin needed!").css("color", "yellow").show();
                    setTimeout(function () {
                        $("#deletedatamessage").hide();
                        $.mobile.changePage("#login");
                    }, 3000);
                }
            }
        });
    });
    $("#gotoCal").click(function () {
        lastPage = "#cal";
        $.mobile.changePage("#cal");
    });





    $("#prevMonth").click(prevMonth);
    $("#nextMonth").click(nextMonth);
    newb.click(newEvent);
    $("#save").click(saveEvent);
    $("#gotoEvents").click(buildeventsList);
    $("#backbutton").click(function () {
        $.mobile.changePage(lastPage);
    });
    //$("#cal").niceScroll();  // TODO: add nicescroll for chrome packaged web apps
    //$("#events").niceScroll();

    if (!$.mobile.support.touch) {
        // Remove the class that is used to hide the delete button on touch devices
        listview.removeClass("touch");
    }
});