// ==UserScript==
// @name         ED - Competencies
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Gollum is watching you
// @author       Yannick SUC
// @match        https://intra.epitech.digital/mod/competencies/view.php*
// @icon         https://www.google.com/s2/favicons?domain=epitech.digital
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://kit.fontawesome.com/a366560e45.js
// @require      https://cdn.jsdelivr.net/npm/fuse.js@6.4.6
// @updateUrl    https://github.com/yannicksuc/epitech-digital-gollum-tools/blob/main/ED%20-%20Competencies.user.js
// @downloadUrl  https://github.com/yannicksuc/epitech-digital-gollum-tools/blob/main/ED%20-%20Competencies.user.js
// @grant        none
// ==/UserScript==

'use strict';


var course_name = "";

var today = new Date();
var expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days
var data = {}
const cmid = $('body').attr('class').match(/cmid\-\d+/gi)[0].split('-')[1];
let groups = [];

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

var sesskey = M.cfg.sesskey;

var shortCompDescs = JSON.parse(localStorage.getItem('shortCompDescs'));

function setupGroupsSearchBar()
{
    groups = $('select#id_group option').map((i, elem) => {return{"index":i, "methodname":"core_course_get_enrolled_users_by_cmid", "args":{"cmid":cmid,"groupid":elem.value}, name: elem.innerHTML}}).toArray()
    var settings = {
        "url": "https://intra.epitech.digital/lib/ajax/service.php?sesskey="+sesskey,
        "method": "POST",
        "timeout": 0,
        "headers": myHeaders,
        "data": JSON.stringify(groups),
    };

    $.ajax(settings).done(function (response) {
        for (let [i, responseElem] of response.entries()) {
            if (!responseElem.error && i < groups.length) {
                groups[i].users = responseElem.data.users.map(user => user.fullname).join(", ");
            }
        }
        //Import Searchbar lib only when needed
        !function(e){"undefined"!=typeof jQuery?"undefined"!=typeof Fuse?e.fn.fuzzyComplete=function(t,a){return this.each(function(){void 0===a&&(a={display:Object.keys(t[0])[0],key:Object.keys(t[0])[0],resultsLimit:4,allowFreeInput:!0,fuseOptions:{keys:Object.keys(t[0])}});var s=new Fuse(t,a.fuseOptions),d=e(this),n=e("<div>").addClass("fuzzyResults");d.after(n);var i=e("<select>").hide();function l(){var e=d.position();e.left+=parseInt(d.css("marginLeft"),10),e.top+=parseInt(d.css("marginTop"),10),n.css({left:e.left,top:e.top+d.outerHeight(),width:d.outerWidth()})}function r(){i.val(n.children(".selected").first().data("id")),d.val(n.children(".selected").first().data("displayValue")),i.data("extraData",n.children(".selected").first().data("extraData")),d.data("extraData",n.children(".selected").first().data("extraData"))}!0!==a.allowFreeInput&&(i.attr("name",d.attr("name")),d.removeAttr("name")),d.after(i),l(),window.addEventListener("resize",l),document.fonts.ready.then(l),d.keydown(function(e){switch(e.which){case 13:return e.preventDefault(),n.hide(),void r();case 9:return n.hide(),void r()}}),d.keyup(function(t){switch(t.which){case 38:return(d=n.find(".selected").first()).length?(d.removeClass("selected"),d.prev().length?d.prev().addClass("selected"):n.children().last().addClass("selected")):n.children().last().addClass("selected"),void r();case 40:var d;return(d=n.find(".selected").first()).length?(d.removeClass("selected"),d.next().length?d.next().addClass("selected"):n.children().first().addClass("selected")):n.children().first().addClass("selected"),void r();case 13:return}let l=e(this).val();var o;o=l?s.search(l):s._docs.map((e,t)=>({item:e,matches:[],score:1,refIndex:t})),n.empty(),0===o.length&&i.val(null),o.forEach(function(t,s){if("item"in t&&"refIndex"in t&&(t=t.item),!(s>=a.resultsLimit)){0===s&&i.val(t[a.key]);var d=e("<div>").addClass("__autoitem").on("mousedown",function(e){e.preventDefault()}).click(function(){n.find(".selected").removeClass("selected"),e(this).addClass("selected"),r(),n.hide()});"function"==typeof a.key?d.data("id",a.key(t,s)):d.data("id",t[a.key]),"function"==typeof a.display?d.html(a.display(t,s)):d.text(t[a.display]),"function"==typeof a.displayValue?d.data("displayValue",a.displayValue(t,s)):"string"==typeof a.displayValue?d.data("displayValue",t[a.displayValue]):d.data("displayValue",d.text()),"function"==typeof a.extraData?d.data("extraData",a.extraData(t,s)):"string"==typeof a.extraData&&d.data("extraData",t[a.extraData]),n.append(d)}}),n.children().length?(n.show(),n.children().first().addClass("selected")):n.hide()}),d.blur(function(){n.hide()}),d.focus(function(){n.children().length?n.show():d.keyup()}),i.append(e("<option>",{value:"",text:"(None Selected)"})),t.forEach(function(t,s){var d,n;d="function"==typeof a.key?a.key(t,s):t[a.key],n="function"==typeof a.display?a.display(t,s):t[a.display],i.append(e("<option>",{value:d,text:n}))}),d.val()&&(d.keyup(),d.blur())})}:console.warn("fuzzyComplete plugin requires Fuse.js"):console.warn("fuzzyComplete plugin requires jQuery")}(jQuery);
        refreshGroupsSearchBar();
    });
}

function createGroupsSearchBar()
{
    $("#fitem_id_group .col-md-9").append('<input id="groups-searchbar" placeholder="Search for a group or student..."></input>');
}

createGroupsSearchBar();

function refreshGroupsSearchBar()
{
    var fuseOptions = { keys: ["name", "users"] };
        var displayFunction = function(result,id) {
        return "<b>" + result['name'] + "</b><br>" + result['users'];
    };
    var options = { display: displayFunction, displayValue: "name", key: "args.cmid", fuseOptions: fuseOptions };
    $("#groups-searchbar").fuzzyComplete(groups, options);
    $(".fuzzyResults").on("click", function() {
        $("#groups-searchbar").blur();
    })
    $("#groups-searchbar").on('keyup', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            $(this).blur();
        }
    }).on('blur', function() {
        var selectedGroup = groups.find(elem => elem.name.startsWith($("#groups-searchbar").val()))
        $("#id_group").val(selectedGroup.args.groupid).change();
    });
}

setupGroupsSearchBar();

function fsetCookie(name, value)
{
    document.cookie=name + "=" + encodeURI(value) + "; path=/; expires=" + expiry.toGMTString();
}

function fgetCookie(name)
{
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? decodeURI(value[1]) : null;
}

function createCompetenciesDescriptionModeToggle()
{

    $('.competencies-list tbody tr:first-child th:first-child').addClass('resizable').html('<p>Competencies</p><label title="Click to toggle short mode for competencies descriptions" class=switch for=checkbox id=competency-description-toggle><input id=checkbox type=checkbox><div class="round slider"></div></label>');
    $('.competencies-list tbody tr:not(:first-child) td:first-child').each(function() {
        const select = $(this).closest('tr').find('select').first();
        const id = select.data('competency');
        var short_desc = shortCompDescs[id];
        $(this).html('<span class="long-desc">' + $(this).html() + '</span><span data-competency="'+id+'"class="short-desc" contenteditable="true">'+(short_desc ? short_desc : $(this).find('b').html())+'</span>')
    })
    var checkInput = $('#competency-description-toggle input');
    checkInput.change(function() {
        localStorage.setItem('isCompetenciesShortModeOn', this.checked);
        if (this.checked) {
            $('.competencies-list').addClass('short-mode')
        } else {
            $('.competencies-list').removeClass('short-mode')
        }
        resizeTextareas();
    });
    if (localStorage.getItem('isCompetenciesShortModeOn') === 'true')
        checkInput.prop( "checked", true ).change();
    $( ".short-desc" ).blur(function() {
        const compId = $(this).data('competency');
        let shortCompDescs = JSON.parse(localStorage.getItem('shortCompDescs'));
        if (!shortCompDescs)
            shortCompDescs = {}
        shortCompDescs[compId] = $(this).html()
        localStorage.setItem('shortCompDescs', JSON.stringify(shortCompDescs))
    });
}

function resizeTextareas() {
    $("#page-mod-competencies-view .competencies-list td:nth-child(3) textarea").each(function() {
        $(this).hide();
        var newSize = $(this).closest('td').height();
        $(this).show();
        $(this).height(newSize - 11);
    }).on('keydown', function(event) {
       if (event.key == "Escape") {
           $(this).blur();
       }
   })
}

(function() {
    createCompetenciesDescriptionModeToggle();

    var button = '<input class="btn btn-secondary" name="exportbutton" id="id_exportbutton" value="Export & Send result">';
    var button_selector = '#page-mod-competencies-view #fitem_id_submitbutton .form-inline.felement';

    $("#fitem_id_group .col-md-9").append(`
    <input class="btn btn-primary exportbuttonMS" name="exportbuttonMS" id="id_exportbuttonMS" value="Send mail & scheduler" style="margin-left:8px;margin-bottom: 8px;">
    <input class="fa btn btn-secondary exportbuttonM" name="exportbuttonM" id="id_exportbuttonM" title="Send by mail" value="" style=" padding-inline: 8px; margin-left: 8px; width: 35.6px; height: 35px;margin-bottom: 8px;">
    <input class="fa btn btn-secondary exportbuttonS" name="exportbuttonS" id="id_exportbuttonS" title="Send on scheduler" value="" style="padding-inline: 8px; margin-left: 8px; width: 35.6px; height: 35px;margin-bottom: 8px;">
    <div style="width: 100%;" class="csv-taskbar">
        <input class="import-input" placeholder="Paste here the competencies you want to import (1,2,1,0,4...)" class="" style="vertical-align: middle;width: calc(100% - 44px); border: 1px solid #ced4da; height: 34px; margin-bottom: 8px; max-width: 34.9em;">
        <input class="fa btn btn-secondary importbutton" name="importbutton" id="id_importbutton" title="Convert csv to competencies (from input bar to page)" value="" style="padding-inline: 8px; margin-left: 8px; width: 35.6px; height: 35px;margin-bottom: 8px;">
        <input class="fa btn btn-secondary convertbutton" name="convertbutton" id="id_convertbutton" title="Convert competencies to csv in (from page to input bar)" value="" style="padding-inline: 8px; margin-left: 8px; width: 35.6px; height: 35px;margin-bottom: 8px;">
    </div>`)
    $("#fitem_id_group .col-md-9 select").css("margin-bottom", "8px");

    $(button_selector).append('<input class="btn btn-primary exportbuttonMS" name="exportbuttonMS2" id="id_exportbuttonMS2" value="Send mail & scheduler" style="margin-left:8px">')
    $(button_selector).append('<input class="fa btn btn-secondary exportbuttonM" name="exportbuttonM2" id="id_exportbuttonM2" value="" title="Send by mail" style="padding-inline: 8px; margin-left: 8px; width: 35.6px; height: 35px;">')
    $(button_selector).append('<input class="fa btn btn-secondary exportbuttonS" name="exportbuttonS2" id="id_exportbuttonS2" value="" title="Send on scheduler" style="padding-inline: 8px; margin-left: 8px; width: 35.6px; height: 35px;">')

    const import_input = $("#fitem_id_group .col-md-9 .import-input");
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const page_id = urlParams.get('id');
    let import_input_value = fgetCookie('input-'+page_id);
    if (import_input_value)
        import_input.val(import_input_value)

    import_input.on("blur", function() {
        fsetCookie('input-'+page_id, import_input.val())
    });

    $("._statusDDL").val('2');

    $(".exportbuttonMS").click(function() {
        course_name = $('.page-header-headings h1').html();
        fillStudentsInfos(true, true)
    });
    $(".exportbuttonM").click(function() {
        course_name = $('.page-header-headings h1').html();
        fillStudentsInfos(true, false)
    });
    $(".exportbuttonS").click(function() {
        course_name = $('.page-header-headings h1').html();
        fillStudentsInfos(false, true)
    });

    $(".importbutton").click(function() {
        const values = import_input.val().split(',');
        $('td:nth-child(2) select').each(function( index ) {
            if (index < values.length) {
                $(this).val(values[index].toString());
                updateSelect($(this));
            }
        });
    });
    $(".convertbutton").click(function() {
        const values = [];
        $('td:nth-child(2) select').each(function( index ) {
            values.push($(this).val())
        });
        import_input.val(values.join(','))
    });

    $('body').on('DOMSubtreeModified', 'th.studname-1', function(){
        resizeTextareas();
    });

    const table = $(".competencies-list table")
    var oldXHR = window.XMLHttpRequest;
    table.find('td select').each(function() {
          $(this).prop('multiple', true)
        updateOptions($(this))
    })

    function newXHR() {
        var realXHR = new oldXHR();
        realXHR.addEventListener("readystatechange", function() {
            if(realXHR.readyState==4){
                if (realXHR.responseURL.includes("mod_competencies_get_group_users")) {
                    data = JSON.parse(realXHR.responseText)[0].data;
                    var competencies = [data.competencies]
                    data.users.forEach(elem => competencies.push(elem.competencies))
                    table.find('td:nth-child(-n+'+(competencies.length+2)+') select').each(function() {
                        let splittedId = $(this).attr('id').split('_');
                        let compid = splittedId[2];
                        let td = $(this).closest('td');
                        let colid = splittedId.length > 3 ? parseInt(splittedId[3]) : 0;
                        td.removeClass (function (index, className) {return (className.match (/(^|\s)colored\S+/g) || []).join(' ');});
                        let competency = competencies.length > colid ? competencies[colid].find(comp => comp.competency == compid) : null
                        if (!competency)
                            td.addClass('colored-')
                        else
                            td.addClass('colored-' + (competency.value ? competency.value : competency.defaultval))
                    })
                }
            }
        }, false);
        return realXHR;
    }

    window.XMLHttpRequest = newXHR;

//    displayMessage("tests", 1);
    !function(t){t.fn.resizableColumns=function(){var r=!1,h=0,i=t(this),a=t(this).find("tbody").first();a.find("th.resizable").each(function(){t(this).css("position","relative"),t(this).is(":not(:last-child)")&&t(this).is(":not(.no-resize)")&&t(this).nextAll("th.no-resize").length<t(this).nextAll("th").length&&t(this).append("<div class='resizer' style='position:absolute;top:0px;right:-3px;bottom:0px;width:6px;z-index:999;background:transparent;cursor:col-resize'></div>")}),t(document).mouseup(function(i){a.find("th").removeClass("resizing"),r=!1,i.stopPropagation()}),i.find(".resizer").mousedown(function(i){0==i.button&&(a.find("th").removeClass("resizing"),t(a).find("tr:first-child th:nth-child("+(t(this).closest("th").index()+1)+") .resizer").closest("th").addClass("resizing"),h=i.pageX,r=!0),i.stopPropagation()}).click(function(i){return!1}),i.mousemove(function(i){if(r){resizeTextareas();var t=a.find("th.resizing .resizer");if(1==t.length){var n=a.find("th.resizing + th");n.hasClass("no-resize")&&(n=n.next("th:not(.no-resize)"));var e=(i.pageX||0)-h,s=t.closest("th").innerWidth()+e,o=n.innerWidth()-e;0!=h&&0!=e&&50<s&&50<o&&(t.closest("th").innerWidth(s),h=i.pageX,n.innerWidth(o))}}})}}(jQuery);
    $('table').resizableColumns();

})();

/* INTERFACE */

function updateOptions(elem) {
    elem.find("option").each(function(index) {
        if (!$(this).attr("title"))
            $(this).attr("title", $(this).html())
        if (index == 0) {
            $(this).html("&#xf00d; ")
        }
        if (index == 1) {
            $(this).html("&#xf05e; N/A")
        }
        if (index == 2) {
            $(this).html("&#xf070; MIS")
        }
        if (index == 3) {
            $(this).html("&#xf103; BEL")
        }
        if (index == 4) {
            $(this).html("&#xf00c; MEE")
        }
        if (index == 5) {
            $(this).html("&#xf058; ABO")
        }
    }).mouseup(function() {
        updateSelect($(this))
        $(this).closest('select').blur();
    })
}

function updateSelect(elem) {
    var value = elem.val()[0];
    elem = elem.closest('td');
    elem.removeClass('colored-0 colored-1 colored-2 colored-3 colored-4 colored-');
    elem.addClass("colored-" + value)
    if ( !elem.is('[class^="competency-"], [class*=" competency-"]') ) {
        elem.siblings().each(function() {
            if($(this).is('[class^="competency-"], [class*=" competency-"]')) {
                $(this).removeClass (function (index, className) {return (className.match (/(^|\s)colored-\S+/g) || []).join(' ');});
                $(this).addClass("colored-" + value)
                $(this).find('select').val(value);
            }
        });
    }
}

/* CLASSES */

class Student {

  constructor(name) {
      this.name = name;
      this.email = this.nameToEmail(this.name);
      this.competencies = [];
  }

    replaceAt(str, index, char) {
        var a = str.split("");
        a[index] = char;
        return a.join("");
    }

    nameToEmail(name) {
        //HORRIBLE
        name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "-").replaceAll("'", '-').replace("Nick", "Nick1");
        for (var i = 1; i < name.length; i++) {
            if (name[i] == name[i].toUpperCase() && name[i - 1] == '-') {
                name = this.replaceAt(name, i-1, '.')
                break;
            }
        }
        return name.toLowerCase() + "@epitech.digital";
    }

    addCompetency(competency) {
        this.competencies.push(competency);
    }
}

class Competency {

  constructor(code, behavior, behavior_description, grade, comment) {
      this.code = code;
      this.behavior = behavior;
      this.behavior_description = behavior_description;
      this.comment = comment;
      if (!grade) {
          this.grade = "Not graded";
      } else {
          this.grade = grade;
      }
  }
}


let students = [];

function fillStudentsInfos(doMail, doScheduler) {
    students = [];
    const table = $(".competencies-list table")

    table.find('tr:first-child').each(function (i, el) {

        var $tds = $(this).find('th'),
            competency = $tds.eq(0).text(),
            group = $tds.eq(1).text(),
            comment = $tds.eq(2).text();
        for (var j = 3; j < $tds.length; j++) {
            const student_name = $tds.eq(j).text();
            if (!student_name.toLowerCase().includes("student")) {
                students.push(new Student(student_name))
            }
        }
    });

    table.find('tr:not(:first-child)').each(function (i, el) {
        var $tds = $(this).find('td'),
            behavior = $tds.eq(0).find('b').text(),
            behavior_description = $tds.eq(0).find('p').text(),
            group = $tds.eq(1).text(),
            comment = $tds.eq(2).find("textarea").val();
        for (var j = 3; j < $tds.length && j < students.length + 3; j++) {
            const grade = $tds.eq(j).find("option:selected").attr('title');
            students[j -3].addCompetency(new Competency("", behavior, behavior_description, grade, comment));
        }
    });
    for (var i = 0; i < students.length; i++) {
        sendStudent(doMail, doScheduler, i);
    }
}

function sendStudent(doMail, doScheduler, studentIndex) {
    var xhr = new XMLHttpRequest();
    var url = "https://prod-238.westeurope.logic.azure.com:443/workflows/972468d651d840de8e134b4267e222a2/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Fey56QsbiorNeg1XE2XxI4fuEBkvYbihs7AlHxj_3A0";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
        }
    };


    var output = JSON.parse(JSON.stringify(students[studentIndex]));
    var table = generateTable(students[studentIndex]);
    output.extract = table;
    output.course = course_name;

    if (doScheduler)
        findScheduler(getKeynoteUrl(), data.users[studentIndex].id, table)
    if (doMail)
        xhr.send(JSON.stringify(output));
}




/* HTML TABLE EXTRACT GENERATOR */

function generateTable(student) {
    var table = start_table
    for (var i = 0; i < student.competencies.length; i++) {
        table += getRow(student.competencies[i])
    }
    table += end_table;
    return table;
}

function getRow(competency) {
    return row[0]
        + row[1] + competency.behavior_description + row[2] + '<b>' + competency.behavior + '</b><br>' + competency.behavior_description.replaceAll('\n', '<br>') + row[3]
        + row[1] + competency.grade + row[2] + competency.grade + row[3]
        + row[1] + row[2] + "<p>" + competency.comment.replaceAll('\n', '<br>') + "</p>"+ row[3]
        + row[4]
}

const start_table = `<table align="left" border="1" cellpadding="0" cellspacing="0" id="customers" style="font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%; font-size: 12px; text-align: left;" width="100%">
<tbody>
<tr>
<th align="left" bgcolor="#04AA6D" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;Competencies&quot;}" style="border: 1px solid #ddd; padding: 8px; padding-top: 12px; padding-bottom: 12px; text-align: left; background-color: #db3832; color: white; width: 300px">Competencies</th>
<th align="left" bgcolor="#04AA6D" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;Statuses&quot;}" style="border: 1px solid #ddd; padding: 8px; padding-top: 12px; padding-bottom: 12px; text-align: left; background-color: #db3832; width:100px; color: white;">Statuses</th>
<th align="left" bgcolor="#04AA6D" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;Comments&quot;}" style="border: 1px solid #ddd; padding: 8px; padding-top: 12px; padding-bottom: 12px; text-align: left; background-color: #db3832; width:100px; color: white;">Comments</th>
</tr>`

const row = [`<tr bgcolor="#f2f2f2" style="background-color: #f2f2f2;">`,
             `<td data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;`,
             `&quot;}" style="border: 1px solid #ddd; padding: 8px;">`,
             `</td>`,
             `</tr>`]

const end_table = `</tbody></table>`






/* SCHEDULER EXPORT FUNCTIONS */

function getKeynoteUrl() {
    let keynoteUrl;
    $("#jump-to-activity option").each(function (){
        if ($(this).html().includes("eynote"))  {//Search for keynote url
            keynoteUrl = $(this).val()
        }
    })
    if (!keynoteUrl)
        return undefined;
    return "https://intra.epitech.digital/" + keynoteUrl + "&subpage=allappointments&offset=0";
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function findScheduler(url, userIdToFind, message) {

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};
    fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
        let pageDom = $($.parseHTML(result));
        const scheduler = pageDom.find('a[href*="id='+userIdToFind+'"]');
        if (scheduler && scheduler.html()) {
            var tdTeacher = scheduler.parent().parent().parent().parent().next();
            var teacherId = new URL(tdTeacher.find('a').attr('href')).searchParams.get('id');
            var tdActions = tdTeacher.next();
            var actionUrl = new URL(tdActions.find('a').eq(1).attr('href'));
            setSchedulerComment(actionUrl.searchParams.get('id'), actionUrl.searchParams.get('slotid'), actionUrl.searchParams.get('sesskey'), teacherId, message);
        } else {
            var nextpage = pageDom.find('a[aria-label="Next"]');
            if (nextpage) {
                findScheduler(nextpage.attr("href"), userIdToFind)
            } else {
                console.warn("No scheduler found")
            }
        }
    })
        .catch(error => console.warn('error', error));
}

function setSchedulerComment(id, slotid, sesskey, teacherid, message) {

var urlencoded = new URLSearchParams();
urlencoded.append("id", id); //ex : "10042"
urlencoded.append("what", "updateslot");
urlencoded.append("slotid", slotid); //ex: "6995"
urlencoded.append("sesskey", sesskey);//ex: "UvgtuJI8pC"
urlencoded.append("_qf__scheduler_editslot_form", "1");
urlencoded.append("teacherid", teacherid);//ex:  "58"
urlencoded.append("notes_editor[text]", message); //ex: "<p+dir=\"ltr\"+style=\"text-align:left;\">coucou</p>"
urlencoded.append("notes_editor[format]", "1");

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: urlencoded,
  redirect: 'follow'
};

    fetch("https://intra.epitech.digital/mod/scheduler/view.php", requestOptions)
        .then(response => response.text())
        .then(result => console.log('Sent !'))
        .catch(error => console.log('error', error));
}

//MESSAGE MODULE//

function displayMessage(message, type) //type => 0 info, 1 warning, 2 error
{
    $('body').append('<div id="feedback-message" style="position: fixed; display: block; top: 10%; width: 50%; left:20%"><p>'+message+'</p></div>')
}

