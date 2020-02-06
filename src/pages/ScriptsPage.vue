<template>
  <q-page class="flex flex-center">
    <q-list>
      <q-item
        v-for="(command, index) in testJson.definition"
        v-bind:key="index"
      >
        <q-item>
          {{ index }} {{ command.commandName }} - {{ command.icon }}
          <q-btn @click="execute(command.commandBlock)">Execute</q-btn>
        </q-item>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import json from '../../scripts-definitions/definition-lazy-admin-base.json'

export default {
  name: 'PageIndex',
  data () {
    return {
      testJson: json,
      computerName: ''
    }
  },
  methods: {
    lazyVersion () {
      let version = require('electron').remote.app.getVersion()
      console.log(version)
    },
    execute (param) {
      let pwshCommand = param
      let ComputerName = 'TEST-PC'
      // TODO: Possibly https://github.com/premasagar/tims
      if (ComputerName) {
        pwshCommand = pwshCommand.replace('{ComputerName}', ComputerName)
      } else {
        console.log('ComputerName is empty!')
        pwshCommand = pwshCommand.replace('{ComputerName}', '')
      }
      console.log(pwshCommand)
    }
  }
}
</script>
