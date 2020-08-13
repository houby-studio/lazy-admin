// import components
import WindowTitlebar from 'components/WindowTitlebar.vue'
import SettingsItems from 'components/SettingsItems.vue'
import ModulesList from 'components/ModulesList.vue'
import VersionList from 'components/VersionList.vue'

// add components to Vue
export default async ({ Vue }) => {
  Vue.component('WindowTitlebar', WindowTitlebar)
  Vue.component('SettingsItems', SettingsItems)
  Vue.component('ModulesList', ModulesList)
  Vue.component('VersionList', VersionList)
}
