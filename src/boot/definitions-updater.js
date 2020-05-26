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
        if (ctx.$store.state.lazystore.masterDefinition.version !== scriptDefinitions.data.version) {
          ctx.$store.commit('lazystore/updateMasterDefinition', scriptDefinitions.data)
          definitionsEmitter.emit('update-check-done', true)
        } else {
          definitionsEmitter.emit('update-check-done', false)
        }
      })
    })
  },
  updateDefinitionsAndModules (ctx, newMasterVersion) {
    let definitionsUrl = ctx.$store.state.lazystore.masterDefinition.definitionsUrl
    let storedDefinitions = ctx.$store.state.lazystore.definitions
    if (newMasterVersion) {
      // Remove all current definitions, because there is new master definition file with different URLs
      ctx.$store.commit('lazystore/clearDefinitions')
    }
    // cycle thru update URLs and compare versions and eventually update
    for (let url of definitionsUrl) {
      defUpdater.downloadDefinitions(url, function (error, definition) {
        if (error) {
          console.error('Downloading definitions error')
          console.error(error)
        } else {
          let data
          try {
            // Check if downloaded file is JSON, if not, try to parse as JSON
            if (definition.data.constructor !== ({}).constructor) {
              data = JSON.parse(definition.data)
            } else {
              data = definition.data
            }
          } catch (error) {
            console.error('Could not parse data as JSON')
            console.error(error)
            return
          }
          let definitionName = Object.keys(data)[0]
          if (storedDefinitions[definitionName]) {
            // Compare downloaded version and currently saved version, if not matching, update
            if (data.version !== storedDefinitions[definitionName].version) {
              console.log(`Newer version of ${definitionName} found, uploading to store.`)
              ctx.$store.commit('lazystore/updateDefinitions', data)
            }
          } else {
            // Definition does not exist in store, create it
            ctx.$store.commit('lazystore/updateDefinitions', data)
          }
        }
      })
    }
  }
}

// Register Definitions Updater as prototype, to access it anywhere
// This allows for easy calling via this.$defUpdater anywhere in Vue App
export default async ({ Vue }) => {
  Vue.prototype.$defUpdater = defUpdater
}
