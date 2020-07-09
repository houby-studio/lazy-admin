export default function () {
  return {
    language: 'en-us', // Handles application language - Changeable on logon screen
    search: '', // Holds search string value
    scripts_filter: [], // Holds current filter for scripts table
    command_maximized: false, // Is command dialog window maximized?
    master_definition: {}, // Contains scripts definitions data, holding url to all modules
    definitions: {}, // Object holding script definitions in their respective module objects
    custom_definitions: [], // Contains user defined script definitions
    favorite_definitions: [], // Definitions favorited by user
    update_date: '', // Date of last update, do not automatically update more than once a day
    update_in_progress: false, // Is application update in progress?
    definitions_update_in_progress: false, // Are definitions update in progress?
    restart_required: false, // Is application restart required? (To install updates)
    update_progress: '' // Update Progress message
  }
}
