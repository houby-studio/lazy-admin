import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

import lazystore from './lazystore'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

const Store = new Vuex.Store({
  modules: {
    lazystore
  },
  plugins: [vuexLocal.plugin],
  // enable strict mode (adds overhead!)
  // for dev mode only
  strict: process.env.DEV
})

if (module.hot) {
  // accept actions and mutations as hot modules
  module.hot.accept(['./lazystore'], () => {
    // require the updated modules
    // have to add .default here due to babel 6 module output
    const lazystore = require('./lazystore').default
    // swap in the new modules and mutations
    Store.hotUpdate({
      modules: {
        lazystore
      }
    })
  })
}

export default Store
