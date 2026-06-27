/**
 * Frext Technologies - LOR Automation
 * Google Drive Operations Module
 * 
 * Handles all file operations including saving, moving, and retrieving files.
 */

var DriveOps = (function() {

  /**
   * Gets the destination folder for all generated files.
   * @return {GoogleAppsScript.Drive.Folder} The destination folder.
   */
  function getDestinationFolder() {
    try {
      return DriveApp.getFolderById(CONFIG.DESTINATION_FOLDER_ID);
    } catch (error) {
      Logger.log('Error accessing destination folder: ' + error.message);
      throw new Error('Cannot access Drive folder. Check folder ID and permissions.');
    }
  }

  /**
   * Creates a copy of the Google Slides template.
   * @param {string} copyName - The name for the copied presentation.
   * @return {Object} Object containing the copied file and its URL.
   */
  function copyTemplate(copyName) {
    try {
      var templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_SLIDE_ID);
      var folder = getDestinationFolder();
      var copiedFile = templateFile.makeCopy(copyName, folder);
      return {
        file: copiedFile,
        id: copiedFile.getId(),
        url: copiedFile.getUrl()
      };
    } catch (error) {
      Logger.log('Error copying template: ' + error.message);
      throw error;
    }
  }

  /**
   * Converts a Google Slides file to PDF using Drive API.
   * @param {string} fileId - The ID of the Google Slides file.
   * @param {string} pdfName - The name for the PDF file.
   * @return {Object} Object containing the PDF file ID and URL.
   */
  function convertToPdf(fileId, pdfName) {
    try {
      var folder = getDestinationFolder();
      var slidesFile = DriveApp.getFileById(fileId);
      var pdfBlob = slidesFile.getAs('application/pdf');
      pdfBlob.setName(pdfName);
      var pdfFile = folder.createFile(pdfBlob);
      return {
        id: pdfFile.getId(),
        url: pdfFile.getUrl()
      };
    } catch (error) {
      Logger.log('Error converting to PDF: ' + error.message);
      throw error;
    }
  }

  /**
   * Retrieves a file by its ID.
   * @param {string} fileId - The file ID.
   * @return {GoogleAppsScript.Drive.File} The file object.
   */
  function getFile(fileId) {
    try {
      return DriveApp.getFileById(fileId);
    } catch (error) {
      Logger.log('Error retrieving file ' + fileId + ': ' + error.message);
      return null;
    }
  }

  /**
   * Verifies that the template and folder exist and are accessible.
   * @return {Object} Object with status and error message if any.
   */
  function verifyAccess() {
    var result = { success: true, errors: [] };

    try {
      DriveApp.getFileById(CONFIG.TEMPLATE_SLIDE_ID);
    } catch (error) {
      result.success = false;
      result.errors.push('Template slide inaccessible: ' + error.message);
    }

    try {
      DriveApp.getFolderById(CONFIG.DESTINATION_FOLDER_ID);
    } catch (error) {
      result.success = false;
      result.errors.push('Destination folder inaccessible: ' + error.message);
    }

    return result;
  }

  return {
    getDestinationFolder: getDestinationFolder,
    copyTemplate: copyTemplate,
    convertToPdf: convertToPdf,
    getFile: getFile,
    verifyAccess: verifyAccess
  };

})();
