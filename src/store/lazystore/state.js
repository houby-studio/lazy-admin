const { systemPreferences } = require('electron').remote
let customWindowColor = systemPreferences.getAccentColor()

export default function () {
  return {
    customWindowColor: customWindowColor,
    userName: 'Karel'
  }
}
