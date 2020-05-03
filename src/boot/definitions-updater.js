// Definition updater

function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const defUpdater = {
  checkForUpdates: async function () {
    let returnObject = {
      version: '0.0.1'
    }
    await wait(10000)
    return returnObject
  }
}

// Register Auto Updater as prototype, to access it anywhere
// This allows for easy calling via this.$autoUpdater anywhere in Vue App
export default async ({ Vue }) => {
  Vue.prototype.$defUpdater = defUpdater
}
