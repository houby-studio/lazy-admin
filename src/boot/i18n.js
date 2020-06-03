import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from 'src/i18n'

Vue.use(VueI18n)

const i18n = new VueI18n({
  language: 'cs-cz',
  fallbackLocale: 'en-us',
  messages
})

export default ({ app, store }) => {
  // Set i18n instance on app
  app.i18n = i18n
  // Read saved value from vuex store and load it
  app.i18n.locale = store.getters['lazystore/getLanguage']
}

export { i18n }
