<template>
  <q-page class="flex flex-center">
    <q-btn
      color="white"
      text-color="black"
      label="Store password"
    />
    <q-btn
      color="white"
      text-color="black"
      label="Get Computer Name"
      to="/"
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
// import Shell from 'node-powershell'

export default {
  name: 'PageIndex',
  data () {
    return {
      computerName: ''
    }
  },
  methods: {
    lazyVersion () {
      let version = require('electron').remote.app.getVersion()
      console.log(version)
    }
  }
}
</script>
