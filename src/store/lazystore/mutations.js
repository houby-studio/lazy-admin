export const updateLanguage = (state, value) => {
  state.language = value
}

export const setWindowsColor = (state, value) => {
  state.userName = value
}

export const updateUserName = (state, value) => {
  state.userName = value
}

export const updateSearch = (state, value) => {
  state.search = value
}

export const toggleUpdateInProgress = (state, value) => {
  state.updateInProgress = value
}

export const toggleDefinitionsUpdateInProgress = (state, value) => {
  state.definitionsUpdateInProgress = value
}

export const setDefinitionsUrl = (state, value) => {
  state.definitionsUrl = value
}

export const toggleRestartRequired = (state, value) => {
  state.restartRequired = value
}

export const updateUpdateProgress = (state, value) => {
  state.updateProgress = value
}
