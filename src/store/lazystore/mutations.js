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

export const updateScriptsArray = (state, value) => {
  state.scriptsArray = []
  Object.keys(state.definitions)
    .filter(key => state.scriptsFilter.includes(key))
    .forEach(key => {
      state.scriptsArray.push(...state.definitions[key].definition)
    })
}

export const clearDefinitions = (state) => {
  state.definitions = []
}

export const updateDefinitions = (state, value) => {
  let keyName = Object.keys(value)[0]
  state.definitions[keyName] = value[keyName]
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
