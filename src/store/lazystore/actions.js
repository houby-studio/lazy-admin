// Commit mutation to set applications language - Accessed in LoginPage.vue
export async function setLanguage ({ commit }, language) {
  console.log(`Changing display language to: ${language}`)
  commit('SET_LANGUAGE', language)
}

// Commit mutation to update search field - Accessed in FullLayout.vue
export async function setSearch ({ commit }, searchText) {
  commit('SET_SEARCH', searchText)
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
