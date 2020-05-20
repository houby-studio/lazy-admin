export default function () {
  return {
    language: 'en-us', // Handles application language - Changeable on logon screen
    userName: '', // Holds login username
    search: '', // Holds search string value
    definitions: {}, // Key component containing script definitions
    customDefinitions: {}, // Contains user defined script definitions
    favoriteDefinitions: {}, // Definitions favorited by user
    updateInProgress: false, // Is application update in progress?
    definitionsUpdateInProgress: false, // Are definitions update in progress?
    restartRequired: false, // Is application restart required? (To install updates)
    updateProgress: '' // Update Progress message
  }
}
