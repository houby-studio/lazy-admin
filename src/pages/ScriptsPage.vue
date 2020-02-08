<template>
  <q-page class="flex flex-center">
    <q-dialog
      v-model="displayDialog"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="full-width">
        <q-form @submit="executeCommand">
          <q-card-section>
            <div class="text-h6">
              <q-icon :name="currentCommand.icon"></q-icon> {{ currentCommand.commandName }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              clearable
              lazy-rules
              v-for="param in currentCommand.parameters"
              v-model="returnParams[param.parameter]"
              :label="param.parameter"
              :label-color="param.required ? 'primary' : ''"
              :key="param.parameter"
              :rules="(param.required) ? [ val => val && val.length > 0 || $t('requiredField') ] : [] "
              :hint="param.type + ' ' + 'hint text'"
              :type="param.type"
              @keyup.enter="displayDialog = false"
            />
          </q-card-section>

          <q-card-actions
            align="right"
            class="text-primary"
          >
            <q-btn
              flat
              label="Cancel"
              v-close-popup
            />
            <q-btn
              flat
              type="submit"
              ref="execute"
              :label="$t('login')"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-list>
      <q-item
        v-for="(command, index) in testJson.definition"
        v-bind:key="index"
      >
        <q-item>
          {{ index }} {{ command.commandName }} - {{ command.icon }}
          <q-btn @click="commandDialog(command)">Execute</q-btn>
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
      currentCommand: {},
      returnParams: {},
      displayDialog: false,
      testJson: json,
      computerName: ''
    }
  },
  methods: {
    lazyVersion () {
      let version = require('electron').remote.app.getVersion()
      console.log(version)
    },
    commandDialog (commandCtx) {
      this.currentCommand = commandCtx
      this.displayDialog = !this.displayDialog
    },
    executeCommand () {
      // Insert parameter variables to command template
      let resultCommand = this.currentCommand.commandBlock
      for (let i = 0; i < this.currentCommand.parameters.length; i++) {
        let param = this.currentCommand.parameters[i]
        let input = this.returnParams[param.parameter]
        if (input) {
          // If parameter was supplied, insert param in place of template variable
          resultCommand = resultCommand.replace(`{{${param.parameter}}}`, `-${param.parameter} "${input}"`)
        } else {
          // If paramter was not supplied, remove template variable
          resultCommand = resultCommand.replace(`{{${param.parameter}}}`, '')
        }
      }
      // TODO: Save command to history
      this.$pwsh.addCommand(resultCommand)
      this.$pwsh.invoke().then(output => {
        console.log(output)
      })
      // console.log(resultCommand)
    }
  }
}
</script>
