<template>
  <q-page class="row justify-center items-center">
    <div class="column">
      <q-card
        square
        bordered
        class="q-pa-lg shadow-1"
      >
        <q-form
          @submit="login"
          ref="loginform"
          class="q-gutter-md"
        >
          <q-card-section>

            <q-input
              square
              filled
              v-model="username"
              type="text"
              ref="username"
              :disable="credentialsSaved"
              :label="$t('username')"
              :class="shake"
              lazy-rules
              no-error-icon
              :rules="[ val => val && val.length > 0 || $t('usernameRequired') ]"
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
                style="q-gutter-md"
                v-if="credentialsSaved"
              >
                <q-btn
                  unelevated
                  color="light"
                  size="lg"
                  class="full-width"
                  :label="$t('changeUser')"
                  @click="credentialsSaved = false"
                />
              </div>

              <q-input
                square
                filled
                v-model="password"
                v-else
                :type="isPwd ? 'password' : 'text'"
                :label="$t('password')"
                lazy-rules
                no-error-icon
                :rules="[ val => val && val.length > 0 || $t('passwordRequired') ]"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
            </transition>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn
              autofocus
              unelevated
              color="primary"
              size="lg"
              class="full-width"
              type="submit"
              ref="login"
              :label="$t('login')"
              :disable="loginButtonDisabled"
            />
          </q-card-actions>
        </q-form>
      </q-card>
      <q-select
        v-model="language"
        :options="langOptions"
        :label="$t('language')"
        borderless
        emit-value
        map-options
        style="min-width: 150px"
      />
    </div>
  </q-page>
</template>

<script>
import { openURL, throttle } from 'quasar'
import GetSavedCredentials from '../statics/pwsh/scripts/Get-SavedCredentials'
import EnterPSSessionWithCredentials from '../statics/pwsh/scripts/Enter-PSSessionWithCredentials'

export default {
  name: 'LoginPage',
  data () {
    return {
      username: '',
      password: '',
      loginButtonDisabled: false,
      shakeUsername: false,
      credentialsSaved: false,
      isPwd: true,
      langOptions: [
        { value: 'en-us', label: 'English' },
        { value: 'cs-cz', label: 'Česky' }
      ]
    }
  },
  methods: {
    login () {
      this.loginButtonDisabled = true // Disable button during login attempt
      // Invoke function with either credential object or username and password
      if (this.credentialsSaved) {
        console.log(`Creating new PowerShell session with saved credentials for user "${this.username}".`)
        this.$pwsh.addCommand(`Enter-PSSessionWithCredentials -Credential`)
      } else {
        console.log(`Creating new PowerShell session with supplied credentials for user "${this.username}".`)
        this.$pwsh.addCommand(`Enter-PSSessionWithCredentials -Username "${this.username}" -Password "${this.password}"`)
      }
      this.$pwsh.invoke().then(output => {
        // console.log(output)
        let data
        try {
          data = JSON.parse(output)
        } catch (error) {
          data = { error: true }
        }
        if (data.error) {
          console.error(`Failed to create new PowerShell session with supplied credentials. Error message: ${output}`)
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
            message: this.$t('wrongUsernameOrPassword'),
            actions: [
              { label: this.$t('dismiss'), color: 'white' }
            ]
          })
        } else {
          console.log(data.output) // Should write 'New Powershell session created succesfully.' from PS Function output
          // Session created, add Session to variable so we can access it anytime
          this.$pwsh.addCommand(`$LazyAdminSession = (Get-PSSession -Name 'LazyAdminSession')[0]`)
          this.$pwsh.invoke().then(output => {
            // Route to main screen
            if (!this.credentialsSaved) {
              this.$pwsh.addCommand(`if (Get-Command New-StoredCredential -ErrorAction SilentlyContinue) {New-StoredCredential -Target 'Lazy Admin' -UserName '${this.username}' -Password '${this.password}' -Comment 'Administrator credentials for Lazy Admin Utility.' -Type Generic -Persist LocalMachine | Out-Null}`)
              this.$pwsh.invoke()
            }
            this.$router.push({ path: '/scripts' })
          })
        }
      })
    }
  },
  computed: {
    shake: {
      get () {
        // Add classes to trigger animations on username field when username is found in credential store
        return this.shakeUsername ? 'animated pulse delay-fix' : ''
      }
    },
    language: {
      get () {
        // retrieve language preference from store
        return this.$store.state.lazystore.language
      },
      set (val) {
        // set selected language to store
        this.$store.commit('lazystore/updateLanguage', val)
      }
    }
  },
  watch: {
    language (language) {
      console.log(`Language changed to ${language}.`)
      // When language is changed in store, update locale
      this.$i18n.locale = language
    }
  },
  created: function () {
    this.$q.loading.show()
    // Insert throttle to button functions
    this.login = throttle(this.login, 800)
    console.log(`Application started by user ${this.$q.electron.remote.process.env.USERDOMAIN}\\${this.$q.electron.remote.process.env.USERNAME} on computer ${this.$q.electron.remote.process.env.COMPUTERNAME}`)
    // Try to load saved credentials from Credential Manager
    this.$pwsh.addCommand(GetSavedCredentials)
    this.$pwsh.invoke().then(output => {
      // Load Enter-PSSessionWithCredentials function to be used when user presses login button
      this.$pwsh.addCommand(EnterPSSessionWithCredentials)
      this.$pwsh.invoke()
      // Attempt to parse output from Get-SavedCredentials as JSON
      let jsonOutput
      try {
        jsonOutput = JSON.parse(output)
      } catch (error) {
        jsonOutput = { error: true }
      }
      // If module did not load, warn user that he might be missing module
      if (jsonOutput.error) {
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
        }
      }
      this.$q.loading.hide()
    })
  }
}
</script>

<style>
/* How to set custom transition */
/* .fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
} */
.delay-fix {
  /* If we want to make animation longer, add class to  enter/leave-active-class */
  animation-duration: 1s !important;
}
</style>
