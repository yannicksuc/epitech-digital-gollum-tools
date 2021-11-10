// ==UserScript==
// @name         ED - Export Notation
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Gollum is watching you
// @author       You
// @match        https://intra.epitech.digital/mod/competencies/view.php*
// @icon         https://www.google.com/s2/favicons?domain=epitech.digital
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://kit.fontawesome.com/a366560e45.js
// @grant        none
// ==/UserScript==

'use strict';

var course_name = "";

var today = new Date();
var expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days
var data = {}

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

(function() {

    var button = '<input class="btn btn-secondary" name="exportbutton" id="id_exportbutton" value="Export & Send result">';
    var button_selector = '#page-mod-competencies-view #fitem_id_submitbutton .form-inline.felement';

    $("#fitem_id_group .col-md-9").append(`
    <input class="btn btn-primary exportbuttonMS" name="exportbuttonMS" id="id_exportbuttonMS" value="Send mail & scheduler" style="margin-left:8px;margin-bottom: 8px;">
    <input class="fa btn btn-secondary exportbuttonM" name="exportbuttonM" id="id_exportbuttonM" title="Send by mail" value="" style=" padding-inline: 8px; margin-left: 8px; width: 35.6px; height: 35px;margin-bottom: 8px;">
    <input class="fa btn btn-secondary exportbuttonS" name="exportbuttonS" id="id_exportbuttonS" title="Send on scheduler" value="" style="padding-inline: 8px; margin-left: 8px; width: 35.6px; height: 35px;margin-bottom: 8px;">
    <div style="width: 100%;">
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

    $(document).on('change','td select',function(){
        updateSelect($(this))
        console.log('yo');
    });

    $(".convertbutton").click(function() {
        const values = [];
        $('td:nth-child(2) select').each(function( index ) {
            values.push($(this).val())
        });
        import_input.val(values.join(','))
    });

    $('body').on('DOMSubtreeModified', 'th.studname-1', function(){
        $("#page-mod-competencies-view .competencies-list td:nth-child(3) textarea").each(function() { $(this).height($(this).closest('td').height())})
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
                console.log(competencies);
                table.find('td:nth-child(-n+'+(competencies.length+2)+') select').each(function() {
                    let splittedId = $(this).attr('id').split('_');
                    let compid = splittedId[2];
                    let td = $(this).closest('td');
                    let colid = splittedId.length > 3 ? parseInt(splittedId[3]) : 0;
                    td.removeClass (function (index, className) {return (className.match (/(^|\s)colored\S+/g) || []).join(' ');});
                    let competency = competencies.length > colid ? competencies[colid].find(comp => comp.competency == compid) : ""
                    console.log(colid, competencies[colid].find(comp => comp.competency == compid), competency.defaultvalue);
                    td.addClass('colored-' + (competency.value ? competency.value : competency.defaultval))
                })
            }
        }
    }, false);
    return realXHR;
}

window.XMLHttpRequest = newXHR;

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
    })
}

function updateSelect(elem) {
    var value = elem.val()[0];
    elem = elem.closest('td');
    console.log('updated', value)
    elem.removeClass('colored-0 colored-1 colored-2 colored-3 colored-4 colored-');
    elem.addClass("colored-" + value)
    if ( !elem.is('[class^="competency-"], [class*=" competency-"]') ) {
        elem.siblings().each(function() {
            if($(this).is('[class^="competency-"], [class*=" competency-"]')) {
                $(this).removeClass (function (index, className) {return (className.match (/(^|\s)colored-\S+/g) || []).join(' ');});
                $(this).addClass("colored-" + value)
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
    sendStudent(doMail, doScheduler);
}

function sendStudent(doMail, doScheduler) {
    var xhr = new XMLHttpRequest();
    var url = "https://prod-238.westeurope.logic.azure.com:443/workflows/972468d651d840de8e134b4267e222a2/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Fey56QsbiorNeg1XE2XxI4fuEBkvYbihs7AlHxj_3A0";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
        }
    };

    for (var i = 0; i < students.length; i++) {
        var output = JSON.parse(JSON.stringify(students[i]));
        var table = generateTable(students[i]);
        output.extract = table;
        output.course = course_name;

        if (doScheduler)
            findScheduler(getKeynoteUrl(), data.users[0].id, table)
        if (doMail)
            xhr.send(JSON.stringify(output));
    }
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
            console.log(tdTeacher.find('a').attr('href'));
            var teacherId = new URL(tdTeacher.find('a').attr('href')).searchParams.get('id');
            var tdActions = tdTeacher.next();
            var actionUrl = new URL(tdActions.find('a').eq(1).attr('href'));
            setSchedulerComment(actionUrl.searchParams.get('id'), actionUrl.searchParams.get('slotid'), actionUrl.searchParams.get('sesskey'), teacherId, message);
        } else {
            var nextpage = pageDom.find('a[aria-label="Next"]');
            if (nextpage) {
                findScheduler(nextpage.attr("href"), userIdToFind)
            } else {
                console.error("No scheduler found")
            }
        }
    })
        .catch(error => console.log('error', error));
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
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

