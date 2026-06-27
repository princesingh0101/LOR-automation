/**
 * Frext Technologies - LOR Automation
 * Admin Menu Module
 * 
 * Creates the custom menu in Google Sheets for manual operations.
 */

var AppMenu = (function() {

  /**
   * Creates the custom "Frext Automation" menu in the spreadsheet UI.
   * Called automatically when the spreadsheet opens.
   */
  function createMenu() {
    try {
      var ui = SpreadsheetApp.getUi();
      var menu = ui.createMenu('Frext Automation');

      menu.addItem('Generate Selected LOR', 'menuGenerateSelected');
      menu.addItem('Generate Missing LOR', 'menuGenerateMissing');
      menu.addItem('Generate Missing PDF', 'menuGenerateMissingPdf');
      menu.addSeparator();
      menu.addItem('Open Logs', 'menuOpenLogs');
      menu.addItem('Settings', 'menuOpenSettings');
      menu.addSeparator();
      menu.addItem('Install Trigger', 'menuInstallTrigger');
      menu.addItem('Remove Trigger', 'menuRemoveTrigger');
      menu.addItem('Verify Access', 'menuVerifyAccess');

      menu.addToUi();
    } catch (error) {
      Logger.log('Error creating menu: ' + error.message);
    }
  }

  /**
   * Prompts the user to select a range and generates LOR for selected rows.
   */
  function generateSelected() {
    try {
      var ui = SpreadsheetApp.getUi();
      var sheet = Utils.getResponseSheet();

      if (!sheet) {
        ui.alert('Error', 'Response sheet not found.', ui.ButtonSet.OK);
        return;
      }

      var range = sheet.getActiveRange();
      if (!range) {
        ui.alert('No Selection', 'Please select the rows to process.', ui.ButtonSet.OK);
        return;
      }

      var selectedRows = [];
      var rowValues = range.getValues();

      for (var r = 0; r < rowValues.length; r++) {
        var rowNum = range.getRow() + r;
        if (rowNum >= 2) {
          selectedRows.push(rowNum);
        }
      }

      if (selectedRows.length === 0) {
        ui.alert('No Rows', 'Selected range does not contain data rows.', ui.ButtonSet.OK);
        return;
      }

      var confirm = ui.alert(
        'Generate LOR',
        'Generate LOR for ' + selectedRows.length + ' selected row(s)?',
        ui.ButtonSet.YES_NO
      );

      if (confirm !== ui.Button.YES) return;

      var results = processRows(selectedRows);
      showResultDialog(results);
    } catch (error) {
      Logger.log('Error in generateSelected: ' + error.message);
      SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    }
  }

  /**
   * Finds rows with missing LOR and generates them.
   */
  function generateMissing() {
    try {
      var ui = SpreadsheetApp.getUi();
      var sheet = Utils.getResponseSheet();

      if (!sheet) {
        ui.alert('Error', 'Response sheet not found.', ui.ButtonSet.OK);
        return;
      }

      var lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        ui.alert('No Data', 'No form responses found.', ui.ButtonSet.OK);
        return;
      }

      var missingRows = [];
      for (var row = 2; row <= lastRow; row++) {
        if (!Utils.hasExistingLor(sheet, row)) {
          missingRows.push(row);
        }
      }

      if (missingRows.length === 0) {
        ui.alert('All Generated', 'All rows already have LOR generated.', ui.ButtonSet.OK);
        return;
      }

      var confirm = ui.alert(
        'Generate Missing LOR',
        'Generate LOR for ' + missingRows.length + ' missing row(s)?',
        ui.ButtonSet.YES_NO
      );

      if (confirm !== ui.Button.YES) return;

      var results = processRows(missingRows);
      showResultDialog(results);
    } catch (error) {
      Logger.log('Error in generateMissing: ' + error.message);
      SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    }
  }

  /**
   * Finds rows with LOR but missing PDF and regenerates PDF only.
   */
  function generateMissingPdf() {
    try {
      var ui = SpreadsheetApp.getUi();
      var sheet = Utils.getResponseSheet();

      if (!sheet) {
        ui.alert('Error', 'Response sheet not found.', ui.ButtonSet.OK);
        return;
      }

      var lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        ui.alert('No Data', 'No form responses found.', ui.ButtonSet.OK);
        return;
      }

      var count = 0;
      for (var row = 2; row <= lastRow; row++) {
        var lorLink = sheet.getRange(row, CONFIG.COLUMNS.LOR_LINK).getValue();
        var pdfLink = sheet.getRange(row, CONFIG.COLUMNS.PDF_LINK).getValue();

        if (String(lorLink).trim() !== '' && String(pdfLink).trim() === '') {
          try {
            var student = Utils.getStudentData(sheet, row);
            if (student && student.fullName) {
              var slidesId = extractFileIdFromUrl(String(lorLink).trim());
              if (slidesId) {
                var pdfResult = GeneratePDF.generate(slidesId, student.fullName);
                Utils.updateRow(sheet, row, [
                  { column: CONFIG.COLUMNS.PDF_LINK, value: pdfResult.url }
                ]);
                count++;
              }
            }
          } catch (err) {
            Logger.log('Error generating missing PDF at row ' + row + ': ' + err.message);
          }
        }
      }

      ui.alert('PDF Generation Complete', 'Generated ' + count + ' missing PDF(s).', ui.ButtonSet.OK);
    } catch (error) {
      Logger.log('Error in generateMissingPdf: ' + error.message);
      SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    }
  }

  /**
   * Opens the Logs sheet.
   */
  function openLogs() {
    try {
      var spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      var logSheet = Utils.getOrCreateLogSheet(spreadsheet);
      logSheet.activate();
      spreadsheet.setActiveSheet(logSheet);
    } catch (error) {
      Logger.log('Error opening logs: ' + error.message);
      SpreadsheetApp.getUi().alert('Error', 'Could not open Logs sheet.', SpreadsheetApp.getUi().ButtonSet.OK);
    }
  }

  /**
   * Opens the Settings sheet.
   */
  function openSettings() {
    try {
      var spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      var settingsSheet = Utils.getOrCreateSettingsSheet(spreadsheet);
      settingsSheet.activate();
      spreadsheet.setActiveSheet(settingsSheet);
    } catch (error) {
      Logger.log('Error opening settings: ' + error.message);
      SpreadsheetApp.getUi().alert('Error', 'Could not open Settings sheet.', SpreadsheetApp.getUi().ButtonSet.OK);
    }
  }

  /**
   * Processes an array of row numbers, generating LOR for each.
   * @param {Array} rows - Array of row numbers to process.
   * @return {Object} Results summary.
   */
  function processRows(rows) {
    var results = {
      success: 0,
      failed: 0,
      skipped: 0,
      total: rows.length,
      details: []
    };

    var sheet = Utils.getResponseSheet();
    if (!sheet) return results;

    for (var i = 0; i < rows.length; i++) {
      var startTime = new Date().getTime();
      var row = rows[i];

      try {
        var student = Utils.getStudentData(sheet, row);

        if (!Utils.isValidStudent(student)) {
          results.skipped++;
          results.details.push({ row: row, status: 'SKIPPED', reason: 'Invalid student data' });
          AppLogger.logSkipped('Row ' + row, '', 'Invalid student data');
          continue;
        }

        if (Utils.hasExistingLor(sheet, row)) {
          results.skipped++;
          results.details.push({ row: row, status: 'SKIPPED', reason: 'LOR already exists' });
          AppLogger.logSkipped(student.fullName, student.email, 'Duplicate - LOR already exists');
          continue;
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
        results.success++;
        results.details.push({ row: row, status: 'SUCCESS', name: student.fullName });
        AppLogger.logSuccess(student.fullName, student.email, elapsed);

      } catch (error) {
        var elapsed = new Date().getTime() - startTime;
        results.failed++;

        var studentName = 'Row ' + row;
        try {
          var s = Utils.getStudentData(sheet, row);
          if (s) studentName = s.fullName;
        } catch (e) {}

        results.details.push({ row: row, status: 'FAILED', reason: error.message });
        AppLogger.logFailure(studentName, '', error.message, elapsed);
        Logger.log('Error processing row ' + row + ': ' + error.message);
      }
    }

    return results;
  }

  /**
   * Shows a result dialog after batch processing.
   * @param {Object} results - Results object from processRows.
   */
  function showResultDialog(results) {
    var ui = SpreadsheetApp.getUi();
    var message = 'Processing Complete\n\n';
    message += 'Total: ' + results.total + '\n';
    message += 'Success: ' + results.success + '\n';
    message += 'Failed: ' + results.failed + '\n';
    message += 'Skipped: ' + results.skipped + '\n';

    if (results.failed > 0) {
      message += '\nCheck Logs sheet for error details.';
    }

    ui.alert('LOR Generation', message, ui.ButtonSet.OK);
  }

  /**
   * Extracts a file ID from a Google Drive URL.
   * @param {string} url - The Google Drive URL.
   * @return {string|null} The file ID or null.
   */
  function extractFileIdFromUrl(url) {
    try {
      var patterns = [
        /\/d\/([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/
      ];
      for (var i = 0; i < patterns.length; i++) {
        var match = url.match(patterns[i]);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  return {
    createMenu: createMenu,
    generateSelected: generateSelected,
    generateMissing: generateMissing,
    generateMissingPdf: generateMissingPdf,
    openLogs: openLogs,
    openSettings: openSettings,
    processRows: processRows,
    extractFileIdFromUrl: extractFileIdFromUrl
  };

})();
