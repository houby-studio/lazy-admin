// PowerShell Module
import Shell from 'node-powershell'

// Register Main PowerShell Instance as prototype
// This allows for easy calling via this.$pwsh anywhere in Vue App
export default async ({ Vue }) => {
  let pwsh = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true
  })

  Vue.prototype.$pwsh = pwsh
}
