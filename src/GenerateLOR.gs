/**
 * Frext Technologies - LOR Automation
 * LOR Generation Module
 * 
 * Handles the creation of Letter of Recommendation slides
 * from the Google Slides template.
 */

var GenerateLOR = (function() {

  /**
   * Generates a Letter of Recommendation for a student.
   * Copies the template, replaces placeholders, saves to Drive.
   * @param {Object} student - Student data object from Utils.getStudentData().
   * @param {string} internId - The generated Intern ID.
   * @return {Object} Object containing slides URL and intern ID.
   */
  function generate(student, internId) {
    try {
      var slideName = CONFIG.NAMING.SLIDES_PREFIX + student.fullName;
      var dateString = Utils.getFormattedDate();

      var copyResult = DriveOps.copyTemplate(slideName);
      var presentation = SlidesApp.openById(copyResult.id);

      replacePlaceholders(presentation, student.fullName, dateString);
      presentation.saveAndClose();

      return {
        slidesUrl: copyResult.url,
        slidesId: copyResult.id,
        internId: internId
      };
    } catch (error) {
      Logger.log('Error generating LOR for ' + student.fullName + ': ' + error.message);
      throw error;
    }
  }

  /**
   * Replaces all placeholders in the presentation.
   * Searches all slides and all shapes for placeholder text.
   * @param {GoogleAppsScript.Slides.Presentation} presentation - The Slides presentation.
   * @param {string} studentName - The student's full name.
   * @param {string} dateString - The formatted date string.
   */
  function replacePlaceholders(presentation, studentName, dateString) {
    try {
      var slides = presentation.getSlides();
      var replacements = {};
      replacements[CONFIG.PLACEHOLDERS.NAME] = studentName;
      replacements[CONFIG.PLACEHOLDERS.DATE] = dateString;

      for (var s = 0; s < slides.length; s++) {
        var shapes = slides[s].getPageElements();
        for (var e = 0; e < shapes.length; e++) {
          var element = shapes[e];
          if (element.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
            var shape = element.asShape();
            if (shape.getText()) {
              var textRange = shape.getText();
              var originalText = textRange.asString();
              var newText = originalText;

              for (var placeholder in replacements) {
                if (newText.indexOf(placeholder) !== -1) {
                  newText = newText.split(placeholder).join(replacements[placeholder]);
                }
              }

              if (newText !== originalText) {
                textRange.setText(newText);
              }
            }
          }
        }
      }
    } catch (error) {
      Logger.log('Error replacing placeholders: ' + error.message);
      throw error;
    }
  }

  return {
    generate: generate,
    replacePlaceholders: replacePlaceholders
  };

})();
