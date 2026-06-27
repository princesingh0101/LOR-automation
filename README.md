# Frext Technologies - LOR Automation System

Automated Letter of Recommendation generation system built on Google Apps Script. Integrates Google Forms, Sheets, Slides, Drive, and Gmail to produce personalized LOR PDFs on form submission.

## System Architecture

```
Google Form Submission
        |
        v
Google Sheets (Response)
        |
        v
Apps Script (onFormSubmit Trigger)
        |
        ├── Generate Intern ID (Auto-increment)
        ├── Copy Slides Template
        ├── Replace Placeholders ({{NAME}}, {{DATE}})
        ├── Generate PDF (via Drive API)
        ├── Save to Google Drive Folder
        ├── Update Sheet (Intern ID, Slides Link, PDF Link)
        └── Send Email (Optional - with PDF attachment)
```

## File Structure

| File | Purpose |
|------|---------|
| `Code.gs` | Main entry point: `onOpen` and `onFormSubmit` handlers |
| `Config.gs` | Central configuration constants |
| `Utils.gs` | Shared utility functions |
| `Logger.gs` | Logging system to Logs sheet |
| `Drive.gs` | Drive file operations (copy, convert, verify) |
| `GenerateLOR.gs` | Google Slides creation and placeholder replacement |
| `GeneratePDF.gs` | PDF conversion from Slides |
| `Email.gs` | Professional HTML email delivery |
| `Trigger.gs` | Install/remove form submit triggers |
| `Menu.gs` | Custom admin menu UI |
| `Settings.gs` | Runtime settings management |

## Prerequisites

- Google Workspace account (or personal Google account)
- Google Form connected to Google Sheet
- Google Slides template with `{{NAME}}` and `{{DATE}}` placeholders
- Google Drive destination folder

## Installation Guide

### Step 1: Open Apps Script Editor

1. Open your Google Sheet (the one connected to your Form)
2. Click **Extensions > Apps Script**
3. Delete any existing code in the editor

### Step 2: Create Script Files

1. In the Apps Script editor, rename `Code.gs` (default) to match the project
2. Create each file listed above using **File > New > Script file**
3. Name each file exactly as specified (e.g., `Config.gs`, `Utils.gs`, etc.)

### Step 3: Copy Source Code

Copy the source code from each provided `.gs` file into the corresponding Apps Script file.

### Step 4: Configure Settings

Open `Config.gs` and update:

```javascript
SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE'
```

Replace with your actual Google Sheet ID (found in the sheet URL between `/d/` and `/edit`).

### Step 5: Verify Template and Folder IDs

The following values are pre-configured and should work as-is:

- `TEMPLATE_SLIDE_ID`: `1RTsNPLjcukQ12mRRjm3BrbvoIiFyvUyB`
- `DESTINATION_FOLDER_ID`: `1oRWAS_qe3jRc_ZoD9yLYl5_d8A4R6mRf`

Verify these exist and are accessible with your Google account.

### Step 6: Initial Setup

1. Save all files (**Ctrl+S**)
2. In the Apps Script editor, select the `menuInstallTrigger` function and click **Run**
3. Review and accept the permissions (see Permissions Guide below)
4. Refresh your Google Sheet - you will see a new **Frext Automation** menu

### Step 7: Test

Submit a test entry via your Google Form. The system will:
- Auto-generate an Intern ID (FT-INT-2026-0001)
- Create a personalized Google Slides LOR
- Generate and save a PDF
- Update the Sheet with all links and IDs

## Trigger Setup Guide

### Automatic Trigger (Recommended)

The trigger is installed via the **Frext Automation > Install Trigger** menu option.

Alternatively, to set it up manually:

1. In Apps Script editor, click the clock icon (**Triggers**)
2. Click **Add Trigger**
3. Configure:
   - **Function**: `onFormSubmit`
   - **Deployment**: `Head`
   - **Event Source**: `From spreadsheet`
   - **Event Type**: `On form submit`
4. Click **Save**

### Verifying the Trigger

- Open **Apps Script > Triggers**
- You should see `onFormSubmit` listed with type `On form submit`
- To remove: use **Frext Automation > Remove Trigger** or delete from Triggers page

## Permissions Guide

When first running the script, Google will request the following permissions:

| Scope | Reason |
|-------|--------|
| `spreadsheets` | Read/write form response data and settings/log sheets |
| `drive` | Copy Slides template, save PDFs to Drive folder |
| `slides` | Open and edit the copied presentation |
| `gmail` | Send LOR emails with PDF attachments (optional) |

### How to Authorize

1. When prompted, select your Google account
2. Click **Advanced > Go to <Project Name> (unsafe)**
3. Review the permissions and click **Allow**
4. The script will run once to verify access

> **Note**: This is a personal/enterprise script. The "unsafe" warning appears because Google has not verified the app. Your data stays within your own Google Workspace.

## Troubleshooting Guide

### Common Issues

| Problem | Solution |
|---------|----------|
| `Exception: Cannot find file with ID` | Verify template ID in `Config.gs` is correct and accessible |
| `Exception: Cannot find folder with ID` | Verify folder ID in `Config.gs` is correct |
| Script runs but sheet not updated | Check column mapping in `Config.gs` matches your sheet |
| Trigger not firing | Reinstall via **Frext Automation > Install Trigger** |
| Email not sending | Enable email in **Frext Automation > Settings** sheet (set `Email Enabled` to `TRUE`) |
| Duplicate Intern IDs | Ensure column T is empty for new entries; the script auto-increments from existing IDs |
| Permission errors | Remove and re-add the trigger; re-authorize if needed |

### Debug Mode

1. Open **Apps Script editor**
2. Select `onFormSubmit` function
3. Click **Run** to test with manual execution
4. Check **Executions** in the left sidebar for logs
5. Check the **Logs** sheet in your spreadsheet for error details

## Admin Menu Reference

| Menu Item | Function | Description |
|-----------|----------|-------------|
| Generate Selected LOR | Processes selected rows | Select rows in sheet, then click to generate LOR for those entries |
| Generate Missing LOR | Scans for empty LOR links | Processes all rows where column U is empty |
| Generate Missing PDF | Scans for missing PDFs | Generates PDFs for rows that have slides but no PDF |
| Open Logs | Switches to Logs sheet | View timestamped execution logs |
| Settings | Switches to Settings sheet | Configure runtime options like email toggle |
| Install Trigger | Creates onFormSubmit trigger | Enables automatic processing |
| Remove Trigger | Removes form submit trigger | Disables automatic processing |
| Verify Access | Checks Drive permissions | Validates template and folder accessibility |

## Future Upgrade Guide

### Planned Enhancements

1. **Customizable Templates**
   - Add support for multiple LOR templates based on internship domain
   - Add admin UI for template selection

2. **Batch Email Queue**
   - Implement delayed/scheduled email delivery
   - Add email template customization via Settings sheet

3. **Dashboard Sheet**
   - Summary statistics (total generated, success rate, domains)
   - Charts and visualizations

4. **Advanced Placeholders**
   - Support for `{{COLLEGE}}`, `{{DOMAIN}}`, `{{INTERN_ID}}`
   - Custom placeholder mapping via Settings

5. **Error Retry Mechanism**
   - Automatic retry for transient failures
   - Exponential backoff for API rate limits

6. **Multi-Language Support**
   - Language selection in template
   - Localized email templates

### Upgrade Path

- All configuration is in `Config.gs` - easy to update without touching logic
- Each module is independent - add new features as new `.gs` files
- The IIFE pattern prevents global namespace pollution

## Column Reference

| Column | Letter | Purpose | Set By |
|--------|--------|---------|--------|
| B | 2 | Full Name | Google Form |
| C | 3 | Email | Google Form |
| G | 7 | College Name | Google Form |
| J | 10 | Internship Domain | Google Form |
| T | 20 | Intern ID | Script |
| U | 21 | LOR Link | Script |
| V | 22 | PDF Link | Script |

> **IMPORTANT**: Do not modify or delete columns B, C, G, J. Do not change the order of columns T, U, V.

## Support

For issues, feature requests, or contributions, contact the Frext Technologies development team.
