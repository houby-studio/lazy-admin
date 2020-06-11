// PowerShell Module
import Shell from 'node-powershell'
import NewPSSessionWithCredentials from '../statics/pwsh/scripts/New-PSSessionWithCredentials'

function CustomShell () {
  // Private variable holding scriptblock to create Credential object and PSSession
  let _credentialString = ''

  // Public setter for _credentialString allowing app to set value from outside
  this.setCredentialString = function (string) {
    _credentialString = string
    return this
  }

  // PowerShell process object
  this.shell = {}

  // Function which creates new PowerShell object and stores it to this.shell
  this.createShell = function (done) {
    // Try to start pwsh shell, fallback to Windows PowerShell
    let newShell
    try {
      newShell = new Shell({
        executionPolicy: 'Bypass',
        noProfile: true,
        nonInteractive: true,
        pwsh: true
      })
    } catch {
      newShell = new Shell({
        executionPolicy: 'Bypass',
        noProfile: true,
        nonInteractive: true
      })
      // Set fallback to true, so main process knows pwsh failed
      newShell.fallback = true
    }
    // Set new PowerShell to pwsh object
    this.shell = newShell
    return done('Created shell.')
  }

  // When restarting powershell process, loads New-PSSessionWithCredentials to new PS session
  this.loadCredFunction = function (done) {
    this.shell.addCommand(NewPSSessionWithCredentials)
    return done('Loaded New-PSSessionWithCredentials to PowerShell terminal')
  }

  // When restarting powershell process, loads command to create Credential object and PSSession
  this.loadCredString = function (done) {
    this.shell.addCommand(_credentialString)
    return done('Loaded Credentials string to PowerShell terminal')
  }
}

// Register CustomShell as prototype and create new PowerShell proccess
// This allows for easy calling via this.$pwsh anywhere in Vue App
export default async ({ Vue }) => {
  let pwsh = new CustomShell()
  pwsh.createShell(() => {
    console.debug('Created Shell')
  })
  Vue.prototype.$pwsh = pwsh
}
