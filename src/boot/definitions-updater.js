// Definitions updater
// Details regarding script definitions updating can be found on 
import axios from 'axios'
import regedit from 'regedit'
import EventEmitter from 'events'

const definitionsEmitter = new EventEmitter()

const defUpdater = {
  on: function (event, handler) {
    // Allow registering of custom event listeners with custom handlers mimicking electron-updater
    definitionsEmitter.on(event, handler)
  },
  getRegUrl (done) {
    // Attempt to retrieve registry value containing script definitions url
    regedit.list('HKLM\\SOFTWARE\\LazyAdmin', function (err, result) {
      if (err) {
        return done(Error('Scripts definition update failed. Could not locate LazyAdmin registry hive.'))
      }
      try {
        let defUrl = result['HKLM\\SOFTWARE\\LazyAdmin'].values['MasterDefinitionUrl'].value
        if (defUrl) {
          return done(null, defUrl)
        } else {
          return done(Error('Scripts definition update failed. MasterDefinitionUrl registry key has no value.'))
        }
      } catch {
        return done(Error('Scripts definition update failed. Could not read MasterDefinitionUrl registry key value.'))
      }
    })
  },
  downloadDefinitions (updateUrl, done) {
    // Resolve URL and attempt to obtain definitions file
    axios.get(updateUrl).then(result => {
      return done(null, result)
    }).catch(e => {
      e.url = updateUrl
      return done(e)
    })
  },
  checkForUpdates (ctx) {
    // Notify error when something fails during update check
    function notifyError (context) {
      context.$q.notify({
        type: 'negative',
        icon: 'error',
        timeout: 5000,
        message: context.$t('definitionsError'),
        actions: [
          { label: context.$t('dismiss'), color: 'white' }
        ]
      })
    }
    // Main function which gets called from Vue file
    defUpdater.getRegUrl(function (err, updateUrl) {
      if (err) {
        notifyError(ctx)
        console.error(err)
        return err
      }
      defUpdater.downloadDefinitions(updateUrl, function (err, scriptDefinitions) {
        if (err) {
          notifyError(ctx)
          console.error(`${err} - ${err.url}`)
          return err
        }
        // If newer version is found, replace data in store and notify
        if (ctx.$store.state.lazystore.definitionsVersionInfo.version !== scriptDefinitions.data.version) {
          ctx.$store.commit('lazystore/updateDefinitionsVersionInfo', scriptDefinitions.data)
          definitionsEmitter.emit('update-check-done', true, scriptDefinitions)
        } else {
          definitionsEmitter.emit('update-check-done', false)
        }
      })
    })
  },
  updateDefinitionsAndModules (ctx) {
    let definitionsUrl = ctx.$store.state.lazystore.definitionsVersionInfo.definitionsUrl
    let moduleDefinition = ctx.$store.state.lazystore.definitions
    for (let module of moduleDefinition) {
      if (module.version !== definitionsUrl[])
    }
  }
}

// Register Definitions Updater as prototype, to access it anywhere
// This allows for easy calling via this.$defUpdater anywhere in Vue App
export default async ({ Vue }) => {
  Vue.prototype.$defUpdater = defUpdater
}
