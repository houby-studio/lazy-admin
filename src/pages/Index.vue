<template>
  <q-page class="flex justify-center items-start q-layout-padding">
    <div class="row">
      <div class="col">
        <q-input
          filled
          v-model="username"
          label="Filled"
          hint="Username"
        />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <q-input
          v-model="password"
          filled
          :type="isPwd ? 'password' : 'text'"
          hint="Password with toggle"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </div>
    </div>

    <q-btn
      @click="storePassword"
      color="white"
      text-color="black"
      label="Store password"
    />
    <q-btn
      @click="getComputerName"
      color="white"
      text-color="black"
      label="Get Computer Name"
    />
    <q-btn
      to="/scripts"
      @click="lazyVersion"
      color="white"
      text-color="black"
      label="Get version"
    />
    q-
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
