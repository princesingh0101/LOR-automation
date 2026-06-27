/**
 * Frext Technologies - LOR Automation
 * Logging Module
 * 
 * Handles all logging operations to the Logs sheet.
 */

var AppLogger = (function() {

  /**
   * Logs an event to the Logs sheet.
   * @param {string} studentName - Name of the student.
   * @param {string} email - Email of the student.
   * @param {string} status - Status: SUCCESS, FAILED, SKIPPED.
   * @param {string} error - Error message if any (empty string if none).
   * @param {number} executionTime - Execution time in milliseconds.
   */
  function log(studentName, email, status, error, executionTime) {
    try {
      var spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      var logSheet = Utils.getOrCreateLogSheet(spreadsheet);
      var timestamp = new Date();
      logSheet.appendRow([
        timestamp,
        studentName,
        email,
        status,
        error,
        executionTime
      ]);
    } catch (err) {
      console.error('Failed to write log: ' + err.message);
    }
  }

  /**
   * Logs a successful operation.
   * @param {string} studentName - Name of the student.
   * @param {string} email - Email of the student.
   * @param {number} executionTime - Execution time in milliseconds.
   */
  function logSuccess(studentName, email, executionTime) {
    log(studentName, email, 'SUCCESS', '', executionTime);
  }

  /**
   * Logs a failed operation.
   * @param {string} studentName - Name of the student.
   * @param {string} email - Email of the student.
   * @param {string} error - Error message.
   * @param {number} executionTime - Execution time in milliseconds.
   */
  function logFailure(studentName, email, error, executionTime) {
    log(studentName, email, 'FAILED', error, executionTime);
  }

  /**
   * Logs a skipped operation (duplicate or invalid data).
   * @param {string} studentName - Name of the student.
   * @param {string} email - Email of the student.
   * @param {string} reason - Reason for skipping.
   */
  function logSkipped(studentName, email, reason) {
    log(studentName, email, 'SKIPPED', reason, 0);
  }

  return {
    log: log,
    logSuccess: logSuccess,
    logFailure: logFailure,
    logSkipped: logSkipped
  };

})();
