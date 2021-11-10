// ==UserScript==
// @name         ED - Calendar
// @icon         https://www.google.com/s2/favicons?domain=epitech.digital
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Script to notify absenteism
// @author       Yannick Suc
// @match        https://intra.epitech.digital/calendar/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.js
// @resoure      https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.css
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateUrl    https://github.com/yannicksuc/epitech-digital-gollum-tools/blob/main/ED%20-%20Calendar.user.js
// @downloadUrl  https://github.com/yannicksuc/epitech-digital-gollum-tools/blob/main/ED%20-%20Calendar.user.js
// @grant        none
// ==/UserScript==

'use strict';

(function() {


    var config = [
        {"cible":"VACANCES", "class":null, "color":"#ffb22b"},
        {"cible":"DATA", "class":null, "color":"#ffb22b"}
    ];

    const dayEventTag = "minimize";

    //Update calendar when calendar id change
    let id = $(".calendarwrapper").attr("id");
    $(".maincalendar").bind("DOMSubtreeModified", function() {
        if($(this).find(".calendarwrapper").attr("id") !== id && $(".calendarwrapper").attr("id") !== undefined) {
            id = $(this).find(".calendarwrapper").attr("id");
            changeCalendar();
        }
    });


    changeCalendar();

    function changeCalendar() {
        let events = [];
        let eventsElems = [];

        //Go threw each days
        $("td.day").each(function(i) {
            const newEvents = [];
            const newEventsElems = [];
            //Go threw activities of the day
            $(this).find("li.calendar_event_course a").each(function(i,v){
                const what = $(this).attr("title");
                const elemParent = $(this).parent();

                //Set dayLong activities tags
                if (events.includes(what) && !what.includes("Meet")) {
                    elemParent.addClass(dayEventTag);
                    for(let idx = 0; idx < events.length; idx++)
                        if (events[idx] === what && !eventsElems[idx].hasClass(dayEventTag)) {
                            eventsElems[idx].addClass(dayEventTag + " " + dayEventTag + "-first");
                        }
                }

                $(this).html($(this).html().replace('Meeting with your Students,', ''));
                $(this).html($(this).html().replace('Meeting with your Student,', ''));
                                $(this).html($(this).html().replace('Meeting with your Teacher,', ''));

                config.forEach(elem => {
                    if (what.toLowerCase().includes(elem.cible.toLowerCase())) {
                        elemParent.addClass(elem.class ? elem.class : elem.cible.toLowerCase().replace(" ", "-"))
                        elemParent.css("background-color", elem.color);
                        if (elemParent.hasClass(dayEventTag))
                            $(this).css("color", elem.color);
                    }
                });

                if (elemParent.hasClass(dayEventTag))
                    $(this).css("color", "transparent");

                newEvents.push(what);
                newEventsElems.push($(this).parent());
            })


            //Add to day long event the last class if needed
            events.forEach(function(elem, idx) {
                if (eventsElems[idx].hasClass(dayEventTag) && !newEvents.includes(events[idx]) )
                    eventsElems[idx].addClass(dayEventTag + "-last")
            });
            events = newEvents;
            eventsElems = newEventsElems;
        });
    }

})();




/*            */