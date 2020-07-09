export function getLanguage (state) {
  return state.language
}

export function getSearch (state) {
  return state.search
}

export function getScriptsFilter (state) {
  return state.scripts_filter
}

export function getCommandMaximized (state) {
  return state.command_maximized
}

export function getMasterDefinition (state) {
  return state.master_definition
}

export function getDefinitions (state) {
  return state.definitions
}

export function getUpdateDate (state) {
  return state.update_date
}

export function getUpdateInProgress (state) {
  return state.update_in_progress
}

export function getDefinitionsUpdateInProgress (state) {
  return state.definitions_update_in_progress
}

export function getRestartRequired (state) {
  return state.restart_required
}

export function getUpdateProgress (state) {
  return state.update_progress
}

// Dynamically build array of scripts to display in ScriptsPage.vue page
export function getScriptsArray (state) {
  try {
    return Object.entries(state.definitions)
      .filter(([key, value]) => state.scripts_filter.includes(key))
      .map(function ([key, value]) { return value.definition })
      .flat(1)
      .sort()
  } catch {
    console.error('Cannot build scripts entries.')
  }
}

// Dynamically menu entries array of modules to display in FullLayout.vue and AboutPage.vue
export function getMenuEntries (state) {
  try {
    return Object.entries(state.definitions)
      .map(function ([key, value]) {
        return {
          name: key,
          displayName: value.displayName ? value.displayName[state.language] || value.displayName['default'] : '',
          description: value.description ? value.description[state.language] || value.description['default'] : '',
          version: value.version,
          icon: value.icon ? value.icon : 'mdi-powershell'
        }
      })
  } catch {
    console.error('Cannot build menu entries.')
  }
}
