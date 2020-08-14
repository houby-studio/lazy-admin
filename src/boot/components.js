// import components
import WindowTitlebar from 'components/WindowTitlebar.vue'
import SettingsItems from 'components/SettingsItems.vue'
import VersionList from 'components/VersionList.vue'
import HistoryDrawer from 'components/HistoryDrawer.vue'
import HelpDialog from 'components/HelpDialog.vue'
import ProgressDialog from 'components/ProgressDialog.vue'
import ResultsDialog from 'components/ResultsDialog.vue'

// add components to Vue
export default async ({ Vue }) => {
  Vue.component('WindowTitlebar', WindowTitlebar)
  Vue.component('SettingsItems', SettingsItems)
  Vue.component('VersionList', VersionList)
  Vue.component('HistoryDrawer', HistoryDrawer)
  Vue.component('HelpDialog', HelpDialog)
  Vue.component('ProgressDialog', ProgressDialog)
  Vue.component('ResultsDialog', ResultsDialog)
}
