/**
 * Frext Technologies - LOR Automation
 * Main Entry Point
 * 
 * This is the primary script file.
 * onOpen creates the admin menu.
 * onFormSubmit processes incoming form responses automatically.
 */

/**
 * Runs when the spreadsheet is opened.
 * Creates the custom Frext Automation menu.
 */
function onOpen() {
  AppMenu.createMenu();
}

/**
 * Runs automatically when a form response is submitted.
 * Triggered by the onFormSubmit installable trigger.
 * @param {Object} e - The event object from the form submission.
 */
function onFormSubmit(e) {
  var startTime = new Date().getTime();

  try {
    if (!e || !e.range) {
      Logger.log('onFormSubmit called but event object is missing range.');
      return;
    }

    var row = e.range.getRow();
    var sheet = e.range.getSheet();

    if (!sheet) {
      Logger.log('Could not access sheet from event.');
      return;
    }

    if (Utils.hasExistingLor(sheet, row)) {
      Logger.log('Row ' + row + ' already has an LOR. Skipping.');
      return;
    }

    var student = Utils.getStudentData(sheet, row);

    if (!Utils.isValidStudent(student)) {
      Logger.log('Row ' + row + ' has invalid student data. Skipping.');
      AppLogger.logSkipped('Row ' + row, '', 'Invalid student data');
      return;
    }

    var internId = Utils.generateInternId(sheet);

    var lorResult = GenerateLOR.generate(student, internId);

    var pdfResult = GeneratePDF.generate(lorResult.slidesId, student.fullName);

    Utils.updateRow(sheet, row, [
      { column: CONFIG.COLUMNS.INTERN_ID, value: internId },
      { column: CONFIG.COLUMNS.LOR_LINK, value: lorResult.slidesUrl },
      { column: CONFIG.COLUMNS.PDF_LINK, value: pdfResult.url }
    ]);

    if (EmailSender.isEmailEnabled()) {
      EmailSender.send(student.email, student.fullName, internId, pdfResult.url, pdfResult.id);
    }

    var elapsed = new Date().getTime() - startTime;
    AppLogger.logSuccess(student.fullName, student.email, elapsed);
    Logger.log('LOR generated successfully for ' + student.fullName + ' (ID: ' + internId + ')');

  } catch (error) {
    var elapsed = new Date().getTime() - startTime;
    Logger.log('onFormSubmit error: ' + error.message);

    try {
      if (e && e.range) {
        var student = Utils.getStudentData(e.range.getSheet(), e.range.getRow());
        if (student) {
          AppLogger.logFailure(student.fullName, student.email, error.message, elapsed);
        } else {
          AppLogger.logFailure('Row ' + e.range.getRow(), '', error.message, elapsed);
        }
      } else {
        AppLogger.logFailure('Unknown', '', error.message, elapsed);
      }
    } catch (logError) {
      Logger.log('Could not log failure: ' + logError.message);
    }
  }
}

/**
 * Menu wrapper functions.
 * These are called directly from the custom menu items.
 */

function menuGenerateSelected() {
  AppMenu.generateSelected();
}

function menuGenerateMissing() {
  AppMenu.generateMissing();
}

function menuGenerateMissingPdf() {
  AppMenu.generateMissingPdf();
}

function menuOpenLogs() {
  AppMenu.openLogs();
}

function menuOpenSettings() {
  AppMenu.openSettings();
}

function menuInstallTrigger() {
  TriggerManager.installTrigger();
  SpreadsheetApp.getUi().alert('Trigger', 'Form submit trigger installed successfully.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuRemoveTrigger() {
  TriggerManager.removeTrigger();
  SpreadsheetApp.getUi().alert('Trigger', 'Form submit trigger removed successfully.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuVerifyAccess() {
  var result = DriveOps.verifyAccess();
  var ui = SpreadsheetApp.getUi();
  if (result.success) {
    ui.alert('Access Verified', 'Template and destination folder are accessible.', ui.ButtonSet.OK);
  } else {
    ui.alert('Access Issues', result.errors.join('\n'), ui.ButtonSet.OK);
  }
}
