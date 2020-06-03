export const SET_LANGUAGE = (state, value) => {
  state.language = value
}

export const SET_SEARCH = (state, value) => {
  state.search = value
}

export const SET_SCRIPTSFILTER = (state, value) => {
  state.scripts_filter = value
}

export const SET_MASTERDEFINITION = (state, value) => {
  state.master_definition = value
}

export const REMOVE_MASTERDEFINITION = (state) => {
  state.master_definition = {}
}

export const SET_DEFINITIONS = (state, value) => {
  // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
  state.definitions = Object.assign({}, state.definitions, value)
}

export const REMOVE_DEFINITIONS = (state) => {
  state.definitions = {}
}

export const SET_UPDATEDATE = (state, value) => {
  state.update_date = value
}

export const SET_UPDATEINPROGRESS = (state, value) => {
  state.update_in_progress = value
}

export const SET_DEFINITIONSUPDATEINPROGRESS = (state, value) => {
  state.definitions_update_in_progress = value
}

export const SET_RESTARTREQUIRED = (state, value) => {
  state.restart_required = value
}

export const SET_UPDATEPROGRESS = (state, value) => {
  state.update_progress = value
}
