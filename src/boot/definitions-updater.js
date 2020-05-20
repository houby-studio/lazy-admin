// Definitions updater
import axios from 'axios'
import regedit from 'regedit'
import EventEmitter from 'events'

const definitionsEmitter = new EventEmitter()

const defUpdater = {
  on: function (event, handler) {
    // Allow registering of custom event listeners with custom handlers mimicking electron-updater
    definitionsEmitter.on(event, handler)
  },
  getUpdateUrl (done) {
    // Attempt to retrieve registry value containing script definitions url
    regedit.list('HKLM\\SOFTWARE\\LazyAdmin', function (err, result) {
      if (err) {
        return done(Error('Scripts definition update failed. Could not locate LazyAdmin registry hive.'))
      }
      try {
        let defUrl = result['HKLM\\SOFTWARE\\LazyAdmin'].values['ScriptsDefinitionUrl'].value
        if (defUrl) {
          return done(null, defUrl)
        } else {
          return done(Error('Scripts definition update failed. ScriptsDefinitionUrl registry key has no value.'))
        }
      } catch {
        return done(Error('Scripts definition update failed. Could not read ScriptsDefinitionUrl registry key value.'))
      }
    })
  },
  downloadDefinitionsFile (updateUrl, done) {
    axios.get(updateUrl).then(result => {
      return done(null, result)
    }).catch(e => {
      return done(Error('Scripts definition update failed. Could not download definitions file from provided url.'))
    })
  },
  checkForUpdatesAndNotify (ctx) {
    console.log('checkForUpdatesAndNotify called')
    // Main function which gets called from Vue file
    defUpdater.getUpdateUrl(function (err, updateUrl) {
      console.log('getUpdateUrl called')
      console.log(err)
      console.log(updateUrl)
      if (err) {
        return err
      }
      defUpdater.downloadDefinitionsFile(updateUrl, function (err, scriptDefinitions) {
        console.log('downloadDefinitionsFile called')
        if (err) {
          return err
        }
        definitionsEmitter.emit('update-found', scriptDefinitions)
      })
    })
  }
}

// Register Definitions Updater as prototype, to access it anywhere
// This allows for easy calling via this.$defUpdater anywhere in Vue App
export default async ({ Vue }) => {
  Vue.prototype.$defUpdater = defUpdater
}
