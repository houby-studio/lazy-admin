<template>
  <q-page class="flex">
    <!-- Dialog window is shown when command is selected with 'Execute' button -->
    <q-dialog
      v-model="displayCommandDiag"
      transition-show="scale"
      transition-hide="scale"
      :maximized="commandDialogMaximized"
    >
      <q-card class="full-width">
        <q-form
          @submit="preExecuteCheck"
          @reset="resetForm"
        >
          <q-card-section>
            <div class="row">
              <div class="col">
                <div class="text-h6 float-left">
                  <q-icon :name="currentCommand.icon ? currentCommand.icon : 'mdi-powershell'"></q-icon> {{ currentCommand.commandName }}
                </div>
              </div>
              <div class="col">
                <q-card-actions
                  align="right"
                  class="text-primary q-pa-none"
                >

                  <q-btn
                    flat
                    :ripple="false"
                    icon="crop_square"
                    @click="commandDialogMaximized = !commandDialogMaximized"
                  />
                </q-card-actions>
              </div>
            </div>

          </q-card-section>
          <q-card-section class="q-pt-none">
            <!-- Workflows only - Previous command parameters -->
            <!-- <component
              v-for="(param, index) in currentCommand.parameters"
              v-model="returnParams[param.parameter]"
              :tabindex="index + 1"
              :is="paramType[param.type][0]"
              :toggle-indeterminate="paramType[param.type][1]"
              :false-value="paramType[param.type][1] ? 'false' : false"
              :label="param.parameter"
              :label-color="param.required ? 'primary' : ''"
              :key="param.parameter"
              :rules="param.required ? [ val => val && val.length > 0 || $t('requiredField') ] : [] "
              :hint="`${param.required ? $t('requiredParam') : $t('optionalParam') } | ${param.type} | ${param.hint ? param.hint[language] || param.hint['default'] : ''}`"
              :type="paramType[param.type][1]"
              @keyup.enter="$event.target.nextElementSibling.focus()"
              clearable
              lazy-rules
            ></component> -->
            <!-- Command parameters -->
            <component
              v-for="(param, index) in currentCommand.parameters"
              v-model="returnParams[param.parameter]"
              :tabindex="index + 1"
              :is="paramType[param.type][0]"
              :toggle-indeterminate="paramType[param.type][1]"
              :false-value="paramType[param.type][1] ? 'false' : false"
              :label="param.parameter"
              :label-color="param.required ? 'primary' : ''"
              :key="param.parameter"
              :rules="param.required ? [ val => val && val.length > 0 || $t('requiredField') ] : [] "
              :hint="`${param.required ? $t('requiredParam') : $t('optionalParam') } | ${param.type} | ${param.hint ? param.hint[language] || param.hint['default'] : ''}`"
              :type="paramType[param.type][1]"
              @keyup.enter="$event.target.nextElementSibling.focus()"
              clearable
              lazy-rules
            ></component>
          </q-card-section>

          <q-card-actions
            align="right"
            class="text-primary"
          >
            <q-btn
              flat
              type="reset"
              tabindex="999"
              :label="$t('reset')"
            />
            <q-btn
              flat
              v-close-popup
              tabindex="1000"
              :label="$t('cancel')"
            />
            <q-btn
              flat
              type="submit"
              tabindex="998"
              :label="$t('launch')"
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
            <q-icon :name="currentCommand.icon ? currentCommand.icon : 'mdi-powershell'"></q-icon> {{ currentCommand.commandName }}
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
      full-width
      full-height
      persistent
    >
      <q-card class="full-width">
        <q-card-section>
          <div class="text-h6">
            <q-icon :name="currentCommand.icon ? currentCommand.icon : 'mdi-powershell'"></q-icon> {{ $t('results', { commandName: currentCommand.commandName }) }} {{ currentCommand.workflow ? 'Workflow' : '' }}
          </div>
        </q-card-section>
        <q-card-section>
          <!-- Check which type of result was returned -->
          <div v-if="results.returnType === 'object'">
            <q-table
              :data="results.output"
              :columns="resultsColumns"
              :pagination.sync="outputPagination"
              :selection="resultsTableSelection"
              :selected.sync="resultsSelected"
              row-key="__id"
            >
            </q-table>
          </div>
          <!-- Display RAW String value returned from PowerShell - this is displayed when cast to JSON object fails -->
          <div v-else>
            <q-input
              type="textarea"
              readonly
              autogrow
              borderless
              :value="results.output"
              @keyup.enter.stop
            />
          </div>
        </q-card-section>
        <!-- Always display buttons on the center bottom of the main window -->
        <q-page-sticky
          position="bottom"
          :offset="[0, 0]"
        >
          <q-card-actions>
            <!-- Allow objects to be exported to CSV -->
            <q-btn
              v-if="results.returnType === 'object'"
              icon="mdi-file-delimited"
              round
              color="primary"
              @click="exportTable"
            >
              <q-tooltip>
                {{ $t('exportCsv') }}
              </q-tooltip>
            </q-btn>
            <!-- Allow raw text to be copied to clipboard -->
            <q-btn
              v-if="results.returnType === 'raw'"
              icon="mdi-content-copy"
              round
              color="primary"
              @click="notifyCopied"
              v-clipboard:copy="results.output"
            >
              <q-tooltip>
                {{ $t('copyClipboard') }}
              </q-tooltip>
            </q-btn>
            <!-- Button to close results -->
            <q-btn
              icon="close"
              round
              color="primary"
              v-close-popup
            >
              <q-tooltip>
                {{ $t('close') }}
              </q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-page-sticky>
      </q-card>
    </q-dialog>
    <!-- Datatable showing all commands in main window -->
    <div class="row fit">
      <div class="col">
        <q-table
          :data="scriptsArray"
          :columns="scriptsColumns"
          :filter="searchText"
          :pagination.sync="scriptsPagination"
          :no-data-label="$t('noScriptsFound')"
          :no-results-label="$t('noScriptsFound')"
          wrap-cells
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
          <!-- Template showing favorite icon -->
          <template v-slot:body-cell-favorite="props">
            <q-td
              :props="props"
              auto-width
            >
              <q-btn
                dense
                round
                flat
                icon="star_outline"
                @click="showHelpDiag(props.row)"
              />
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
          <!-- Template showing button which launches window prompting for parameters-->
          <template v-slot:body-cell-execute="props">
            <q-td
              :props="props"
              auto-width
            >
              <q-btn
                flat
                @click="showCommandDiag(props.row)"
              >{{ $t('launch') }}</q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { exportFile } from 'quasar'
import { mapGetters } from 'vuex'
const childProcess = require('child_process')

//  Helper function which wraps table values for CSV export - https://quasar.dev/vue-components/table#Exporting-data
function wrapCsvValue (val, formatFn) {
  let formatted = formatFn !== void 0
    ? formatFn(val)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
    /**
     * Excel accepts \n and \r in strings, but some other CSV parsers do not
     * Uncomment the next two lines to escape new lines
     */
    .split('\n').join('\\n')
    .split('\r').join('\\r')

  return `"${formatted}"`
}

export default {
  name: 'PageIndex',
  data () {
    return {
      currentCommand: {}, // User click "Execute" on datatable, chosen command is set to this object, which gets rendered with dialog
      currentWorkflowIndex: 0, // Index of currently workflow step to run
      returnParams: {}, // User defined parameters from Command Dialog
      results: {}, // Command result object displayed in Results Dialog
      resultsSelected: [], // Array of selected objects from Results Dialog
      displayCommandDiag: false,
      displayHelpDiag: false,
      displayResultsDiag: false,
      paramType: {
        'String': ['q-input', 'text'],
        'Number': ['q-input', 'number'],
        'ScriptBlock': ['q-input', 'textarea'],
        'Boolean': ['q-toggle', true],
        'Switch': ['q-toggle', false]
      },
      scriptsColumns: [
        { name: 'icon', align: 'center', label: 'Icon', field: row => row.icon, sortable: true, classes: 'gt-xs' },
        { name: 'commandName', required: true, label: 'Command Name', align: 'left', field: row => row.commandName, format: val => `${val}`, sortable: true, classes: 'text-no-wrap' },
        { name: 'friendlyName', label: 'Friendly Name', align: 'left', field: row => row.friendlyName ? row.friendlyName[(this.$i18n.locale)] ? row.friendlyName[(this.$i18n.locale)] : row.friendlyName['default'] : '', format: val => `${val}`, sortable: true, classes: 'hidden' },
        { name: 'description', align: 'left', label: 'Description', field: row => row.description ? row.description[(this.$i18n.locale)] ? row.description[(this.$i18n.locale)] : row.description.default : '', sortable: true, classes: 'gt-sm' },
        { name: 'spacer', align: 'center', label: 'Spacer', field: '', sortable: false },
        { name: 'favorite', align: 'center', label: 'Icon', field: 'star', sortable: true, classes: 'gt-xs' },
        { name: 'help', align: 'center', label: 'Icon', field: 'help', sortable: true, classes: 'gt-xs' },
        { name: 'execute', label: 'Execute', field: 'Execute', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) }
      ],
      scriptsPagination: {
        // all records per page
        rowsPerPage: 0
      },
      outputPagination: {
        // all records per page, user may change that via GUI
        rowsPerPage: 0
      }
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getLanguage', 'getSearch', 'getScriptsArray', 'getDefinitions', 'getCommandMaximized']),
    searchText: function () {
      return this.getSearch
    },
    language: function () {
      return this.getLanguage
    },
    scriptsArray: function () {
      // Filter definitions and spread to single array to display in scripts page data table
      return this.getScriptsArray
    },
    definitions: function () {
      return this.getDefinitions
    },
    commandDialogMaximized: {
      get () {
        return this.getCommandMaximized
      },
      set (val) {
        this.$store.dispatch('lazystore/setCommandMaximized', val)
      }
    },
    resultsColumns: {
      get () {
        let columns = [
          { name: '__id', align: 'left', label: '__id', field: row => row.__id, classes: 'hidden', headerClasses: 'hidden' }
        ]
        for (let i = 0; i < this.results.params.length; i++) {
          let definition = { name: this.results.params[i], align: 'left', label: this.results.params[i], field: this.results.params[i], sortable: true }
          columns.push(definition)
        }
        return columns
      }
    },
    resultsTableSelection: {
      // Table selection can be either single, multiple or none. If command is not part of workflow or passthru is not defined in JSON, defaults to none.
      get () {
        if (this.currentCommand.workflow) {
          if (this.currentCommand.workflow[this.currentWorkflowIndex].passthru) {
            return this.currentCommand.workflow[this.currentWorkflowIndex].passthru
          } else {
            return 'none'
          }
        } else {
          return 'none'
        }
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
    notifyCopied () {
      this.$q.notify({
        icon: 'check',
        color: 'positive',
        position: 'bottom-left',
        timeout: 1500,
        message: this.$t('copied')
      })
    },
    exportTable () {
      // https://quasar.dev/vue-components/table#Exporting-data
      const content = [this.resultsColumns.map(col => wrapCsvValue(col.label))].concat(
        this.results.output.map(row => this.resultsColumns.map(col => wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            : row[col.field === void 0 ? col.name : col.field],
          col.format
        )).join(';'))
      ).join('\r\n')

      const status = exportFile(
        `${this.currentCommand.commandName}.csv`,
        content,
        'text/csv'
      )

      if (status !== true) {
        this.$q.notify({
          icon: 'warning',
          color: 'negative',
          position: 'bottom-left',
          timeout: 1500,
          message: 'Super big error - something is very wrong'
        })
      } else {
        this.$q.notify({
          icon: 'check',
          color: 'positive',
          position: 'bottom-left',
          timeout: 1500,
          message: this.$t('exported')
        })
      }
    },
    toggleLoading (state) {
      if (state) {
        this.$q.loading.show({
          message: '<h6>' + this.$t('scriptRunning') + '</h6><p>' + this.$t('pressToCancel') + '</p>'
        })
        window.addEventListener('keyup', this.cancelCommand, true)
      } else {
        this.$q.loading.hide()
        window.removeEventListener('keyup', this.cancelCommand, true)
      }
    },
    resetForm () {
      for (let i = 0; i < this.currentCommand.parameters.length; i++) {
        let param = this.currentCommand.parameters[i]
        this.returnParams[param.parameter] = ''
      }
    },
    preExecuteCheck () {
      if (this.currentCommand.confirm) {
        this.$q.dialog({
          color: 'primary',
          title: this.$t('confirm'),
          message: this.$t('confirmMsg'),
          ok: {
            label: this.$t('launch'),
            flat: true
          },
          cancel: {
            label: this.$t('cancel'),
            flat: true
          }
        }).onOk(() => {
          this.executeCommand()
        })
      } else {
        this.executeCommand()
      }
    },
    cancelCommand (key) {
      if (key.key === 'Escape') {
        this.toggleLoading()
        this.$q.loading.show({
          message: '<h6>' + this.$t('cancelling') + '</h6><p>' + this.$t('pleaseWait') + '</p>'
        })
        // Kill current powershell proccess
        childProcess.exec(`taskkill /f /pid ${this.$pwsh.shell.pid}`, (error, stdout, stderr) => {
          if (error) {
            console.error('Could not stop PowerShell. Original error: ', error)
          }
          // Create new PowerShell instance
          // this.$q.loading.show({
          //   message: '<h6>Creating new PowerShell</h6>'
          // })
          this.$pwsh.createShell((done) => {
            // this.$q.loading.show({
            //   message: '<h6>Loading functions</h6>'
            // })
            // Load New-PSSessionWithCredentials
            this.$pwsh.loadCredFunction(() => {
              this.$pwsh.shell.invoke().then(() => {
                // Create Credential Object and PSSession
                // this.$q.loading.show({
                //   message: '<h6>Creating new session</h6>'
                // })
                this.$pwsh.loadCredString(() => {
                  this.$pwsh.shell.invoke().then(() => {
                    // PowerShell restarted, hide loading
                    this.toggleLoading()
                  })
                })
              })
            })
          })
        })
      }
    },
    executeCommand () {
      // Insert parameter variables to command template
      let resultCommand = this.currentCommand.commandBlock
      for (let i = 0; i < this.currentCommand.parameters.length; i++) {
        let param = this.currentCommand.parameters[i]
        let input = this.returnParams[param.parameter]
        // console.log('Checking input: ', input)
        if (input) {
          // console.log('input is here!')
          // If parameter has additional text format, insert it
          if (param.format) {
            // console.log('format is here!')
            resultCommand = resultCommand.replace(`{{${param.parameter}}}`, `${param.format}`)
          }
          // If parameter was supplied, insert param in place of template variable
          resultCommand = resultCommand.replace(`{{${param.parameter}}}`, `${input}`)
        } else {
          // If parameter was not supplied, remove template variable
          resultCommand = resultCommand.replace(`{{${param.parameter}}}`, '')
        }
      }
      this.toggleLoading(true)
      // TODO: Save command to history
      this.$pwsh.shell.clear().then(() => {
        // this.$pwsh.shell.on('output', (output) => { console.log(output) })
        if (this.currentCommand.insidePsSession) {
          this.$pwsh.shell.addCommand(`Invoke-Command -Session $Global:LazyAdminPSSession -ScriptBlock {${resultCommand}}`)
        } else {
          this.$pwsh.shell.addCommand(resultCommand)
        }
        this.$pwsh.shell.invoke().then(output => {
          // console.log('Command results: ', output)
          //  Code block to handle PowerShell return data
          let data
          let params
          let dataArray = []
          try {
            // Cast data to JSON, if this fails, display data as raw output
            data = JSON.parse(output)
            try {
              params = Object.keys(data[0]) // Get param names from array
              if (this.currentCommand.type === 'workflow') {
                // If command is part of workflow, calculate indexes to allow selection
                data = data.map((val, index) => ({ ...val, __id: index }))
              }
              dataArray.push(...data)
            } catch (error) {
              //  If array of objects fails, assume it is single object
              params = Object.keys(data) // Get param names from single object
              dataArray.push(data)
            }
            this.results = {
              error: params.error,
              returnType: 'object',
              params: params,
              output: dataArray
            }
          } catch (error) {
            // Result was not an array of objects or single object. Console returned error, additional text or that's how command was written.
            this.results = {
              error: this.currentCommand.returns !== 'raw', // If command should return raw, it is not an error (or there is no way to tell)
              returnType: 'raw',
              output: output
            }
          }
          this.displayResultsDiag = true
          this.toggleLoading()
        }).catch(error => {
          // If PowerShell itself runs into problem and throws, catch and display error as raw output.
          console.log(error)
          this.results = {
            error: true,
            returnType: 'raw',
            output: error
          }
          this.displayResultsDiag = true
          this.toggleLoading()
        })
      })
    }
  }
}
</script>
