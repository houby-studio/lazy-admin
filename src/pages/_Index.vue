<template>
  <q-page class="flex flex-center">
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
      computerName: ''
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
  }
}
</script>
