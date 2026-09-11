/**
 * Kharchaaaa waitlist, receiver for anurag.studio.
 * Bound to the waitlist Sheet. Appends one row per request to join.
 *
 * v1, 11 Sep 2026. Modelled line for line on the Raj Associates receiver
 * (raj-associates-website/docs/33-apps-script-code.gs), because that one is
 * already deployed, already tested end to end in a real browser, and already
 * carries the two lessons that cost the most to learn there:
 *
 *   1. Sheets reads a value beginning with = + - or @ as a formula. A phone
 *      number or a Telegram handle typed as +91 98765 43210 or @someone lands
 *      as #ERROR!, and +919876543210 lands silently as the number
 *      919876543210 with the + dropped, which is worse because nothing looks
 *      wrong. Every column except the timestamp is therefore held as plain
 *      text, and the site applies its own apostrophe guard before sending.
 *
 *   2. The reply is readable JSON, not an opaque no-cors response, so the
 *      site can only show the "you're on the list" state once the row has
 *      actually landed. A waitlist that lies about having your email is worse
 *      than one that admits it is down.
 *
 * ── SET UP ──────────────────────────────────────────────────────────────
 *
 *  1. New Google Sheet, named "Kharchaaaa, waitlist". Leave it empty; this
 *     script writes its own headers on the first request.
 *  2. In that Sheet: Extensions > Apps Script. It opens bound to the Sheet,
 *     so it needs no file ID and can never write to the wrong document.
 *  3. Replace everything in Code.gs with this file. Save.
 *  4. Deploy > New deployment > gear icon > Web app:
 *        Description      Kharchaaaa waitlist
 *        Execute as       Me
 *        Who has access   Anyone
 *     Deploy, then authorise it once. Google warns "hasn't verified this app";
 *     that is normal for a private script you wrote yourself.
 *     Advanced > Go to (project name) > Allow.
 *  5. Copy the Web app URL. It looks like:
 *        https://script.google.com/macros/s/AKfy...long.../exec
 *     That URL is the only thing the site needs. It goes in .env.local and in
 *     Vercel as KHARCHAAAA_WAITLIST_URL.
 *
 * To update later: Deploy > Manage deployments > pencil > Version: New
 * version > Deploy. The web app URL does NOT change.
 *
 * ── WHY "Who has access: Anyone" ────────────────────────────────────────
 *
 * It has to be, or the browser cannot post to it. The URL is unguessable, the
 * script only ever appends a row, it cannot read the Sheet back out, and it
 * rejects anything that is not this form. Worst case someone who found the URL
 * adds junk rows, which is what the honeypot and the length caps are for.
 */

var SHEET = 'Waitlist';

var COLUMNS = ['Received', 'Name', 'Email', 'Telegram', 'Platform', 'Current', 'Page'];

/** Nothing here is a paragraph. Caps keep a junk POST from filling the Sheet. */
var MAX = 200;

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    if (String(p.form || '').toLowerCase() !== 'waitlist') {
      return reply(400, 'unknown form');
    }

    // Honeypot. A real person never fills a hidden field; a bot fills everything.
    // Answer 200 so the bot believes it worked and does not come back.
    if (p.company) return reply(200, 'ok');

    var email = String(p.email || '').trim();
    if (!email || email.indexOf('@') < 1 || email.indexOf('.') < 0) {
      return reply(400, 'email required');
    }

    var sheet = tab();
    var row = COLUMNS.map(function (col) {
      if (col === 'Received') return new Date();
      return guard(String(p[col.toLowerCase()] || '').trim().slice(0, MAX));
    });

    sheet.appendRow(row);

    return reply(200, 'ok');
  } catch (err) {
    console.error(err);
    return reply(500, 'error');
  }
}

/** Browsers send a GET when someone opens the URL. Say nothing useful. */
function doGet() {
  return reply(200, 'ok');
}

/**
 * Sheets' own text marker. An apostrophe in front of a value beginning with
 * = + - or @ tells Sheets to store it verbatim, and it is stripped on the way
 * in, so the cell reads exactly what the visitor typed. Belt and braces with
 * the plain-text column format below: the format only applies to tabs this
 * script created, and this applies to every value regardless.
 */
function guard(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function tab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET);
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    // Everything except the timestamp is held as plain text. See the note at
    // the top of this file for what happens when it is not.
    sheet.getRange(2, 2, sheet.getMaxRows() - 1, COLUMNS.length - 1)
         .setNumberFormat('@');
  }
  return sheet;
}

function reply(code, msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: code, message: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
