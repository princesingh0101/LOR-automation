/**
 * Frext Technologies - LOR Automation
 * Email Module
 * 
 * Handles professional email delivery with PDF attachment.
 * Can be enabled/disabled via settings.
 */

var EmailSender = (function() {

  /**
   * Sends a professional HTML email with the PDF LOR attached.
   * @param {string} recipientEmail - The recipient's email address.
   * @param {string} studentName - The student's full name.
   * @param {string} internId - The Intern ID.
   * @param {string} pdfUrl - The URL to the generated PDF.
   * @param {string} pdfId - The Drive file ID of the PDF (for attachment).
   */
  function send(recipientEmail, studentName, internId, pdfUrl, pdfId) {
    try {
      if (!isEmailEnabled()) {
        Logger.log('Email module is disabled. Skipping email for ' + studentName);
        return { sent: false, reason: 'Email disabled in settings' };
      }

      if (!recipientEmail || recipientEmail === '') {
        Logger.log('No email address for ' + studentName + '. Skipping email.');
        return { sent: false, reason: 'No email address' };
      }

      var subject = CONFIG.EMAIL.SUBJECT;
      var htmlBody = buildEmailHtml(studentName, internId, pdfUrl);
      var pdfBlob = getPdfAttachment(pdfId);

      if (pdfBlob) {
        GmailApp.sendEmail(recipientEmail, subject, '', {
          htmlBody: htmlBody,
          attachments: [pdfBlob],
          name: CONFIG.EMAIL.FROM_NAME
        });
      } else {
        GmailApp.sendEmail(recipientEmail, subject, '', {
          htmlBody: htmlBody,
          name: CONFIG.EMAIL.FROM_NAME
        });
      }

      Logger.log('Email sent successfully to ' + recipientEmail);
      return { sent: true };
    } catch (error) {
      Logger.log('Error sending email to ' + recipientEmail + ': ' + error.message);
      return { sent: false, reason: error.message };
    }
  }

  /**
   * Builds a professional HTML email body.
   * @param {string} studentName - The student's full name.
   * @param {string} internId - The Intern ID.
   * @param {string} pdfUrl - The URL to the PDF.
   * @return {string} HTML email body.
   */
  function buildEmailHtml(studentName, internId, pdfUrl) {
    var html = '';
    html += '<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto;">';
    html += '<div style="background-color: #1a237e; padding: 20px; text-align: center;">';
    html += '<h1 style="color: #ffffff; margin: 0;">Frext Technologies</h1>';
    html += '</div>';
    html += '<div style="padding: 30px; background-color: #ffffff; border: 1px solid #e0e0e0;">';
    html += '<p>Dear <strong>' + escapeHtml(studentName) + '</strong>,</p>';
    html += '<p>Congratulations! On behalf of Frext Technologies, we are pleased to provide you with your ';
    html += 'Letter of Recommendation based on your internship performance.</p>';
    html += '<p><strong>Intern ID:</strong> ' + escapeHtml(internId) + '</p>';
    html += '<p>Your Letter of Recommendation has been generated and is attached to this email. ';
    html += 'You can also access it directly using the link below:</p>';
    html += '<p style="text-align: center;">';
    html += '<a href="' + pdfUrl + '" style="display: inline-block; padding: 12px 24px; ';
    html += 'background-color: #1a237e; color: #ffffff; text-decoration: none; border-radius: 4px;">';
    html += 'Download Your LOR</a></p>';
    html += '<p>We wish you all the best in your future endeavors.</p>';
    html += '<p>Best regards,</p>';
    html += '<p><strong>Frext Technologies</strong><br>Internship Program Team</p>';
    html += '</div>';
    html += '<div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">';
    html += '<p>This is an automated message from Frext Technologies. Please do not reply directly to this email.</p>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  /**
   * Retrieves the PDF file as a blob for attachment.
   * @param {string} pdfId - The Drive file ID of the PDF.
   * @return {GoogleAppsScript.Base.Blob|null} The PDF blob or null.
   */
  function getPdfAttachment(pdfId) {
    try {
      var pdfFile = DriveApp.getFileById(pdfId);
      return pdfFile.getBlob();
    } catch (error) {
      Logger.log('Error attaching PDF: ' + error.message);
      return null;
    }
  }

  /**
   * Checks if email sending is enabled.
   * Reads from either CONFIG or Settings sheet.
   * @return {boolean} True if email is enabled.
   */
  function isEmailEnabled() {
    try {
      var spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      var settingsSheet = spreadsheet.getSheetByName(CONFIG.SETTINGS_SHEET_NAME);
      if (settingsSheet) {
        var value = settingsSheet.getRange(2, 2).getValue();
        if (String(value).toUpperCase() === 'TRUE' || value === true) {
          return true;
        }
        if (String(value).toUpperCase() === 'FALSE' || value === false) {
          return false;
        }
      }
    } catch (error) {
      Logger.log('Error reading email settings: ' + error.message);
    }
    return CONFIG.EMAIL.ENABLED;
  }

  /**
   * Escapes HTML special characters.
   * @param {string} text - The text to escape.
   * @return {string} Escaped text.
   */
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    send: send,
    isEmailEnabled: isEmailEnabled,
    buildEmailHtml: buildEmailHtml
  };

})();
