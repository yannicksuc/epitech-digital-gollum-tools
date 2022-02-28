// ==UserScript==
// @name         Digital Tokens
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://intra.epitech.digital/course/*
// @icon         https://www.google.com/s2/favicons?domain=epitech.digital
// @grant        none
// ==/UserScript==



function getTokens(activityID, number) {
    var generatedList = [];
    var key = activityID * activityID;

    while (generatedList.length < number) {
        var middleSquareNumber = getNextMidnumber(key);
        generatedList.push(activityID + "_" + middleSquareNumber);
        key = middleSquareNumber * middleSquareNumber;
    }
    return generatedList;
}


function getNextMidnumber(key) {
    var lenKey = lenInt(key);
    var keyDifference = lenKey - 5;
    var halfKeyDifference = keyDifference / 2;
    var middleSquareNumber = key.toString().substring(halfKeyDifference, 5 + halfKeyDifference);
    return zeroFill(middleSquareNumber, 5);
}

function zeroFill(number, width)
{
    width -= number.toString().length;
    if ( width > 0 ) {
        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + "";
}

function lenInt(int) {
    return int.toString().length;
}


function checkToken(token) {
    var tokenSplit = token.split("_");
    var activityID = tokenSplit[0];
    var tokenMid = tokenSplit[1];
    var key = activityID * activityID;

    for (let index = 0; index < 250; index++) {
        var middleSquareNumber = getNextMidnumber(key);
        if (tokenMid === middleSquareNumber) {
            return ("ok");
        }
        key = middleSquareNumber * middleSquareNumber;
    }
    return ("ko");
}

function download(filename, list) {
    var title = document.getElementsByClassName("page-header-headings")[0].innerHTML.replace("<h1>", "").replace("</h1>", "")
    console.log(title)
    let data = title + "\n";

    for (var i=1; list.length > 0; i++) {
        data += list.pop();
        data += "        ";
        if (i % 4 == 0) {
            data += "\n\n\n"
        }
    }
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


(function() {
    'use strict';

    var elements = document.getElementsByClassName("scheduler");
    for (let item of elements) {
        console.log(item.id);
        var button = document.createElement("button");
        button.classList.add("btn");
        button.classList.add("btn-primary");
        button.innerHTML = "Generate Tokens";
        button.type = "submit";
        button.style.height = "calc(1.5em + .75rem + 2px)"

        var input = document.createElement("input");
        input.classList.add("form-control");
        input.style.width = "60px";
        input.style.margin = "1em";
        input.style.display = "inline-block";
        input.type = "number";
        input.value = 25;
        input.min = 1;
        input.id = "input" + item.id;
        var title = document.createElement("span");
        title.innerHTML = "Génération de token :";

        var id = item.id.toString().replace("module-", "");

        item.appendChild(title);
        item.appendChild(input);
        item.appendChild(button);
        button.addEventListener ("click", function() {
            var token_number = document.getElementById('input' + item.id).value;
            var tokens = getTokens(id, token_number)
            download(item.id + "_token.txt", tokens)
        });
    }
})();






































