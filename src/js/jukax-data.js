var user, data, bucket;
var monthField = $("#monthField"), listview = $("#listview"), newb = $("#new");
var date = new Date();
var year = date.getFullYear().toString(), month = (date.getMonth() + 1).toString(), day = (date.getDate() + 1).toString();
    if (month.length == 1) {
        month = "0" + month;
    }

var form = {title: $("#title"), where: $("#where"), note: $("#note"), time: $("#time"),
            repeat: "once", reminder: "no", level: $("#level-A"), created: null};

var login_next = function(obj){
    data = obj;
    buildCal(year, month);
    $.mobile.changePage("#cal");
    $.mobile.hidePageLoadingMsg();
}

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

var updateListview = function() {
        $.mobile.showPageLoadingMsg();
        listview.empty();
        var t = year + month + day;
        if (t in data.get("data")) {
            for (var i = 0; i < data.get("data")[t].length; i++) {
                var row = $("<li></li>");
                var link = $("<a></a>").click(function() {
                    editEvent($(this).data("created"), t);
                });
                if (data.get("data")[t][i].level == "C") {
                    row.data("theme", "b");
                }
                else if (data.get("data")[t][i].level == "B") {
                    row.data("theme", "e");
                }
                else {
                    row.data("theme", "d");
                }
                $(link).data("created", data.get("data")[t][i].created);
                $(link).append("<h3>" + data.get("data")[t][i].title + "<small>  (" + data.get("data")[t][i].where + ")</small></h3>");
                $(link).append("<p>" + data.get("data")[t][i].note + "</p>");
                $(link).append($("<p></p>").attr("class", "ui-li-aside").text(data.get("data")[t][i].time));
                $(row).append(link);
//                var editLink=$("<a></a>").attr("href","javascript:edit("+year+","+month+","+$(this).text()+","+e.created+");");
//                $(editLink).append("delete");
//                $(row).append(editLink);
                listview.append(row);
            }
        }
        listview.listview("refresh");
        $.mobile.hidePageLoadingMsg();
    };


var newEventAction = function() {
        day = $(this).text();
        updateListview();
        newb.click(newEvent);
        newb.show();
    };

var daysInMonth = function(year, month) {
        return [31, (((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    };

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var newTD = function(str, date) {
        var td = $("<td></td>");
        if (str != null) {
            td.text(str);
            td.click(newEventAction);
        }
        else {
            td.attr("colspan", "1");
        }
        if (date != null && date in data.get("data")) {
            td.attr("class", "date_has_event");
        }


        return td;
    };

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
//listview.listview("refresh");
        newb.hide();
        monthField.text(months[parseInt(month) - 1] + " " + year);
        $("#controlgroup").controlgroup();

    };


var logout = function() {
        data.save({success: function() {
                KiiUser.logOut();
                $.mobile.changePage("#login");
            }});
    };

var editEvent = function(i, t) {
        var d = data.get("data")[t];
        var e = false;
        for (var j = 0; j < d.length; j++) {
            if (d[j].created == i) {
                e = d[j];
                break;
            }
        }
        if (e == false) {
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
                deleteEvent(i, t);
            });
            $("#delete").show();
            $.mobile.changePage("#eventPage");
        }
    };

var newEvent = function() {
        form.title.val("");
        form.where.val("");
        form.note.val("");
        form.time.val("");
        /*form.repeat = $('#repeat option[value="once"]').attr("selected", true);
         form.reminder = $('#reminder option[value="no"]').attr("selected", true);*/
        form.level = $("#level-radio :radio").attr("checked", false).closest("#level-radio").find("#level-A").val();
        form.created = null;
        $("#delete").hide();
        $.mobile.changePage("#eventPage");
        $("#level-radio :radio").checkboxradio("refresh")
    };

var saveEvent = function() {
        var datas = data.get("data");
        if (form.created == null) {
            if (!(year + month + day in datas))
                datas[year + month + day] = [];
            var event = {title: form.title.val(), where: form.where.val(), note: form.note.val(), time: form.time.val(),
                repeat: "once", reminder: "no",
                level: $("#level-radio input:checked").val(), created: new Date().getTime()};
//repeat ???
            datas[year + month + day].push(event);
        }
        else {
            var e = 0;
            for (var j = 0; j < datas[year + month + day].length; j++) {
                if (datas[year + month + day][j].created == form.created) {
                    e = j;
                    break;
                }
            }
            datas[year + month + day][e] = {title: form.title.val(), where: form.where.val(), note: form.note.val(), time: form.time.val(),
                repeat: "once", reminder: "no",
                level: $("#level-radio :checked").val(), created: form.created};
///////////
//update
        }
        data.set("data", datas);
        data.get("data")[year + month + day].sort(function(a, b) {
            return parseInt(a.time.split(":").join("")) - parseInt(b.time.split(":").join(""))
        });
        updateListview();
        data.save({success: function() {
            }, failure: function() {
                console.log("failure saving event");
            }});
        $.mobile.changePage("#cal");
    };


var deleteEvent = function(i, t) {
        var d = data.get("data")[t];
        var e = -1;
        for (var j = 0; j < d.length; j++) {
            if (d[j].created == i) {
                e = j;
                break;
            }
        }
        if (e == -1) {
            return
        }
        else {
            data.get("data")[t].splice(e, 1);
            updateListview();
            data.save({success: function(s) {
                    data = s;
                    console.log("saved");
                }, failure: function() {
                    console.log("failure");
                }});
            $.mobile.changePage("#cal");

        }
    };

var buildeventsList = function() {
        $.mobile.showPageLoadingMsg();
        var evlist = $("#eventsList");
        evlist.empty()
        for (date in data.get("data")) {
            evlist.append($("<li></li>").data("role", "list-divider").data("theme", "a").text(date.substring(6) + "/" + date.substr(4, 2) + "/" + date.substr(0, 4)
                    ).append($("<span></span>").attr("class", "ui-li-count").data("theme", "a").text(data.get("data")[date].length.toString())));

            for (var i = 0; i < data.get("data")[date].length; i++) {
                var row = $("<li></li>");
                var link = $("<a></a>").click(function() {
                    editEvent($(this).data("created"), date);
                });
                if (data.get("data")[date][i].level == "C") {
                    row.data("theme", "b");
                }
                else if (data.get("data")[date][i].level == "B") {
                    row.data("theme", "e");
                }
                else {
                    row.data("theme", "d");
                }
                $(link).data("created", data.get("data")[date][i].created);
                $(link).append("<h3>" + data.get("data")[date][i].title + "<small>  (" + data.get("data")[date][i].where + ")</small></h3>");
                $(link).append("<p>" + data.get("data")[date][i].note + "</p>");
                $(link).append($("<p></p>").attr("class", "ui-li-aside").text(data.get("data")[date][i].time));
                $(row).append(link);
                evlist.append(row);
            }
        }
        $.mobile.changePage("#events");
        evlist.listview("refresh");
        $.mobile.hidePageLoadingMsg();
    }

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

var updatePassword = function() {
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

var deleteAccount = function() {
        user.delete({success: function() {
                $.mobile.changePage("#login");
            }});
    }




var _ = window._ = { user: user, monthField: monthField, listview: listview, newb: newb, date: date, year: year,
                    month: month, day: day, form: form, bucket: bucket, login_next: login_next, nextMonth: nextMonth,
                    prevMonth: prevMonth,  updateListview: updateListview, newEventAction: newEventAction, 
                    daysInMonth: daysInMonth, months: months, newTD: newTD, buildCal: buildCal, logout: logout,
                    editEvent: editEvent, newEvent: newEvent, saveEvent: saveEvent, deleteEvent: deleteEvent,
                    buildeventsList: buildeventsList, deleteData: deleteData, updatePassword: updatePassword,
                    deleteAccount: deleteAccount

}
