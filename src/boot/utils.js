// Definitions updater
// Details regarding script definitions updating can be found on
import axios from 'axios'
import fs from 'fs'
import regedit from 'regedit'
regedit.setExternalVBSLocation('resources/regedit/vbs')
import EventEmitter from 'events'

const definitionsEmitter = new EventEmitter()

const utils = {
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
    if (fs.existsSync(updateUrl)) {
      fs.readFile(updateUrl, { encoding: 'utf-8' }, function (e, data) {
        if (e) {
          return done(e)
        } else {
          try {
            let json = {
              data: JSON.parse(data)
            }
            return done(null, json)
          } catch {
            return done(Error('Could not parse JSON.'))
          }
        }
      })
    } else {
      // Resolve URL and attempt to obtain definitions file
      axios.get(`${updateUrl}?date=${new Date().getTime()}`).then(result => {
        return done(null, result)
      }).catch(e => {
        e.url = updateUrl
        return done(e)
      })
    }
  }
}

// Register Definitions Updater as prototype, to access it anywhere
// This allows for easy calling via this.$utils anywhere in Vue App
export default async ({ Vue }) => {
  Vue.prototype.$utils = utils
}
