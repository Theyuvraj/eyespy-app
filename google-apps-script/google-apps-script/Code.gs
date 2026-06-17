const SCRIPT_VERSION = 'eyespy-backup-v1';
const DEFAULT_SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const ASSIGNMENT_SHEET = 'Assignments';
const SUBMISSION_SHEET = 'Submissions';
const BACKUP_SHEET = 'Backups';
const AUDIT_SHEET = 'Audit';

function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = String(params.action || 'ping');
  try {
    if (action === 'ping') return json_({ status: 'ok', scriptVersion: SCRIPT_VERSION });
    if (action === 'status') return json_(status_());
    if (action === 'health') return json_(status_());
    return json_({ status: 'error', message: 'Unknown action', scriptVersion: SCRIPT_VERSION });
  } catch (err) {
    return json_({ status: 'error', message: String(err && err.message ? err.message : err), scriptVersion: SCRIPT_VERSION });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = String(payload.action || '');
    if (!action) throw new Error('Missing action');
    if (action === 'saveHomework') {
      appendRows_(ASSIGNMENT_SHEET, ['hw_id', 'date', 'due_date', 'class', 'subject', 'hw_text', 'assigned_by', 'created_at'], payload.rows || [], row => [
        row.hw_id || '',
        row.date || '',
        row.due_date || '',
        row.class || '',
        row.subject || '',
        row.hw_text || '',
        row.assigned_by || '',
        row.created_at || '',
      ]);
      audit_('saveHomework', `${(payload.rows || []).length} homework rows`);
      return json_({ status: 'ok' });
    }
    if (action === 'saveSubmissions') {
      appendRows_(SUBMISSION_SHEET, ['date', 'class', 'student_name', 'status', 'subjects_not_done', 'grade', 'marked_by', 'marked_at'], payload.rows || [], row => [
        row.date || '',
        row.class || '',
        row.student_name || '',
        row.status || '',
        row.subjects_not_done || '',
        row.grade || '',
        row.marked_by || '',
        row.marked_at || '',
      ]);
      audit_('saveSubmissions', `${(payload.rows || []).length} submission rows`);
      return json_({ status: 'ok' });
    }
    if (action === 'saveBackup') {
      appendRows_(BACKUP_SHEET, ['saved_at', 'backup_type', 'label', 'payload_json'], [payload], row => [
        row.savedAt || '',
        row.backupType || '',
        row.label || '',
        JSON.stringify(row.state || {}),
      ]);
      audit_('saveBackup', String(payload.backupType || 'backup'));
      return json_({ status: 'ok' });
    }
    return json_({ status: 'error', message: `Unsupported action: ${action}` });
  } catch (err) {
    return json_({ status: 'error', message: String(err && err.message ? err.message : err), scriptVersion: SCRIPT_VERSION });
  }
}

function status_() {
  ensureSchema_();
  return {
    status: 'ok',
    scriptVersion: SCRIPT_VERSION,
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    updatedAt: new Date().toISOString(),
  };
}

function ensureSchema_() {
  const ss = SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID);
  ensureSheet_(ss, ASSIGNMENT_SHEET, ['hw_id', 'date', 'due_date', 'class', 'subject', 'hw_text', 'assigned_by', 'created_at']);
  ensureSheet_(ss, SUBMISSION_SHEET, ['date', 'class', 'student_name', 'status', 'subjects_not_done', 'grade', 'marked_by', 'marked_at']);
  ensureSheet_(ss, BACKUP_SHEET, ['saved_at', 'backup_type', 'label', 'payload_json']);
  ensureSheet_(ss, AUDIT_SHEET, ['timestamp', 'action', 'summary']);
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendRows_(sheetName, headers, items, mapRow) {
  const ss = SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID);
  const sheet = ensureSheet_(ss, sheetName, headers);
  const rows = (items || []).map(mapRow);
  if (!rows.length) return;
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function audit_(action, summary) {
  const ss = SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID);
  const sheet = ensureSheet_(ss, AUDIT_SHEET, ['timestamp', 'action', 'summary']);
  sheet.appendRow([new Date().toISOString(), action, summary]);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
