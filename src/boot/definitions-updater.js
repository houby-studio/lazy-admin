// Definition updater
import axios from 'axios'
import regedit from 'regedit'

const defUpdater = {
  checkForUpdates: function (ctx, done) {
    regedit.list('HKLM\\SOFTWARE\\LazyAdmin', function (err, result) {
      if (err) {
        return done(Error('Scripts definition update failed. Could not locate LazyAdmin registry hive.'), ctx)
      }
      let defUrl
      try {
        defUrl = result['HKLM\\SOFTWARE\\LazyAdmin'].values['ScriptsDefinitionUrl'].value
      } catch {
        return done(Error('Scripts definition update failed. Could not read ScriptsDefinitionUrl registry key value.'), ctx)
      }
      if (defUrl) {
        axios.get(defUrl).then(result => {
          return done(null, ctx, result)
        }).catch(e => {
          return done(Error('Scripts definition update failed. Could not download definitions file from provided url.'), ctx)
        })
      } else {
        return done(Error('Scripts definition update failed. ScriptsDefinitionUrl registry key has no value.'), ctx)
      }
    })
  }
}

// Register Definitions Updater as prototype, to access it anywhere
// This allows for easy calling via this.$defUpdater anywhere in Vue App
export default async ({ Vue }) => {
  Vue.prototype.$defUpdater = defUpdater
}
