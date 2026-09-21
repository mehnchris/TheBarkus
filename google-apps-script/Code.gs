// Only doGet and submitRsvp are callable by visitors. Helpers end in an underscore.
const HEADERS_ = ['Received at', 'Request ID', 'Guest name', 'Email', 'Attending', 'Plus-one name', 'Song request', 'Note to the couple'];

// Run manually from the Apps Script editor once. Never expose this as a web function.
function setup_() {
  const properties = PropertiesService.getScriptProperties();
  let id = properties.getProperty('RSVP_SPREADSHEET_ID');
  if (!id) {
    const spreadsheet = SpreadsheetApp.create('Brandon & Hope — Private wedding RSVPs');
    id = spreadsheet.getId();
    properties.setProperty('RSVP_SPREADSHEET_ID', id);
    const sheet = spreadsheet.getSheets()[0];
    sheet.setName('RSVPs');
    sheet.getRange(1, 1, 1, HEADERS_.length).setValues([HEADERS_]).setBackground('#203f91').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, HEADERS_.length, 180);
    sheet.setColumnWidth(8, 360);
    spreadsheet.setSpreadsheetTimeZone('America/Chicago');
  }
  console.log('Private RSVP spreadsheet: https://docs.google.com/spreadsheets/d/' + id + '/edit');
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Form')
    .setTitle('Brandon & Hope · RSVP')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function validate_(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Please check your response.');
  if (input.website) throw new Error('Please leave the website field empty.');
  const result = {};
  const limits = { name:120, email:254, plusOne:120, song:200, note:2000, requestId:80 };
  Object.keys(limits).forEach(function(key) {
    if (input[key] !== undefined && typeof input[key] !== 'string') throw new Error('Please check your response.');
    result[key] = (input[key] || '').trim();
    if (result[key].length > limits[key]) throw new Error('One of your responses is too long.');
  });
  if (!result.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) throw new Error('Please enter your name and a valid email address.');
  if (!['yes','no'].includes(input.attending)) throw new Error('Please choose whether you can attend.');
  if (!/^[a-zA-Z0-9-]{20,80}$/.test(result.requestId)) throw new Error('Please reload the form and try again.');
  result.email = result.email.toLowerCase();
  result.attending = input.attending;
  if (result.attending === 'no') { result.plusOne = ''; result.song = ''; }
  return result;
}

function safeCell_(value) {
  // Treat guest text as text, never as a Sheets or exported CSV formula.
  return /^[\s]*[=+@-]/.test(value) ? "'" + value : value;
}

function submitRsvp(input) {
  let value;
  try { value = validate_(input); } catch (error) { return {ok:false, message:error.message}; }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return {ok:false,message:'The form is busy. Please try again in a moment.'};
  try {
    const id = PropertiesService.getScriptProperties().getProperty('RSVP_SPREADSHEET_ID');
    if (!id) throw new Error('Storage is not configured.');
    const sheet = SpreadsheetApp.openById(id).getSheetByName('RSVPs');
    if (!sheet) throw new Error('Response sheet is missing.');
    const lastRow = sheet.getLastRow();
    // Idempotent retries: the browser keeps the same random request ID until success.
    const duplicate = lastRow > 1 && sheet.getRange(2,2,lastRow-1,1).createTextFinder(value.requestId).matchEntireCell(true).findNext();
    if (!duplicate) {
      const cache = CacheService.getScriptCache();
      const key = 'email:' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,value.email));
      const attempts = Number(cache.get(key) || 0);
      if (attempts >= 5) return {ok:false,message:'Please wait 10 minutes before sending another response.'};
      const row = [new Date().toISOString(),value.requestId,value.name,value.email,value.attending === 'yes' ? 'Yes' : 'No',value.plusOne,value.song,value.note].map(safeCell_);
      sheet.getRange(lastRow+1,1,1,row.length).setNumberFormat('@').setValues([row]);
      SpreadsheetApp.flush();
      cache.put(key,String(attempts+1),600);
    }
    return {ok:true,message:'Your RSVP has been saved. Thank you for letting us know!'};
  } catch (error) {
    // Do not expose spreadsheet IDs or server exception details to guests.
    console.error('RSVP storage failed.');
    return {ok:false,message:'We couldn’t confirm your RSVP was saved. Please try again in a moment.'};
  } finally { lock.releaseLock(); }
}
