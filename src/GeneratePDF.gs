/**
 * Frext Technologies - LOR Automation
 * PDF Generation Module
 * 
 * Handles conversion of Google Slides to PDF format.
 */

var GeneratePDF = (function() {

  /**
   * Generates a PDF from the Google Slides presentation.
   * @param {string} slidesId - The ID of the Google Slides file.
   * @param {string} studentName - The student's full name (for naming).
   * @return {Object} Object containing the PDF URL and ID.
   */
  function generate(slidesId, studentName) {
    try {
      var pdfName = CONFIG.NAMING.PDF_PREFIX + studentName + CONFIG.NAMING.PDF_EXTENSION;
      var pdfResult = DriveOps.convertToPdf(slidesId, pdfName);
      return pdfResult;
    } catch (error) {
      Logger.log('Error generating PDF for ' + studentName + ': ' + error.message);
      throw error;
    }
  }

  return {
    generate: generate
  };

})();
