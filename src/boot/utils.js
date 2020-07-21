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
  emit: function (event, args) {
    // Allow registering of custom event listeners with custom handlers mimicking electron-updater
    definitionsEmitter.emit(event, args)
  },
  getDate: function () {
    let d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear()

    if (month.length < 2) { month = '0' + month }
    if (day.length < 2) { day = '0' + day }

    return [year, month, day].join('-')
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
  downloadDefinitions (downloadUrl, done) {
    if (fs.existsSync(downloadUrl)) {
      fs.readFile(downloadUrl, { encoding: 'utf-8' }, function (e, data) {
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
      axios.get(`${downloadUrl}?date=${new Date().getTime()}`).then(result => {
        return done(null, result)
      }).catch(e => {
        e.url = downloadUrl
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
