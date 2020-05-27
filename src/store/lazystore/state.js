export default function () {
  return {
    language: 'en-us', // Handles application language - Changeable on logon screen
    userName: '', // Holds login username
    search: '', // Holds search string value
    scriptsFilter: [], // Holds current filter for scripts table
    scriptsArray: [], // Array holding currently displayed scripts
    definitions: [], // Array holding script definitions in their respective module objects
    definitionsMenu: [], // Key component containing script definitions in their respective module objects
    masterDefinition: {}, // Contains scripts definitions data, holding url to all modules
    customDefinitions: [], // Contains user defined script definitions
    favoriteDefinitions: [], // Definitions favorited by user
    updateInProgress: false, // Is application update in progress?
    definitionsUpdateInProgress: false, // Are definitions update in progress?
    restartRequired: false, // Is application restart required? (To install updates)
    updateProgress: '' // Update Progress message
  }
}
