/**
 * Frext Technologies - LOR Automation
 * Trigger Management Module
 * 
 * Handles installation and removal of the onFormSubmit trigger.
 */

var TriggerManager = (function() {

  /**
   * Installs the form submit trigger if not already present.
   * Called once during setup.
   */
  function installTrigger() {
    try {
      var triggers = ScriptApp.getProjectTriggers();
      for (var i = 0; i < triggers.length; i++) {
        if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
          Logger.log('Trigger already installed.');
          return;
        }
      }

      ScriptApp.newTrigger('onFormSubmit')
        .forSpreadsheet(CONFIG.SHEET_ID)
        .onFormSubmit()
        .create();

      Logger.log('Form submit trigger installed successfully.');
    } catch (error) {
      Logger.log('Error installing trigger: ' + error.message);
      throw error;
    }
  }

  /**
   * Removes all form submit triggers.
   */
  function removeTrigger() {
    try {
      var triggers = ScriptApp.getProjectTriggers();
      var removed = 0;
      for (var i = triggers.length - 1; i >= 0; i--) {
        if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
          ScriptApp.deleteTrigger(triggers[i]);
          removed++;
        }
      }
      Logger.log('Removed ' + removed + ' trigger(s).');
    } catch (error) {
      Logger.log('Error removing triggers: ' + error.message);
      throw error;
    }
  }

  /**
   * Lists all current project triggers.
   * @return {Array} Array of trigger details.
   */
  function listTriggers() {
    try {
      var triggers = ScriptApp.getProjectTriggers();
      var triggerList = [];
      for (var i = 0; i < triggers.length; i++) {
        triggerList.push({
          handler: triggers[i].getHandlerFunction(),
          type: triggers[i].getTriggerType().toString(),
          source: triggers[i].getTriggerSource().toString()
        });
      }
      return triggerList;
    } catch (error) {
      Logger.log('Error listing triggers: ' + error.message);
      return [];
    }
  }

  return {
    installTrigger: installTrigger,
    removeTrigger: removeTrigger,
    listTriggers: listTriggers
  };

})();
