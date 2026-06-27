/**
 * Frext Technologies - LOR Automation
 * Utility Functions
 */

var Utils = (function() {

  /**
   * Generates the next Intern ID in sequence.
   * Reads all existing Intern IDs from column T, finds the max,
   * and increments by one.
   * @param {SpreadsheetApp.Sheet} sheet - The response sheet.
   * @return {string} The new Intern ID.
   */
  function generateInternId(sheet) {
    try {
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        return CONFIG.INTERN_ID.PREFIX + '0001';
      }

      var internIdRange = sheet.getRange(2, CONFIG.COLUMNS.INTERN_ID, lastRow - 1, 1);
      var internIds = internIdRange.getValues();
      var maxNum = 0;

      for (var i = 0; i < internIds.length; i++) {
        var id = String(internIds[i][0]).trim();
        if (id !== '') {
          var parts = id.split('-');
          var num = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }

      var nextNum = maxNum + 1;
      var paddedNum = String(nextNum).padStart(4, '0');
      return CONFIG.INTERN_ID.PREFIX + paddedNum;
    } catch (error) {
      Logger.log('Error generating Intern ID: ' + error.message);
      throw error;
    }
  }

  /**
   * Formats the current date according to the configured format.
   * @return {string} Formatted date string.
   */
  function getFormattedDate() {
    try {
      var now = new Date();
      return Utilities.formatDate(now, Session.getScriptTimeZone(), CONFIG.DATE_FORMAT);
    } catch (error) {
      Logger.log('Error formatting date: ' + error.message);
      return new Date().toString();
    }
  }

  /**
   * Retrieves form response data for a specific row.
   * @param {SpreadsheetApp.Sheet} sheet - The response sheet.
   * @param {number} row - The row number to read.
   * @return {Object} Student data object.
   */
  function getStudentData(sheet, row) {
    try {
      var fullName = sheet.getRange(row, CONFIG.COLUMNS.FULL_NAME).getValue();
      var email = sheet.getRange(row, CONFIG.COLUMNS.EMAIL).getValue();
      var college = sheet.getRange(row, CONFIG.COLUMNS.COLLEGE_NAME).getValue();
      var domain = sheet.getRange(row, CONFIG.COLUMNS.INTERNSHIP_DOMAIN).getValue();
      var internId = sheet.getRange(row, CONFIG.COLUMNS.INTERN_ID).getValue();

      return {
        row: row,
        fullName: String(fullName).trim(),
        email: String(email).trim(),
        college: String(college).trim(),
        domain: String(domain).trim(),
        internId: String(internId).trim()
      };
    } catch (error) {
      Logger.log('Error reading student data at row ' + row + ': ' + error.message);
      return null;
    }
  }

  /**
   * Updates specific cells in a row.
   * @param {SpreadsheetApp.Sheet} sheet - The response sheet.
   * @param {number} row - The row number to update.
   * @param {Array} updates - Array of {column, value} objects.
   */
  function updateRow(sheet, row, updates) {
    try {
      for (var i = 0; i < updates.length; i++) {
        sheet.getRange(row, updates[i].column).setValue(updates[i].value);
      }
    } catch (error) {
      Logger.log('Error updating row ' + row + ': ' + error.message);
      throw error;
    }
  }

  /**
   * Checks if a LOR already exists for a given row.
   * @param {SpreadsheetApp.Sheet} sheet - The response sheet.
   * @param {number} row - The row number to check.
   * @return {boolean} True if LOR link already exists.
   */
  function hasExistingLor(sheet, row) {
    try {
      var existingLink = sheet.getRange(row, CONFIG.COLUMNS.LOR_LINK).getValue();
      return String(existingLink).trim() !== '';
    } catch (error) {
      Logger.log('Error checking existing LOR at row ' + row + ': ' + error.message);
      return false;
    }
  }

  /**
   * Validates that required student data is present.
   * @param {Object} student - Student data object.
   * @return {boolean} True if data is valid.
   */
  function isValidStudent(student) {
    if (!student) return false;
    return student.fullName !== '' && student.email !== '';
  }

  /**
   * Gets or creates the logs sheet.
   * @param {SpreadsheetApp.Spreadsheet} spreadsheet - The spreadsheet.
   * @return {SpreadsheetApp.Sheet} The logs sheet.
   */
  function getOrCreateLogSheet(spreadsheet) {
    try {
      var sheet = spreadsheet.getSheetByName(CONFIG.LOG_SHEET_NAME);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(CONFIG.LOG_SHEET_NAME);
        sheet.appendRow(['Timestamp', 'Student Name', 'Email', 'Status', 'Error', 'Execution Time (ms)']);
        sheet.setFrozenRows(1);
        var headerRange = sheet.getRange(1, 1, 1, 6);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#f3f3f3');
      }
      return sheet;
    } catch (error) {
      Logger.log('Error creating log sheet: ' + error.message);
      throw error;
    }
  }

  /**
   * Gets or creates the settings sheet.
   * @param {SpreadsheetApp.Spreadsheet} spreadsheet - The spreadsheet.
   * @return {SpreadsheetApp.Sheet} The settings sheet.
   */
  function getOrCreateSettingsSheet(spreadsheet) {
    try {
      var sheet = spreadsheet.getSheetByName(CONFIG.SETTINGS_SHEET_NAME);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(CONFIG.SETTINGS_SHEET_NAME);
        sheet.appendRow(['Setting', 'Value']);
        sheet.appendRow(['Email Enabled', CONFIG.EMAIL.ENABLED]);
        sheet.appendRow(['Last Processed Row', 0]);
        sheet.setFrozenRows(1);
        var headerRange = sheet.getRange(1, 1, 1, 2);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#f3f3f3');
        sheet.setColumnWidth(1, 200);
        sheet.setColumnWidth(2, 300);
      }
      return sheet;
    } catch (error) {
      Logger.log('Error creating settings sheet: ' + error.message);
      throw error;
    }
  }

  /**
   * Gets the response sheet from the active spreadsheet.
   * @return {SpreadsheetApp.Sheet} The response sheet.
   */
  function getResponseSheet() {
    try {
      var spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      return spreadsheet.getSheetByName(CONFIG.RESPONSE_SHEET_NAME);
    } catch (error) {
      Logger.log('Error getting response sheet: ' + error.message);
      throw error;
    }
  }

  return {
    generateInternId: generateInternId,
    getFormattedDate: getFormattedDate,
    getStudentData: getStudentData,
    updateRow: updateRow,
    hasExistingLor: hasExistingLor,
    isValidStudent: isValidStudent,
    getOrCreateLogSheet: getOrCreateLogSheet,
    getOrCreateSettingsSheet: getOrCreateSettingsSheet,
    getResponseSheet: getResponseSheet
  };

})();
