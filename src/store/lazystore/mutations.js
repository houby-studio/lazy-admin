export const setWindowsColor = (state, value) => {
  state.userName = value
}

export const updateLanguage = (state, value) => {
  state.language = value
}

export const updateUserName = (state, value) => {
  state.userName = value
}

export const updateSearch = (state, value) => {
  state.search = value
}

export const updateScriptsFilter = (state, value) => {
  state.scriptsFilter = value
}

// Iterate through 'definitions' keys, add script definitions from objects included in filter. This array is displayed in data table on Scripts page.
export const updateScriptsArray = (state, value) => {
  state.scriptsArray = []
  Object.keys(state.definitions)
    .filter(key => state.scriptsFilter.includes(key))
    .forEach(key => {
      state.scriptsArray.push(...state.definitions[key].definition)
    })
}

// When new master definition file is found, clear array and fill with new definitions downloaded from URLs.
export const clearDefinitions = (state) => {
  state.definitions = []
}

// When new definition file is found, update said definition key.
export const updateDefinitions = (state, value) => {
  let keyName = Object.keys(value)[0]
  state.definitions[keyName] = value[keyName]
}

// Iterate through 'definitions' keys and create menu entries for sidebar.
export const updateDefinitionsMenu = (state, value) => {
  state.definitionsMenu = []
  Object.keys(state.definitions)
    .forEach(key => {
      state.definitionsMenu.push({
        name: key,
        displayName: state.definitions[key].displayName,
        description: state.definitions[key].description,
        version: state.definitions[key].version,
        icon: state.definitions[key].icon ? state.definitions[key].icon : 'mdi-powershell'
      })
    })
  state.definitionsMenu.sort()
}

export const updateMasterDefinition = (state, value) => {
  state.masterDefinition = value
}

export const toggleUpdateInProgress = (state, value) => {
  state.updateInProgress = value
}

export const toggleDefinitionsUpdateInProgress = (state, value) => {
  state.definitionsUpdateInProgress = value
}

export const toggleRestartRequired = (state, value) => {
  state.restartRequired = value
}

export const updateUpdateProgress = (state, value) => {
  state.updateProgress = value
}
