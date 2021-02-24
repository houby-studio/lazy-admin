// Electron-updater
const autoUpdater = require('@electron/remote').require('electron-updater').autoUpdater

// Register Auto Updater as prototype, to access it anywhere
// This allows for easy calling via this.$autoUpdater anywhere in Vue App
export default async ({ Vue }) => {
  Vue.prototype.$autoUpdater = autoUpdater
}
