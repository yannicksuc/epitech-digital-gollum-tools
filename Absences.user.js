// ==UserScript==
// @name         Absences
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Script to notify absenteism
// @author       Yannick Suc
// @match        https://intra.epitech.digital/mod/scheduler/view.php?id=*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.js
// @resoure      https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.css
// @grant        none
// ==/UserScript==

'use strict';

const CONTAINER_CLASSLIST = 'cell c6 lastcol';
const CLASS = "cell c6 lastcol";
const TEAMS_CONTAINER = "cell c5";

(function() {
    $('body').append('<div id="myModal" class="modal"><div class="modal-content"><p>Some text in the Modal..</p></div></div>')
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function thefinder(row, classToSearch) {
        if (!row.is('tr')) {
            return "";
        }
        var soluce = row.find(classToSearch).text();
        if (soluce !== "") {
            return soluce;
        }
        return thefinder(row.prev(), classToSearch);
    }

    /* Add buttons */
    $('#slotmanager .cell.lastcol').each(function(i, obj) {
        var content = $(this).text();
        $(this).html($(this).children());
        $(this).append('<i class="icon fa fa-paper-plane fa-fw action-icon send-absence-action" style="cursor: pointer;" title="Send absences" aria-label="Send absences"></i>');
        $(this).append(content);
    });

    $('.commandbar').append('<a class="d-inline-block icon-no-margin send-bulk-absence-action" role="button" href="#">Send absences<i class="icon fa fa-paper-plane fa-fw" title="Send absences" aria-label="Send absences"></i></a>');

    function getAbsStudents()
    {
        var tablerow = $(this).parent().parent();
        var studentlist = tablerow.find('.studentlist');
        var mails = studentlist.first().find("a").attr("href").split("=")[1].split(',');
        var day = new Date(Date.parse(thefinder(tablerow, ".cell.c1"))).toLocaleDateString();
        var start = thefinder(tablerow, ".cell.c2");
        var end = thefinder(tablerow, ".cell.c3");
        var location = thefinder(tablerow, ".cell.c4");
        var teacher = tablerow.find(".cell.c6 a").text();
        var students = [];

        tablerow.find(".cell.c5 .otherstudent").each(function( index ) {
            if (!$(this).find('input').is(":checked")) {
                students.push({
                    'mail': mails[index],
                    'date': day,
                    'start': start,
                    'end': end,
                    'teacher': teacher,
                    'location': location
                });
            }
        });

        return students;
    }

    function sendStudents(students)
    {
        var output = {
            'url': window.location.href,
            'course': '[' + $('h1').first().text() + '] : ' + $('h2').first().text(),
            'students': students
        };
        var xhr = new XMLHttpRequest();
        var url = "https://prod-141.westeurope.logic.azure.com:443/workflows/bc2b980b5b804228b6aab8004db66937/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dfkfOyL3YC9TtPZzdq5KAdS2XzCeiFNLXAzsnKOlN_o";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
            }
        };

        var data = JSON.stringify(output);
        xhr.send(data);
    }

    /* On click general*/
    $('.commandbar .send-bulk-absence-action').click(function() {
        var students = [];
        $('.send-absence-action').each(function() {
            students.push(...getAbsStudents.call(this));
        });

        var output = students.map(function(item) { return item['mail'].replace('.', ' ').split('@')[0] + ' ' + item['start'] + '-' + item['end'] + ' ' + item['teacher']; });
        if (confirm(output.join('\n'))) {
           sendStudents(students);
           showModal(students);
        } else {
           showModal([]);
        }
    });

    /* On click row*/
    $('.send-absence-action').click(function() {
        var students = getAbsStudents.call(this);
        sendStudents(students);
        showModal(students);
    });

    function showModal(students)
    {
        var output = students.map(function(item) { return item['mail'].replace('.', ' ').split('@')[0] + ' ' + item['start'] + '-' + item['end'] + ' ' + item['teacher']; }).join('<br>');
        modal.style.display = "block";
        $("#myModal p").html("<b>Absence(s) sent to :</b><br>" + output);
        autoCloseModalRoutine();
    }

    function autoCloseModalRoutine()
    {
      setTimeout(function() {
            if($("#myModal .modal-content:hover").length != 0){
                autoCloseModalRoutine()
            } else{
                modal.style.display = "none";
            }
      }, 2000);
    }

    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

    addGlobalStyle('.modal{display:none;position:fixed;z-index:1;padding-top:100px;left:0;top:0;width:100%;height:100%;overflow:auto;}.modal-content{background-color:#fefefe;margin:auto;padding:20px;border:1px solid #888;width:80%}.close{color:#aaa;float:right;font-size:28px;font-weight:700}.close:focus,.close:hover{color:#000;text-decoration:none;cursor:pointer}');

    var $chkboxes = $('.studentselect');
    var lastChecked = null;

    $chkboxes.click(function(e) {
        if (!lastChecked) {
            lastChecked = this;
            return;
        }

        if (e.shiftKey) {
            var start = $chkboxes.index(this);
            var end = $chkboxes.index(lastChecked);

            $('.studentselect').slice(Math.min(start,end), Math.max(start,end) + 1).filter(':not(:checked)').click();
        }

        lastChecked = this;
    });

})();













