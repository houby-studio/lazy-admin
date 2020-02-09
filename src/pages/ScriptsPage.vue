<template>
  <q-page class="flex">
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
              :rules="param.required ? [ val => val && val.length > 0 || $t('requiredField') ] : [] "
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
    <div class="row fit">
      <div class="col">
        <q-table
          :data="testJson.definition"
          :columns="scriptsColumns"
          :filter="searchText"
          row-key="parameter"
          hide-bottom
          hide-header
          class="fit"
        >
          <template v-slot:body-cell-icon="props">
            <q-td
              :props="props"
              auto-width
            >
              <q-icon
                :name="props.row.icon"
                size="md"
              ></q-icon>
            </q-td>
          </template>
          <template v-slot:body-cell-commandName="props">
            <q-td
              :props="props"
              auto-width
            >
              <div>
                {{ props.row.friendlyName ? props.row.friendlyName[language] ? props.row.friendlyName[language] : props.row.friendlyName.default : '' }}
              </div>
              <div>
                {{ props.row.commandName }}
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-execute="props">
            <q-td
              :props="props"
              auto-width
            >
              <q-btn @click="commandDialog(props.row)">Execute</q-btn>
              <q-icon
                :name="props.row.icon"
                size="md"
              ></q-icon>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
    <!-- <q-list>
      <q-item
        v-for="(command, index) in testJson.definition"
        v-bind:key="index"
      >
        <q-item>
          {{ index }} {{ command.commandName }} - {{ command.icon }}
          <q-btn @click="commandDialog(command)">Execute</q-btn>
        </q-item>
      </q-item>
    </q-list> -->
  </q-page>
</template>

<script>
import json from '../../scripts-definitions/definition-lazy-admin-base.json'

export default {
  name: 'PageIndex',
  data () {
    return {
      search: this.$refs.search,
      currentCommand: {},
      returnParams: {},
      displayDialog: false,
      testJson: json,
      computerName: '',
      scriptsColumns: [
        { name: 'icon', align: 'center', label: 'Icon', field: row => row.icon, sortable: true },
        {
          name: 'commandName',
          required: true,
          label: 'Command Name',
          align: 'left',
          field: row => row.commandName,
          format: val => `${val}`,
          sortable: true,
          style: 'width: 1px'
        },
        { name: 'description', align: 'left', label: 'Description', field: row => row.description ? row.description[(this.$i18n.locale)] ? row.description[(this.$i18n.locale)] : row.description.default : '', sortable: true },
        { name: 'execute', label: 'Execute', field: 'Execute', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) }
      ]
    }
  },
  computed: {
    searchText: {
      get () {
        return this.$store.state.lazystore.search
      }
    },
    language: {
      get () {
        // retrieve language preference from store
        return this.$store.state.lazystore.language
      }
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

<style lang="sass">
  .q-table
    vertical-align: top !important
</style>
