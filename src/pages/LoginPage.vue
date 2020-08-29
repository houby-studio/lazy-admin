<template>
  <q-page class="row justify-center items-center">
    <div class="column">
      <q-card
        square
        bordered
        class="q-pa-lg shadow-1"
      >
        <q-form
          @submit="showSkipLogin ? skipLogin() : login()"
          ref="loginform"
          class="q-gutter-md"
        >
          <q-card-section>

            <q-input
              v-model="username"
              :disable="credentialsSaved"
              :label="$t('username')"
              :class="shake"
              :rules="showSkipLogin ? [ val => val.length >= 0 ] : [ val => val && val.length > 0 || $t('usernameRequired') ]"
              type="text"
              ref="username"
              square
              filled
              lazy-rules
              no-error-icon
            >
              <template v-slot:append>
                <q-icon name="person" />
              </template>
            </q-input>
            <transition
              enter-active-class="animated zoomIn"
              leave-active-class="animated zoomOut"
              mode="out-in"
            >
              <div
                v-if="credentialsSaved"
                style="q-gutter-md"
              >
                <q-btn
                  :label="$t('changeUser')"
                  @click="credentialsSaved = false"
                  unelevated
                  color="light"
                  size="lg"
                  class="full-width"
                />
              </div>

              <q-input
                v-else
                v-model="password"
                :type="isPwd ? 'password' : 'text'"
                :label="$t('password')"
                :rules="showSkipLogin ? [ val => val.length >= 0 ] : [ val => val && val.length > 0 || $t('passwordRequired') ]"
                square
                filled
                lazy-rules
                no-error-icon
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    @click="isPwd = !isPwd"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>
            </transition>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn-dropdown
              v-model="showSkipLogin"
              :label="showSkipLogin ? $t('loginSkip') : $t('login')"
              :disable="loginButtonDisabled"
              @input="resetValidation"
              dropdown-icon="mdi-skip-next"
              color="primary"
              size="lg"
              class="full-width"
              type="submit"
              ref="login"
              unelevated
              persistent
              split
            />
          </q-card-actions>
        </q-form>
      </q-card>
      <language-picker />
    </div>
  </q-page>
</template>

<script>
import { openURL, throttle } from 'quasar'
import { mapGetters } from 'vuex'
import GetSavedCredentials from '../statics/pwsh/scripts/Get-SavedCredentials'
import NewPSSessionWithCredentials from '../statics/pwsh/scripts/New-PSSessionWithCredentials'

export default {
  name: 'LoginPage',
  data () {
    return {
      username: '',
      password: '',
      loginButtonDisabled: false,
      showSkipLogin: false,
      shakeUsername: false,
      isPwd: true
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getLoginSkipped', 'getCredentialsSaved']),
    shake: {
      get () {
        // Add classes to trigger animations on username field when username is found in credential store
        return this.shakeUsername ? 'animated pulse delay-fix' : ''
      }
    },
    loginSkipped: {
      get () {
        return this.getLoginSkipped
      },
      set (val) {
        this.$store.dispatch('lazystore/setLoginSkipped', val)
      }
    },
    credentialsSaved: {
      get () {
        return this.getCredentialsSaved
      },
      set (val) {
        this.$store.dispatch('lazystore/setCredentialsSaved', val)
      }
    }
  },
  methods: {
    resetForm (credentialsProvided) {
      this.loginButtonDisabled = false
      this.credentialsSaved = false
      this.username = ''
      this.password = ''
      this.$refs.loginform.resetValidation()
      this.$refs.username.focus()
      this.$q.notify({
        timeout: 5000,
        multiLine: false,
        type: 'negative',
        icon: 'error',
        message: credentialsProvided ? this.$t('wrongUsernameOrPassword') : this.$t('failedToLogin'),
        actions: [
          { label: this.$t('dismiss'), color: 'white' }
        ]
      })
    },
    resetValidation () {
      this.$refs.loginform.resetValidation()
    },
    skipLogin () {
      this.loginButtonDisabled = true
      this.loginSkipped = true
      console.log('Skipping login, certain commands may be unavailable.')
      this.$pwsh.shell.addCommand(`$Global:CredentialObject = [System.Management.Automation.PSCredential]::Empty`)
      this.$pwsh.shell.invoke().then(output => {
        this.$router.push({ path: '/scripts' })
      }).catch(e => {
        console.error(`Failed to create empty Credential Object. Error message: ${e}`)
        this.resetForm(false)
      })
    },
    login () {
      this.loginButtonDisabled = true // Disable button during login attempt
      this.loginSkipped = false
      // Invoke function with either credential object or username and password
      if (this.credentialsSaved) {
        console.log(`Creating new PowerShell session with saved credentials for user "${this.username}".`)
        this.$pwsh.shell.addCommand(`New-PSSessionWithCredentials -Credential`)
      } else {
        console.log(`Creating new PowerShell session with supplied credentials for user "${this.username}".`)
        this.$pwsh.shell.addCommand(`New-PSSessionWithCredentials -Username "${this.username}" -Password "${this.password}"`)
      }
      this.$pwsh.shell.invoke().then(output => {
        let data
        try {
          data = JSON.parse(output)
        } catch (error) {
          data = { error: true }
        }
        if (data.error) {
          console.error(`Failed to create new PowerShell session with supplied credentials. Error message: ${output}`)
          this.resetForm(true)
        } else {
          console.log(data.output) // Should write 'New Powershell session created succesfully.' from PS Function output
          // Route to main screen
          if (!this.credentialsSaved) {
            this.$pwsh.shell.addCommand(`if (Get-Command New-StoredCredential -ErrorAction SilentlyContinue) {New-StoredCredential -Target 'Lazy Admin' -UserName '${this.username}' -Password '${this.password}' -Comment 'Administrator credentials for Lazy Admin Utility.' -Type Generic -Persist LocalMachine | Out-Null} else {"failed"}`)
            this.$pwsh.shell.invoke().then(o => {
              if (!o.startsWith('failed')) {
                console.log('Succesfully saved credentials to Credential Manager.')
                this.credentialsSaved = true
              }
            }).catch(e => {
              console.error(`Failed to save credentials to Credential Manager. Error message: ${e}`)
            })
          }
          // Succesfully created session, push login and session commands to private pwsh variable
          if (this.credentialsSaved) {
            this.$pwsh.setCredentialString('New-PSSessionWithCredentials -Credential')
          } else {
            this.$pwsh.setCredentialString(`New-PSSessionWithCredentials -Username "${this.username}" -Password "${this.password}"`)
          }
          this.$router.push({ path: '/scripts' })
        }
      }).catch(e => {
        console.error(`Failed to create new PowerShell session with supplied credentials. Error message: ${e}`)
        this.resetForm(false)
      })
    },
    pwshFallbackNotify () {
      if (this.$pwsh.fallback) {
        this.$q.notify({
          timeout: 8000,
          multiLine: false,
          type: 'warning',
          icon: 'warning',
          message: this.$t('pwshMissing'),
          actions: [
            { label: this.$t('install'), color: 'black', handler: () => { openURL('https://github.com/PowerShell/powershell/releases/latest') } },
            { label: this.$t('dismiss'), color: 'black' }
          ]
        })
      }
    }
  },
  created: function () {
    this.$q.loading.show()
    // Insert throttle to button functions
    this.login = throttle(this.login, 800)
    this.skipLogin = throttle(this.skipLogin, 800)
    console.log(`Application started by user ${this.$q.electron.remote.process.env.USERDOMAIN}\\${this.$q.electron.remote.process.env.USERNAME} on computer ${this.$q.electron.remote.process.env.COMPUTERNAME}`)
    // Delete logged in services
    this.$store.dispatch('lazystore/clearLoggedinServices')
    // Try to load saved credentials from Credential Manager
    this.$pwsh.shell.addCommand(GetSavedCredentials)
    setTimeout(() => {
      this.$pwsh.shell.invoke().then(output => {
        // Load Enter-PSSessionWithCredentials function to be used when user presses login button
        this.$pwsh.shell.addCommand(NewPSSessionWithCredentials)
        this.$pwsh.shell.invoke()
        // Attempt to parse output from Get-SavedCredentials as JSON
        let jsonOutput
        try {
          jsonOutput = JSON.parse(output)
        } catch (error) {
          jsonOutput = { error: true }
        }
        // If module did not load, warn user that he might be missing module
        if (jsonOutput.error) {
          this.credentialsSaved = false
          console.warn('Could not load "CredentialManager" module. It may be missing in the computer.')
          this.$q.notify({
            timeout: 5000,
            multiLine: false,
            type: 'warning',
            icon: 'warning',
            message: this.$t('moduleCredMgrMissing'),
            actions: [
              { label: this.$t('install'), color: 'black', handler: () => { openURL('https://github.com/houby-studio/lazy-admin/wiki/How-to-install-CredentialManager-module') } },
              { label: this.$t('dismiss'), color: 'black' }
            ]
          })
        } else {
          if (jsonOutput.returnCode === 10011001) {
            console.log(`Found saved credentials for user ${jsonOutput.output.UserName}.`)
            this.credentialsSaved = true
            this.shakeUsername = true
            this.username = jsonOutput.output.UserName
            this.$q.notify({
              timeout: 2000,
              icon: 'info',
              multiLine: false,
              message: this.$t('foundsavedCredential', { usr: jsonOutput.output.UserName }),
              actions: [
                { label: this.$t('dismiss'), color: 'primary' }
              ]
            })
            this.$refs.login.$el.focus()
          } else {
            console.log(`Could not find any saved credentials.`)
            this.credentialsSaved = false
          }
        }
        this.pwshFallbackNotify()
        this.$q.loading.hide()
      }).catch(error => {
        console.error('Failed to load credentials with error')
        console.log(error)
        this.pwshFallbackNotify()
        this.$q.loading.hide()
      })
    }, 500)
  }
}
</script>

<style>
.delay-fix {
  /* If we want to make animation longer, add class to  enter/leave-active-class */
  animation-duration: 1s !important;
}
</style>
