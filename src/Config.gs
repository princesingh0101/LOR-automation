/**
 * Frext Technologies - LOR Automation
 * Configuration and Constants
 * 
 * Central configuration file. Update these values to match your setup.
 */

var CONFIG = {
  /**
   * Google Sheet ID where form responses are stored.
   * Replace with your actual Sheet ID from the URL.
   */
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',

  /**
   * Name of the response sheet within the spreadsheet.
   */
  RESPONSE_SHEET_NAME: 'Form Responses 1',

  /**
   * Google Slides Template ID for the LOR.
   */
  TEMPLATE_SLIDE_ID: '1RTsNPLjcukQ12mRRjm3BrbvoIiFyvUyB',

  /**
   * Google Drive Folder ID where all generated files are stored.
   */
  DESTINATION_FOLDER_ID: '1oRWAS_qe3jRc_ZoD9yLYl5_d8A4R6mRf',

  /**
   * Column mapping (1-indexed).
   * B=2, C=3, G=7, J=10, T=20, U=21, V=22
   */
  COLUMNS: {
    FULL_NAME: 2,
    EMAIL: 3,
    COLLEGE_NAME: 7,
    INTERNSHIP_DOMAIN: 10,
    INTERN_ID: 20,
    LOR_LINK: 21,
    PDF_LINK: 22
  },

  /**
   * Intern ID format configuration.
   */
  INTERN_ID: {
    PREFIX: 'FT-INT-2026-',
    FORMAT: '0000'
  },

  /**
   * Placeholder mapping for Google Slides template.
   */
  PLACEHOLDERS: {
    NAME: '{{NAME}}',
    DATE: '{{DATE}}'
  },

  /**
   * Date format used for slide generation.
   */
  DATE_FORMAT: 'MMMM dd, yyyy',

  /**
   * Email settings.
   * Set ENABLED to false to skip email sending.
   */
  EMAIL: {
    ENABLED: false,
    SUBJECT: 'Your Letter of Recommendation – Frext Technologies',
    FROM_NAME: 'Frext Technologies'
  },

  /**
   * Log sheet configuration.
   */
  LOG_SHEET_NAME: 'Logs',

  /**
   * Settings sheet configuration.
   */
  SETTINGS_SHEET_NAME: 'Settings',

  /**
   * File naming patterns.
   */
  NAMING: {
    SLIDES_PREFIX: 'LOR - ',
    PDF_PREFIX: 'LOR - ',
    PDF_EXTENSION: '.pdf'
  }
};
