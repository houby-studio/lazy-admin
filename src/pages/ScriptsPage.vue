<template>
  <q-page class="flex">
    <!-- Dialog window is shown when command is selected with 'Execute' button -->
    <q-dialog
      v-model="displayCommandDiag"
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
              :hint="`[${param.type}] hint text`"
              :type="param.type"
              @keyup.enter="displayCommandDiag = false"
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
    <!-- Dialog to show help window -->
    <q-dialog
      v-model="displayHelpDiag"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="full-width">
        <q-card-section>
          <div class="text-h6">
            <q-icon :name="currentCommand.icon"></q-icon> {{ currentCommand.commandName }}
          </div>
        </q-card-section>
        <q-card-section>
          <div>
            {{ currentCommand.description ?  currentCommand.description[language] ? currentCommand.description[language] : currentCommand.description.default : '' }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Dialog to show results window -->
    <q-dialog
      v-model="displayResultsDiag"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="full-width">
        <q-card-section>
          <div class="text-h6">
            <q-icon :name="currentCommand.icon"></q-icon> Results
          </div>
        </q-card-section>
        <q-card-section>
          <!-- TODO: Types of returns: PSObject, LazyAdminObject, SimpleValue, Raw -->
          <!-- Check which type of result was returned -->
          <div v-if="results.returnType === 'object'">
            <q-table
              :data="results.output"
              :columns="resultsColumns"
              row-key="name"
            >
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Datatable showing all commands in main window -->
    <div class="row fit">
      <div class="col">
        <q-table
          :data="testJson.definition"
          :columns="scriptsColumns"
          :filter="searchText"
          :pagination.sync="pagination"
          row-key="parameter"
          hide-bottom
          hide-header
        >
          <!-- Template showing command icon. When command has no icon, defaults to mdi-powershell icon -->
          <template v-slot:body-cell-icon="props">
            <q-td
              :props="props"
              auto-width
            >
              <q-icon
                :name="props.row.icon ? props.row.icon : 'mdi-powershell'"
                size="md"
              ></q-icon>
            </q-td>
          </template>
          <!-- Template showing friendly command name and 'Cmdlet' which gets executed -->
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
          <!-- Template showing help icon -->
          <template v-slot:body-cell-help="props">
            <q-td
              :props="props"
              auto-width
            >
              <q-btn
                dense
                round
                flat
                icon="help"
                @click="showHelpDiag(props.row)"
              />
            </q-td>
          </template>
          <!-- Template showing button which launches window prompting for-->
          <template v-slot:body-cell-execute="props">
            <q-td
              :props="props"
              auto-width
            >
              <q-btn
                flat
                @click="showCommandDiag(props.row)"
              >{{ $t('execute') }}</q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script>
import json from '../../scripts-definitions/definition-lazy-admin-base.json'

export default {
  name: 'PageIndex',
  data () {
    return {
      currentCommand: {}, // User click "Execute" on datatable, chosen command is set to this object, which gets rendered with dialog
      returnParams: {}, // User defined parameters from Command Dialog
      results: {}, // Command result object displayed in Results Dialog
      displayCommandDiag: false,
      displayHelpDiag: false,
      displayResultsDiag: false,
      testJson: json, // to delete
      scriptsColumns: [
        { name: 'icon', align: 'center', label: 'Icon', field: row => row.icon, sortable: true },
        { name: 'commandName', required: true, label: 'Command Name', align: 'left', field: row => row.commandName, format: val => `${val}`, sortable: true },
        { name: 'description', align: 'left', label: 'Description', field: row => row.description ? row.description[(this.$i18n.locale)] ? row.description[(this.$i18n.locale)] : row.description.default : '', sortable: true, classes: 'gt-sm' },
        { name: 'spacer', align: 'center', label: 'Spacer', field: '', sortable: false, classes: 'full-width' },
        { name: 'help', align: 'center', label: 'Icon', field: 'help', sortable: true },
        { name: 'execute', label: 'Execute', field: 'Execute', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) }
      ],
      pagination: {
        // all records per page
        rowsPerPage: 0
      }
    }
  },
  computed: {
    searchText: {
      get () {
        // retrieve search text from store
        return this.$store.state.lazystore.search
      }
    },
    language: {
      get () {
        // retrieve language preference from store
        return this.$store.state.lazystore.language
      }
    },
    resultsColumns: {
      get () {
        let params = Object.keys(this.results.output[0]) // Get param names
        let columns = []
        for (let i = 0; i < params.length; i++) {
          let definition = { name: params[i], align: 'center', label: params[i], field: params[i], sortable: true }
          columns.push(definition)
        }
        return columns
      }
    }
  },
  methods: {
    showCommandDiag (commandCtx) {
      this.currentCommand = commandCtx
      this.displayCommandDiag = !this.displayCommandDiag
    },
    showHelpDiag (helpCtx) {
      this.currentCommand = helpCtx
      this.displayHelpDiag = !this.displayHelpDiag
    },
    showResultsDiag (resultspCtx) {
      this.results = resultspCtx
      this.displayResultsDiag = !this.displayResultsDiag
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
        //  Code block to handle PSObject returns
        if (this.currentCommand.returns === 'PSObject') {
          let data
          try {
            data = JSON.parse(output)
            this.results = {
              error: false,
              returnCode: 0,
              returnType: 'object',
              output: data
            }
          } catch (error) {
            this.results = {
              error: true,
              returnCode: 1,
              returnType: 'object',
              output: data
            }
          }
          this.displayResultsDiag = true
        }
      })
    }
  }
}
</script>

<style lang="sass">
  .q-table
    vertical-align: top !important
</style>
