// Commit mutation to set applications language - Accessed in LoginPage.vue
export async function setLanguage ({ commit }, language) {
  console.log(`Changing display language to: ${language}`)
  commit('SET_LANGUAGE', language)
}

// Commit mutation to update search field - Accessed in FullLayout.vue
export async function setSearchScripts ({ commit }, searchText) {
  commit('SET_SEARCHSCRIPTS', searchText)
}

// Commit mutation to update search field - Accessed in FullLayout.vue
export async function setSearchHistory ({ commit }, searchText) {
  commit('SET_SEARCHHISTORY', searchText)
}

// Commit mutation to set scripts filter - Accessed in FullLayout.vue
export async function setScriptsFilter ({ commit }, filter) {
  console.log(`Setting scripts filter to: ${filter}`)
  commit('SET_SCRIPTSFILTER', filter)
}

// Commit mutation to set scripts filter - Accessed in FullLayout.vue
export async function setCommandMaximized ({ commit }, maximized) {
  commit('SET_COMMANDMAXIMIZED', maximized)
}

// Commit mutation to set master definition - Accessed in FullLayout.vue
export async function setMasterDefinition ({ commit }, definition) {
  console.log('Updating master definition with newer configuration:', definition)
  commit('SET_MASTERDEFINITION', definition)
}

// Commit mutation to clear master definition - Accessed in FullLayout.vue
export async function clearMasterDefinition ({ commit }) {
  console.log('Clearing Master definition.')
  commit('REMOVE_MASTERDEFINITION')
}

// Commit mutation to set scripts definitions - Accessed in FullLayout.vue, About.vue
export async function setDefinitions ({ commit }, definitions) {
  commit('SET_DEFINITIONS', definitions)
}

// Commit mutation to clear scripts definitions - Accessed in FullLayout.vue
export async function clearDefinitions ({ commit }) {
  console.log('Clearing scripts definitions.')
  commit('REMOVE_DEFINITIONS')
}

// Commit mutation to set update in progress state - Accessed in FullLayout.vue
export async function setUpdateDate ({ commit }, date) {
  commit('SET_UPDATEDATE', date)
}

// Commit mutation to set update in progress state - Accessed in FullLayout.vue
export async function setUpdateInProgress ({ commit }, updateInProgress) {
  commit('SET_UPDATEINPROGRESS', updateInProgress)
}

// Commit mutation to set definitions update in progress state - Accessed in About.vue, FullLayout.vue
export async function setDefinitionsUpdateInProgress ({ commit }, definitionsUpdateInProgress) {
  commit('SET_DEFINITIONSUPDATEINPROGRESS', definitionsUpdateInProgress)
}

// Commit mutation to set restart required state - Accessed in About.vue, FullLayout.vue
export async function setRestartRequired ({ commit }, restartRequired) {
  commit('SET_RESTARTREQUIRED', restartRequired)
}

// Commit mutation to set update progress - Accessed in About.vue, FullLayout.vue
export async function setUpdateProgress ({ commit }, updateProgress) {
  commit('SET_UPDATEPROGRESS', updateProgress)
}

// Commit mutation to set confirm preference - Accessed in SettingsPage.vue
export async function setAlwaysConfirm ({ commit }, alwaysConfirm) {
  commit('SET_ALWAYSCONFIRM', alwaysConfirm)
}

// Commit mutation to set history length - Accessed in SettingsPage.vue
export async function setHistoryLength ({ commit }, historyLength) {
  commit('SET_HISTORYLENGTH', historyLength)
}

// Commit mutation to set history dialog visibility - Accessed in FullLayout.vue
export async function setHistoryVisible ({ commit }, historyVisible) {
  commit('SET_HISTORYVISIBLE', historyVisible)
}

// Commit mutation to set history - Accessed in ScriptsPage.vue
export async function setHistory ({ commit, state }, history) {
  // const newHistory = state.history
  // newHistory.unshift(history)
  // if (newHistory.length > this.historyLength) {
  //   newHistory.length = this.historyLength
  // }
  commit('SET_HISTORY', history)
}

// Commit mutation to set dialog input density - Accessed in SettingsPage.vue
export async function setDenseInput ({ commit }, dense) {
  commit('SET_DENSEINPUT', dense)
}

// Commit mutation to set dialog input density - Accessed in SettingsPage.vue
export async function setDenseTable ({ commit }, dense) {
  commit('SET_DENSETABLE', dense)
}

// Commit mutation to set whether login was skipped or not - Accessed in LoginPage.vue
export async function setLoginSkipped ({ commit }, skipped) {
  commit('SET_LOGINSKIPPED', skipped)
}

// Commit mutation to set whether login credentials are saved or not - Accessed in LoginPage.vue
export async function setCredentialsSaved ({ commit }, saved) {
  commit('SET_CREDENTIALSSAVED', saved)
}
