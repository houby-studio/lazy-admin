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
// Keytar requires specific settings in .npmrc as stated here https://github.com/atom/node-keytar/issues/215
// https://github.com/atom/node-keytar
const keytar = require('keytar')
import Shell from 'node-powershell'

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
      keytar.setPassword('Lazy Admin', this.username, this.password)
    },
    getComputerName () {
      keytar.getPassword('Lazy Admin', 'asindelar').then(function (res) {
        console.log(res)
      })
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
    // When login page is created, set locale from vuex store
    this.$i18n.locale = this.$store.state.lazystore.language
    // Try to load saved credentials
    keytar.getPassword('Lazy Admin', this.$store.state.lazystore.userName).then((res) => {
      if (res) {
        // Found saved password for last user
        console.log(res)
        this.credentialsSaved = true
        console.log(this.$store.state.lazystore.userName)
      }
    })
  }
}
</script>
