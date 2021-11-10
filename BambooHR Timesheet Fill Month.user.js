// ==UserScript==
// @name         BambooHR Timesheet Fill Month
// @namespace    month.timesheet.bamboohr.sconde.net
// @version      1.2
// @description  Fill BambooHR Timesheet month with templates
// @author       Sergio Conde
// @match        https://*.bamboohr.com/employees/timesheet/*
// @grant        GM.getValue
// @grant        GM.setValue
// @homepageURL  https://github.com/skgsergio/bamboohr-timesheet-greasemonkey/
// @supportURL   https://github.com/skgsergio/bamboohr-timesheet-greasemonkey/issues
// @updateURL    https://raw.githubusercontent.com/skgsergio/bamboohr-timesheet-greasemonkey/master/bamboohr-timesheet-month.user.js
// ==/UserScript==

'use strict';

/*
   Don't touch this, won't persist across updates.

   Load BambooHR for the first time with the script and then open this script Storage preferences and edit there.
 */
const DEFAULT_TEMPLATES = {
  'default': [{ start: '9:00', end: '13:00' }, { start: '14:00', end: '17:00' }],
  'Fri': [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }]
};

const DEFAULT_ENTROPY_MINUTES = 10;

const CONTAINER_CLASSLIST = 'TimesheetSummary__clockButtonWrapper';
const BUTTON_CLASSLIST = 'fab-Button fab-Button--small fab-Button--width100';

/* Here be dragons */
(async function() {
  let TEMPLATES = await GM.getValue('TEMPLATES');

  if (!TEMPLATES) {
    TEMPLATES = DEFAULT_TEMPLATES;
    GM.setValue('TEMPLATES', TEMPLATES);
  }

  let ENTROPY_MINUTES = await GM.getValue('ENTROPY_MINUTES');

  if (!ENTROPY_MINUTES) {
    ENTROPY_MINUTES = DEFAULT_ENTROPY_MINUTES;
    GM.setValue('ENTROPY_MINUTES', ENTROPY_MINUTES);
  }

  /* Fill Month */
  let container_fill = document.createElement('div');
  container_fill.classList.value = CONTAINER_CLASSLIST;

  let btn_fill = document.createElement('button');
  container_fill.append(btn_fill);

  btn_fill.type = 'button';
  btn_fill.classList.value = BUTTON_CLASSLIST;
  btn_fill.innerText = 'Fill Month';

  btn_fill.onclick = function () {
    let tsd = JSON.parse(document.getElementById('js-timesheet-data').innerHTML);
    let skipped = [];
    let entries = [];
    let tracking_id = 0;

    for (const [day, details] of Object.entries(tsd.timesheet.dailyDetails)) {
      let date = new Date(day);

      /* Skip weekend */
      if ([0, 6].includes(date.getDay())) {
        continue;
      }

      /* Skip holidays & time off */
      let skip_reasons = [];

      skip_reasons.push(...details.holidays.map(h => `${h.name.trim()} (${h.paidHours} hours)`));
      skip_reasons.push(...details.timeOff.map(t => `${t.type.trim()} (${t.amount} ${t.unit})`));

      if (skip_reasons.length > 0) {
        skipped.push(`${day}: ${skip_reasons.join(", ")}`);
        continue;
      }

      /* Get the working time slots for the dow */
      let dow = date.toLocaleDateString("en-US", { weekday: 'short' });
      let slots = DEFAULT_TEMPLATES['default'];

      if (DEFAULT_TEMPLATES.hasOwnProperty(dow)) {
        slots = DEFAULT_TEMPLATES[dow];
      }

      /* Generate the entries for this day */
      for (const [idx, slot] of slots.entries()) {
        tracking_id += 1;

        let start = new Date(`${day} ${slot.start}`)
        start.setMinutes(start.getMinutes())

        let end = new Date(`${day} ${slot.end}`)
        end.setMinutes(end.getMinutes())

        entries.push({
          id: null,
          trackingId: tracking_id,
          employeeId: unsafeWindow.currentlyEditingEmployeeId,
          date: day,
          start: `${start.getHours()}:${('0' + start.getMinutes()).slice(-2)}`,
          end: `${end.getHours()}:${('0' + end.getMinutes()).slice(-2)}`,
          note: ''
        });
      }
    }

    fetch(
      `${window.location.origin}/timesheet/clock/entries`,
      {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'x-csrf-token': unsafeWindow.CSRF_TOKEN
        },
        body: JSON.stringify({ entries: entries })
      }
    ).then(data => {
      if (data.status == 200) {
        alert(`Created ${entries.length} entries.\n\nSkipped days:\n${skipped.join('\n')}`);
        location.reload();
      } else {
        data.text().then(t => alert(`Request error!\nHTTP Code: ${data.status}\nResponse:\n${t}`));
      }
    }).catch(err => alert(`Fetch error!\n\n${err}`));

    return false;
  }

  /* Delete Month */
  let container_del = document.createElement('div');
  container_del.classList.value = CONTAINER_CLASSLIST;

  let btn_del = document.createElement('button');
  container_del.append(btn_del);

  btn_del.type = 'button';
  btn_del.classList.value = BUTTON_CLASSLIST;
  btn_del.innerText = 'Delete Month';

  btn_del.onclick = function () {
    let tsd = JSON.parse(document.getElementById('js-timesheet-data').innerHTML);
    let entries = [];

    /* Grab all entries ids */
    for (const [day, details] of Object.entries(tsd.timesheet.dailyDetails)) {
      for (const entry of details.clockEntries) {
        entries.push(entry.id)
      }
    }

    fetch(
      `${window.location.origin}/timesheet/clock/entries`,
      {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'x-csrf-token': unsafeWindow.CSRF_TOKEN
        },
        body: JSON.stringify({ entries: entries })
      }
    ).then(data => {
      if (data.status == 200) {
        alert(`Deleted ${entries.length} entries.`);
        location.reload();
      } else {
        data.text().then(t => alert(`Request error!\nHTTP Code: ${data.status}\nResponse:\n${t}`));
      }
    }).catch(err => alert(`Fetch error!\n\n${err}`));

    return false;
  }

  /* Add buttons */
  document.querySelector('.TimesheetSummary').prepend(container_del);
  document.querySelector('.TimesheetSummary').prepend(container_fill);
})();
