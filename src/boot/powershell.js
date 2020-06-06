// PowerShell Module
import Shell from 'node-powershell'

// Register Main PowerShell Instance as prototype
// This allows for easy calling via this.$pwsh anywhere in Vue App
export default async ({ Vue }) => {
  let pwsh
  // Try to start pwsh shell, fallback to Windows PowerShell
  try {
    pwsh = new Shell({
      executionPolicy: 'Bypass',
      noProfile: true,
      nonInteractive: true,
      pwsh: true
    })
  } catch {
    pwsh = new Shell({
      executionPolicy: 'Bypass',
      noProfile: true,
      nonInteractive: true
    })
    pwsh.fallback = true
  }
  Vue.prototype.$pwsh = pwsh
}
