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
              label="username"
            />
            <q-input
              square
              filled
              v-model="password"
              :type="isPwd ? 'password' : 'text'"
              label="password"
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
            label="Login"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
// Keytar requires specific settings in .npmrc as stated here https://github.com/atom/node-keytar/issues/215
// https://github.com/atom/node-keytar
const keytar = require('keytar')
import Shell from 'node-powershell'

export default {
  name: 'PageIndex',
  data () {
    return {
      computerName: '',
      password: '',
      isPwd: true
    }
  },
  methods: {
    storePassword () {
      keytar.setPassword('Lazy Admin', 'asindelar', 'what')
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
        console.log(`Username is ${this.$store.state.lazystore.userName}`)
      }
    }
  }
}
</script>
