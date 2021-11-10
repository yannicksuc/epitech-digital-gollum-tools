// ==UserScript==
// @name         Epitech - Global search engine
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       Yannick SUC
// @match        https://intra.epitech.digital/*
// @icon         https://www.google.com/s2/favicons?domain=epitech.digital
// @require      https://cdn.jsdelivr.net/npm/fuse.js@6.4.6
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tilt.js/1.2.1/tilt.jquery.min.js
// @grant        none
// ==/UserScript==

getCourses();

let courses = [];
let filteredCourses = [];

const searchOptions = {
  keys: [
    "displayname",
    "fullname",
    "categoryname",
    "shortname",
    "summary"
  ]
};

let isOnSecondPage = false;

const fuse = new Fuse(courses, searchOptions);
let global_search;
let searchbar;
let output_list;
let output_list2;
const loader = '<div class="lds-facebook"><div></div><div></div><div></div></div>'

function KeyPress(e) {
    var evtobj = window.event? event : e
    if (e.keyCode == 32 && evtobj.ctrlKey)
        toggleSearch();

    if (!global_search.is(":visible"))
        return
    else if (e.keyCode == 27)
        isOnSecondPage ? switchPage(false) : quitSearch()
    else if (e.keyCode == 39 && output_list.find('a:focus').length) {
    }
    else if (e.keyCode == 13) {
        if (!isOnSecondPage && !output_list.find(':focus').length)
            switchPage(true)
        return e;
    } else if (e.keyCode != 9 && !evtobj.shiftKey){
        if (isOnSecondPage) {
            switchPage(false);
        }
        if(!searchbar.is( ":focus" )) {
            searchbar.focus(); //refocus if user start typing again
        }
    }
}

function switchPage(forcePage) {
    if (forcePage)
        isOnSecondPage != forcePage
    if (isOnSecondPage) {
        $(".flip-card-inner").css('transform', 'rotateY(0deg)');
        output_list.find('a').attr('tabindex', "0")
        output_list2.find('a').attr('tabindex', "-1")
        setTimeout(function(){
            $('.flip-card-back').hide();
            console.log('hide');
        }, 1000);
        $('.flip-card-front').show();
    } else {
        setTimeout(function(){ $('.flip-card-front').hide(); }, 1000);
        $('.flip-card-back').show();
        $(".flip-card-inner").css('transform', 'rotateY(180deg)');
        output_list.find('a').attr('tabindex', "-1")
        output_list2.find('a').attr('tabindex', "0")
        output_list2.find('a').focus();
        getActivities();
    }
    isOnSecondPage = !isOnSecondPage;
}

function quitSearch() {
        toggleElementVisibility(global_search);
}

function toggleSearch() {
    toggleElementVisibility(global_search);
    if (global_search.is(":visible"))
        searchbar.focus();
}

function toggleElementVisibility(box) {
 box = box[0];
 if (box.classList.contains('hidden')) {
      box.classList.remove('hidden');
      setTimeout(function() {
         box.classList.remove('visuallyhidden');
      }, 20);
   } else {
      box.classList.add('visuallyhidden');
      box.addEventListener('transitionend', function(e) {
         box.classList.add('hidden');
      }, {
         capture: false,
         once: true,
         passive: false
      });
   }
}




(function() {
    $('body').append(`
<div id="global-search" class="hidden visuallyhidden" style="top:0; left:0; width: 100vw; height: 100vh; position: fixed; z-index: 2042; margin:0; padding:0; overflow: hidden;">
  <div id="gs-searchbar-container" style="width: 100%; display: flex; height: 10em;">
    <div style="margin: auto; height: 2.5em; position: relative;">
      <input id="gs-searchbar" style="width: 100%; height: 100%"><i class="fa fa-search" style="position: absolute; top: 0.75em; right: 1em; pointer-events: none;"></i>
    </div>
  </div>

    <div class="flip-card" style="perspective: 1000px; background-color: transparent; min-width: 32em; height: 74vh; margin: auto; width: fit-content;">
      <div class="flip-card-inner" style="  position: relative;width: 100%;height: 100%;transition: transform 0.6s;transform-style: preserve-3d;box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);">
        <div class="flip-card-front" id="gs-output-container" style="background-color: var(--light); position: absolute;width: 100%;height: 100%;-webkit-backface-visibility: hidden;backface-visibility: hidden; overflow: hidden;">
          <h5 style="position: relative; display: block; height: 1.5em; text-align: center; vertical-align: middle; line-height: 2em; border-bottom: #ddd solid 1px; margin: 0; padding-bottom: 2em;">Courses list</h5>
          <ul id="gs-courselist" style="display: block; height: calc(100% - 2.5em); overflow-y: scroll; overflow-x: hidden; margin: auto;padding: 0;">${loader}<ul>
        </div>
        <div class="flip-card-back" style="position: absolute;width: 100%;height: 100%; background-color: var(--light);-webkit-backface-visibility: hidden;backface-visibility: hidden; transform: rotateY(180deg); overflow: hidden;">
          <h5 style="position: relative; display: block; height: 1.5em; text-align: center; vertical-align: middle; line-height: 2em; border-bottom: #ddd solid 1px; margin: 0; padding-bottom: 2em;">Course detail</h5>
          <button class="back-page" type="button" style="padding: 0 3em 0 0.5em;box-shadow:rgba(0,0,0,0.1) 0 4px 6px -1px,rgba(0,0,0,0.06) 0 2px 4px -1px;border:unset;width:1.5em;height:1.5em;background-color:var(--primary);color:var(--white);border-radius:1.5em;position:absolute;top: 6.5px;left: 0.9em;display: flex;"><i class="fa fa-angle-left" style="margin: auto;pointer-events: none;"></i><span style="padding-left: 0.2em;margin: auto;font-size: 0.8em;">back</span></button>
          <ul id="gs-courselist2" style="display: block; height: calc(100% - 2.5em); overflow-y: scroll; overflow-x: hidden; margin: auto;padding: 0;"><ul>
        </div>
      </div>

  </div>
</div>`);

    global_search = $('#global-search');
    searchbar = global_search.find("#gs-searchbar");
    output_list = global_search.find("#gs-courselist");
    output_list2 = global_search.find("#gs-courselist2");
    $(".flip-card").tilt({maxTilt:        10,perspective:    2000});

    //Close window on click outside of the boxes
    $('#global-search, #gs-searchbar-container').on('click', function(){0
        toggleSearch();
    }).children().click(function(e) {
        e.stopPropagation();
    });
    searchbar.on("input", function(){
        const what = $( this ).val();
        if (courses.length)
            updateOutputList(search(what));
    })

    document.onkeydown = KeyPress;
})();

function updateOutputList(courses)
{
    filteredCourses = courses;
    output_list.empty();
    courses.forEach(function(course, idx){ output_list.append(getCourseElem(course, 0, true, idx))})
    if (courses.length) {
        updateOutputList2(courses[0])
    }

    $('button.next-page').on("click", function() {
        updateOutputList2(filteredCourses[$(this).data('idx')])
        switchPage(true);
    })

    $('.back-page').on("click", function() {
        switchPage(false);
    })
}

function updateOutputList2(course, links)
{
    if (course) {
        output_list2.empty();
        output_list2.append(getCourseElem(course, -1, false, 0));
    }
    if (links) {
        output_list2.find('div:not(:first-child)').remove();
        links.each(function(){
            var linkHref = $(this).attr('href');
            if (linkHref && linkHref != "#")
                output_list2.append(getLinkElem(linkHref, $(this).text(), $(this).find('img')[0].outerHTML))
        })
    }
}



function getCourseElem(course, tabIndex, addButton=false, index) {
    var button = `<button data-idx="${index}" class="next-page" type="button" style="padding: 0 3em 0 0.5em; box-shadow:rgba(0,0,0,0.1) 0 4px 6px -1px,rgba(0,0,0,0.06) 0 2px 4px -1px;border:unset;width:1.5em;height:1.5em;background-color:var(--primary);color:var(--white);border-radius:1.5em;position:absolute;top:auto;bottom:auto;"><i class="fa fa-angle-right" style="margin: auto;pointer-events: none;"></i><span style="margin: auto;padding-left: 0.2em;margin: 0;text-align: center;line-height: 1.5em;font-size: 0.8em;">open</span></button>`
    return `<div class="searchitem" id="searchitem_course_${course.id}" data-idx="${index}" style="padding: 0 1em; height: 30px; position: relative; display: flex; width: 100%;align-items: center; justify-content: space-between; white-space: nowrap;" ><a tabindex="${tabIndex}" href="/course/view.php?id=${course.id}" style="overflow:hidden; ">${course.displayname}</a>${addButton ? button : ""}<span title="course category" class="chips" style="padding-left: 1em;">${course.categoryname}</span></div>`;
}

function getLinkElem(href, name, icon) {
    return `<div class="searchitem" style="padding: 0 1em; height: 30px; position: relative; display: flex; width: 100%;align-items: center; justify-content: space-between; white-space: nowrap;" ><a tabindex="${0}" href="${href}" style="overflow:hidden;">${name}</a><span title="course module" class="chips" style="padding-left: 1em;">${icon}</span></div>`;
}

function search(what) {
    if (what && what.length)
        return fuse.search(what).map(c => c.item);
    return courses;
}

function getCourses() {
    require(['core/ajax'], function(ajax) {
        var promises = ajax.call([
            { methodname: 'core_course_search_courses ', args: {criterianame: "search", criteriavalue: "", perpage: 1000}}
        ]);

        promises[0].done(function(response) {
            courses = JSON.parse(JSON.stringify(response)).courses;
            fuse.setCollection(courses);
            searchbar.trigger("input")
        }).fail(function(ex) {
            console.log('No courses found')
        });

    });
}

function getActivities() {
    fetch("https://intra.epitech.digital" + output_list2.find('div.searchitem a').first().attr('href'), requestOptions)
        .then(response => response.text())
        .then(function(result) {
         let pageDom = $($.parseHTML(result));
         const links = pageDom.find('a.aalink');
        updateOutputList2(null, links);
    })
        .catch(error => console.log('error', error));
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

var moodleSession = getCookie('MoodleSession')

var myHeaders = new Headers();
myHeaders.append("Connection", "keep-alive");
myHeaders.append("Cache-Control", "max-age=0");
myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"95\", \"Chromium\";v=\"95\", \";Not A Brand\";v=\"99\"");
myHeaders.append("sec-ch-ua-mobile", "?0");
myHeaders.append("sec-ch-ua-platform", "\"Windows\"");
myHeaders.append("Upgrade-Insecure-Requests", "1");
myHeaders.append("Origin", "https://intra.epitech.digital");
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36");
myHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
myHeaders.append("Sec-Fetch-Site", "same-origin");
myHeaders.append("Sec-Fetch-Mode", "navigate");
myHeaders.append("Sec-Fetch-User", "?1");
myHeaders.append("Sec-Fetch-Dest", "document");
myHeaders.append("Accept-Language", "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ko;q=0.6");
myHeaders.append("Cookie", "MoodleSession=" + moodleSession);

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};