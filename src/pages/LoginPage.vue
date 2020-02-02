<template>
  <q-page class="row justify-center items-center">
    <div class="column">
      <q-card
        square
        bordered
        class="q-pa-lg shadow-1"
      >
        <q-card-section>
          <q-form
            ref="loginform"
            class="q-gutter-md"
          >
            <q-input
              square
              filled
              v-model="username"
              type="text"
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
          </q-form>
        </q-card-section>
        <q-card-actions class="q-px-md">
          <q-btn
            unelevated
            color="primary"
            size="lg"
            class="full-width"
            type="submit"
            ref="login"
            :label="$t('login')"
            @click="login"
          />
        </q-card-actions>
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
import { openURL } from 'quasar'
import Shell from 'node-powershell'
import GetSavedCredentials from '../pwsh/scripts/Get-SavedCredentials'
import EnterPSSessionWithCredentials from '../pwsh/scripts/Enter-PSSessionWithCredentials'

export default {
  name: 'LoginPage',
  data () {
    return {
      username: '',
      password: '',
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
      this.$refs.loginform.validate().then((validate) => {
        // Validate form and continue only when form is not empty.
        if (validate) {
          // Load function Enter-PSSessionWithCredentials
          this.$pwsh.addCommand(EnterPSSessionWithCredentials)
          this.$pwsh.invoke().then(output => {
            // Invoke function with either credential object or username and password
            if (this.credentialsSaved) {
              this.$pwsh.addCommand(`Enter-PSSessionWithCredentials -Credential`)
            } else {
              this.$pwsh.addCommand(`Enter-PSSessionWithCredentials -Username ${this.username} -Password ${this.password}`)
            }
            this.$pwsh.invoke().then(output => {
              if (output.error) {
                console.log('error logging to pssession')
                console.log(output)
              } else {
                // Session created, add Session to variable so we can access it anytime
                this.$pwsh.addCommand(`$LazyAdminSession = (Get-PSSession -Name 'LazyAdminSession')[0]`)
                this.$pwsh.invoke().then(output => {
                  // Route to main screen
                  this.$pwsh.addCommand('Invoke-Command -Session $LazyAdminSession -ScriptBlock {whoami}')
                  this.$pwsh.invoke().then(output => {
                    console.log(output)
                    this.$router.push({ path: '/scripts' })
                  })
                })
              }
            })
          })
        }
      })
    },
    getComputerName () {
      let ps = new Shell({
        executionPolicy: 'Bypass',
        noProfile: true
      })

      ps.addCommand('echo $env:COMPUTERNAME')
      ps.invoke().then(output => {
        console.log(output)
      })
    },
    lazyVersion () {
      let version = require('electron').remote.app.getVersion()
      console.log(version)
    }
  },
  computed: {
    shake: {
      get () {
        return this.shakeUsername ? 'animated heartBeat delay-fix' : ''
      }
    },
    // username: {
    //   get () {
    //     return this.$store.state.lazystore.userName
    //   },
    //   set (val) {
    //     this.$store.commit('lazystore/updateUserName', val)
    //   }
    // },
    language: {
      get () {
        return this.$store.state.lazystore.language
      },
      set (val) {
        this.$store.commit('lazystore/updateLanguage', val)
      }
    }
  },
  watch: {
    language (language) {
      // When language is changed, update locale
      this.$i18n.locale = language
    }
  },
  created: function () {
    this.$q.loading.show()
    // Try to load saved credentials
    this.$pwsh.addCommand(GetSavedCredentials)
    this.$pwsh.invoke().then(output => {
      console.log(output)
      let jsonOutput = JSON.parse(output)
      // If module did not load, warn user that he might be missing module
      if (jsonOutput.error) {
        console.log(jsonOutput.output)
        this.$q.notify({
          timeout: 5000,
          multiLine: false,
          icon: 'warning',
          message: this.$t('moduleCredMgrMissing'),
          actions: [
            { label: this.$t('install'), color: 'primary', handler: () => { openURL('https://github.com/houby-studio/lazy-admin/wiki/How-to-install-CredentialManager-module') } },
            { label: this.$t('dismiss'), color: 'primary' }
          ]
        })
      } else {
        if (jsonOutput.returnCode === 10011001) {
          this.credentialsSaved = true
          this.shakeUsername = true
          this.username = jsonOutput.output.UserName
          this.$q.notify({
            timeout: 2000,
            multiLine: false,
            message: this.$t('foundsavedCredential', { usr: jsonOutput.output.UserName }),
            actions: [
              { label: this.$t('dismiss'), color: 'primary' }
            ]
          })
          this.$refs.login.$el.focus()
        } else {
          console.log('Did not find login for user')
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
