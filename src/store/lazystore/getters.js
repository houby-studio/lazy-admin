export function getLanguage (state) {
  return state.language
}

export function getSearch (state) {
  return state.search
}

export function getScriptsFilter (state) {
  return state.scripts_filter
}

export function getMasterDefinition (state) {
  return state.master_definition
}

export function getDefinitions (state) {
  return state.definitions
}

export function getUpdateInProgress (state) {
  return state.update_in_progress
}

export function getUpdateProgress (state) {
  return state.update_progress
}

export function getScriptsArray (state) {
  try {
    return Object.entries(state.definitions)
      .filter(([key, value]) => state.scripts_filter.includes(key))
      .map(function ([key, value]) { return value.definition })
      .flat(1)
      .sort()
  } catch {
    // no entries
    console.log('Cannot build scripts entries.')
  }
}

export function menuEntries (state) {
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
    // no entries
    console.log('Cannot build menu entries.')
  }
}
