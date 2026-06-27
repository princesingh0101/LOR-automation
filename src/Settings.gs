/**
 * Frext Technologies - LOR Automation
 * Settings Module
 * 
 * Manages the Settings sheet for runtime configuration.
 */

var AppSettings = (function() {

  /**
   * Reads a setting value from the Settings sheet.
   * @param {string} settingName - The setting name to read.
   * @return {*} The setting value or null if not found.
   */
  function getSetting(settingName) {
    try {
      var spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      var sheet = Utils.getOrCreateSettingsSheet(spreadsheet);
      var lastRow = sheet.getLastRow();

      if (lastRow < 2) return null;

      var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      for (var i = 0; i < data.length; i++) {
        if (String(data[i][0]).trim() === settingName) {
          return data[i][1];
        }
      }
      return null;
    } catch (error) {
      Logger.log('Error reading setting "' + settingName + '": ' + error.message);
      return null;
    }
  }

  /**
   * Updates or creates a setting in the Settings sheet.
   * @param {string} settingName - The setting name.
   * @param {*} value - The setting value.
   */
  function setSetting(settingName, value) {
    try {
      var spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      var sheet = Utils.getOrCreateSettingsSheet(spreadsheet);
      var lastRow = sheet.getLastRow();

      if (lastRow < 2) {
        sheet.appendRow([settingName, value]);
        return;
      }

      var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      for (var i = 0; i < data.length; i++) {
        if (String(data[i][0]).trim() === settingName) {
          sheet.getRange(i + 2, 2).setValue(value);
          return;
        }
      }

      sheet.appendRow([settingName, value]);
    } catch (error) {
      Logger.log('Error setting "' + settingName + '": ' + error.message);
    }
  }

  /**
   * Toggles the email enabled setting.
   * @return {boolean} The new enabled state.
   */
  function toggleEmail() {
    var current = EmailSender.isEmailEnabled();
    var newValue = !current;
    setSetting('Email Enabled', newValue);
    return newValue;
  }

  /**
   * Returns all settings as an object.
   * @return {Object} Key-value pairs of all settings.
   */
  function getAllSettings() {
    try {
      var spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      var sheet = spreadsheet.getSheetByName(CONFIG.SETTINGS_SHEET_NAME);
      if (!sheet) return {};

      var lastRow = sheet.getLastRow();
      if (lastRow < 2) return {};

      var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      var settings = {};
      for (var i = 0; i < data.length; i++) {
        settings[String(data[i][0]).trim()] = data[i][1];
      }
      return settings;
    } catch (error) {
      Logger.log('Error reading all settings: ' + error.message);
      return {};
    }
  }

  return {
    getSetting: getSetting,
    setSetting: setSetting,
    toggleEmail: toggleEmail,
    getAllSettings: getAllSettings
  };

})();
