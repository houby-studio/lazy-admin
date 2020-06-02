export default function () {
  return {
    language: 'en-us', // Handles application language - Changeable on logon screen
    search: '', // Holds search string value
    scripts_filter: [], // Holds current filter for scripts table
    // scriptsArray: [], // Array holding currently displayed scripts - MOVE TO GETTER
    master_definition: {}, // Contains scripts definitions data, holding url to all modules
    definitions: {}, // Object holding script definitions in their respective module objects
    // definitionsMenu: [], // Key component containing script definitions in their respective module objects - MOVE TO GETTER
    custom_definitions: [], // Contains user defined script definitions
    favorite_definitions: [], // Definitions favorited by user
    update_date: '', // Date of last update, do not automatically update more than once a day
    update_in_progress: false, // Is application update in progress?
    definitionsUpdateInProgress: false, // Are definitions update in progress?
    restartRequired: false, // Is application restart required? (To install updates)
    update_progress: '' // Update Progress message
  }
}
