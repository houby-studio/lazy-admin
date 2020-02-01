<template>
  <q-page class="row justify-center items-center">
    <div class="column">
      <q-card
        square
        bordered
        class="q-pa-lg shadow-1"
      >
        <q-card-section>
          <q-form class="q-gutter-md">
            <q-input
              square
              filled
              v-model="username"
              type="text"
              :disable="credentialsSaved"
              :label="$t('username')"
            >
              <template v-slot:append>
                <q-icon name="person" />
              </template>
            </q-input>
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
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </q-form>
        </q-card-section>
        <q-card-actions class="q-px-md">
          <q-btn
            unelevated
            color="primary"
            size="lg"
            class="full-width"
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
import Shell from 'node-powershell'
import GetSavedCredentials from '../pwsh/scripts/Get-SavedCredentials'

export default {
  name: 'LoginPage',
  data () {
    return {
      password: '',
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
      /* in component - use sendSync when a response is needed */
      // pwsh  New-StoredCredential -Persist LocalMachine -Target 'sexous la' -UserName 'peniska' -Password teniska -Comment 'Password for pros'
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
    username: {
      get () {
        return this.$store.state.lazystore.userName
      },
      set (val) {
        this.$store.commit('lazystore/updateUserName', val)
      }
    },
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
    // Try to load saved credentials
    this.$pwsh.addCommand(GetSavedCredentials)
    this.$pwsh.invoke().then(output => {
      console.log(output)
      let jsonOutput = JSON.parse(output)
      // If module did not load, warn user that he might be missing module
      if (jsonOutput.error) {
        console.log(jsonOutput.output)
        console.log('module missing')
      } else {
        if (jsonOutput.returnCode === 10011001) {
          console.log(`Found login for user ${jsonOutput.output.UserName}`)
        } else {
          console.log('Did not find login for user')
        }
      }
    })
  }
}
</script>
