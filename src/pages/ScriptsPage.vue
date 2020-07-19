<template>
  <q-page class="flex">
    <!-- Dialog window is shown when command is selected with 'Execute' button -->
    <q-dialog
      v-model="displayCommandDiag"
      :full-width="commandDialogMaximized"
      :full-height="commandDialogMaximized"
      @hide="resetAllParams"
      no-backdrop-dismiss
      transition-show="scale"
      transition-hide="scale"
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
                  <q-icon :name="currentCommandMaster.icon ? currentCommandMaster.icon : 'mdi-powershell'"></q-icon> {{ currentCommandMaster.commandName }}
                </div>
              </div>
              <div class="col">
                <q-card-actions
                  align="right"
                  class="text-primary q-pa-none"
                >

                  <q-btn
                    :ripple="false"
                    :icon="commandDialogMaximized ? 'fas fa-compress-alt' : 'fas fa-expand-alt'"
                    @click="commandDialogMaximized = !commandDialogMaximized"
                    flat
                  />
                </q-card-actions>
              </div>
            </div>

          </q-card-section>
          <q-card-section class="q-pt-none">
            <!-- Workflows only - Previous command parameters -->
            <q-expansion-item
              v-if="currentCommand.passedParameters ? currentCommand.passedParameters.length > 0 : false"
              :default-opened="resultsSelected.length > 1"
              :caption="$t('workflowReadOnly')"
              :label="$t('workflowParameters')"
              expand-separator
              icon="mdi-cogs"
            >
              <q-input
                v-for="param in currentCommand.passedParameters"
                v-model="returnParams[returnParamsPaginate + '__' + param.parameter]"
                :label="param.parameter"
                :key="param.parameter"
                hide-bottom-space
                standout
                readonly
                type="text"
              ></q-input>
            </q-expansion-item>
            <q-separator
              v-if="currentCommand.passedParameters ? currentCommand.passedParameters.length > 0 : false"
              spaced
            ></q-separator>
            <!-- Command parameters -->
            <component
              v-for="(param, index) in currentCommand.parameters"
              v-model="returnParams[returnParamsPaginate + '__' + param.parameter]"
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
              filled
              clearable
              lazy-rules
            ></component>
          </q-card-section>
          <!-- Actions for command dialog -->
          <q-card-actions
            align="right"
            class="text-primary"
          >
            <!-- Show pagination if there is more than one selected result from previous command -->
            <q-pagination
              v-if="resultsSelected.length > 1"
              v-model="returnParamsPaginate"
              :max="resultsSelected.length"
              :input="true"
            >
            </q-pagination>
            <q-btn
              v-close-popup
              :label="$t('cancel')"
              tabindex="1000"
              flat
            />
            <q-btn
              :label="$t('reset')"
              flat
              type="reset"
              tabindex="999"
            />
            <q-btn
              :label="$t('launch')"
              flat
              type="submit"
              tabindex="998"
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
      no-backdrop-dismiss
    >
      <q-card class="full-width">
        <q-card-section>
          <div class="text-h6">
            <q-icon :name="currentCommandMaster.icon ? currentCommandMaster.icon : 'mdi-powershell'"></q-icon> {{ $t('results', { commandName: currentCommandMaster.commandName }) }} {{ currentCommandMaster.workflow ? 'Workflow' : '' }}
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
              :filter="resultsFilter"
              row-key="__id"
            >
              <template v-slot:top-right>
                <q-input
                  v-model="resultsFilter"
                  :placeholder="$t('search')"
                  borderless
                  dense
                >
                  <template v-slot:append>
                    <q-icon
                      v-if="resultsFilter === ''"
                      name="search"
                      color="white"
                    />
                    <q-icon
                      v-else
                      @click="resultsFilter = ''"
                      name="clear"
                      class="cursor-pointer"
                      color="white"
                    />
                  </template>
                </q-input>
              </template>
            </q-table>
          </div>
          <!-- Display RAW String value returned from PowerShell - this is displayed when cast to JSON object fails -->
          <div v-else>
            <q-input
              :value="results.output"
              @keyup.enter.stop
              type="textarea"
              readonly
              autogrow
              borderless
            />
          </div>
        </q-card-section>
        <!-- Always display buttons on the center bottom of the main window -->
        <q-page-sticky
          :offset="[0, 0]"
          position="bottom"
        >
          <q-card-actions>
            <!-- Allow objects to be exported to CSV -->
            <q-btn
              v-if="results.returnType === 'object'"
              @click="exportTable"
              icon="mdi-file-delimited"
              round
              color="primary"
            >
              <q-tooltip>
                {{ $t('exportCsv') }}
              </q-tooltip>
            </q-btn>
            <!-- Allow raw text to be copied to clipboard -->
            <q-btn
              v-if="results.returnType === 'raw'"
              v-clipboard:copy="results.output"
              @click="notifyCopied"
              icon="mdi-content-copy"
              round
              color="primary"
            >
              <q-tooltip>
                {{ $t('copyClipboard') }}
              </q-tooltip>
            </q-btn>
            <!-- Button to close results -->
            <q-btn
              v-close-popup
              icon="close"
              round
              color="primary"
            >
              <q-tooltip>
                {{ $t('close') }}
              </q-tooltip>
            </q-btn>
            <!-- Button to launch another workflow step -->
            <q-btn
              v-if="currentCommandMaster.workflow ? currentWorkflowIndex < currentCommandMaster.workflow.length : false"
              :disable="resultsSelected.length === 0 && results.returnType !== 'raw'"
              @click="nextWorkflowStep"
              icon="mdi-arrow-right-bold"
              size="lg"
              round
              color="primary"
            >
              <q-tooltip>
                {{ $t('workflowContinue') }}
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
                @click="showHelpDiag(props.row)"
                dense
                round
                flat
                icon="star_outline"
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
  name: 'ScriptsPage',
  data () {
    return {
      currentCommand: {}, // User click "Execute" on datatable, chosen command is set to this object, which gets rendered with dialog
      currentCommandMaster: {}, // User click "Execute" on datatable, chosen command is set to this object, which is held as reference for workflows
      currentWorkflowIndex: 0, // Index of currently workflow step to run
      returnParams: {}, // User defined parameters from Command Dialog
      returnParamsPaginate: 1, // In multiple selection workflows allows parameters for each selection
      results: {}, // Command result object displayed in Results Dialog
      resultsSelected: [], // Array of selected objects from Results Dialog
      resultsFilter: '', // Filter for results table
      displayCommandDiag: false, // Visibility state for command dialog
      displayHelpDiag: false, // Visibility state for help dialog
      displayResultsDiag: false, // Visibility state for results dialog
      paramType: { // Table translating PowerShell variable types to Quasar components names and options
        'String': ['q-input', 'text'],
        'Number': ['q-input', 'number'],
        'ScriptBlock': ['q-input', 'textarea'],
        'Boolean': ['q-toggle', true],
        'Switch': ['q-toggle', false]
      }, // Column definitions for scripts table
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
      // table pagination options for scripts table
      scriptsPagination: { rowsPerPage: 0 },
      // table pagination options for scripts table, user may change this value in GUI
      outputPagination: { rowsPerPage: 0 }
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
          // Auto generated __id column for workflow commands
          { name: '__id', align: 'left', label: '__id', field: row => row.__id, classes: 'hidden', headerClasses: 'hidden' }
        ]
        // For every parameter received from command, generate column definition.
        for (let i = 0; i < this.results.params.length; i++) {
          let definition = { name: this.results.params[i], align: 'left', label: this.results.params[i], field: this.results.params[i], sortable: true }
          columns.push(definition)
        }
        return columns
      }
    },
    resultsTableSelection: {
      // Table selection can be either single, multiple or none. If command is not part of workflow or acceptsParams is not defined in JSON, or there is no next workflow step, defaults to none.
      get () {
        try {
          return this.currentCommandMaster.workflow[this.currentWorkflowIndex].acceptsParams
        } catch {
          return 'none'
        }
      }
    }
  },
  methods: {
    showCommandDiag (commandCtx) {
      this.currentCommand = commandCtx
      this.currentCommandMaster = commandCtx
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
      // TODO: rework and add better, complex solution
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
      // Always assume one set of parameters passed, unless there is more than one resultsSelected
      let parametersSetsNum = 1
      if (this.resultsSelected.length > 1) {
        parametersSetsNum = this.resultsSelected.length
      }
      // Loop through parameterSets and get parameters for each one to resultsCommand
      for (let paramSetIndex = 1; paramSetIndex <= parametersSetsNum; paramSetIndex++) {
        for (let i = 0; i < this.currentCommand.parameters.length; i++) {
          this.returnParams[paramSetIndex + '__' + this.currentCommand.parameters[i].parameter] = ''
        }
      }
    },
    resetAllParams () {
      this.displayCommandDiag = false
      this.displayResultsDiag = false
      this.currentCommand = {} // User click "Execute" on datatable, chosen command is set to this object, which gets rendered with dialog
      this.currentCommandMaster = {} // User click "Execute" on datatable, chosen command is set to this object, which is held as reference for workflows
      this.currentWorkflowIndex = 0 // Index of currently workflow step to run
      this.returnParams = {} // User defined parameters from Command Dialog
      this.returnParamsPaginate = 1 // In multiple selection workflows allows parameters for each selection
      this.results = {} // Command result object displayed in Results Dialog
      this.resultsSelected = [] // Array of selected objects from Results Dialog
      this.resultsFilter = '' // Filter for results table
    },
    // If command or user requires confirmation before executing, display this dialog.
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
    // If user needs to stop PowerShell execution for whatever reason, he can smash Esc to kill process and launch new one.
    // This requires user to have credential saved in Credential Manager, otherwise CredentialObject and Session cannot be created.
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
          this.$pwsh.createShell((done) => {
            // Load New-PSSessionWithCredentials
            this.$pwsh.loadCredFunction(() => {
              this.$pwsh.shell.invoke().then(() => {
                // Create Credential Object and PSSession
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
    // Processes selected results to parameters and pushes next workflow step to current command dialog
    nextWorkflowStep () {
      this.displayResultsDiag = false
      this.currentCommand = this.currentCommandMaster.workflow[this.currentWorkflowIndex] // Set current workflow step as currentCommand
      // For each parameter expected in passedParameters, loop through all of them and then throigh all selections to either join them to single string or insert as numbered parameters separately to returnParams
      for (let passedParamsIndex = 0; passedParamsIndex < this.currentCommand.passedParameters.length; passedParamsIndex++) {
        let parameterString = '' // Helper string for joining input arrays to single string
        for (let i = 1; i <= this.resultsSelected.length; i++) {
          // If parameters are to be passed as array of values separated by commas to parameter withing one command, join them
          if (this.currentCommand.joinParamsAsString) {
            // First parameter value does not have join format in front of it, only subsequent ones
            if (i !== 1) {
              parameterString += this.currentCommand.passedParameters[passedParamsIndex].joinFormat
            }
            // Add value from resultsSelected for given command e.g. resultsSelected[0]['Name']
            parameterString += this.resultsSelected[i - 1][this.currentCommand.passedParameters[passedParamsIndex].passedParamName]
          } else {
            // If parameters join method set is 'separate', set each result param to its own property with value
            this.returnParams[i + '__' + this.currentCommand.passedParameters[passedParamsIndex].parameter] = this.resultsSelected[i - 1][this.currentCommand.passedParameters[passedParamsIndex].passedParamName]

            if (this.currentCommandMaster.workflow[this.currentWorkflowIndex].passedParameters[passedParamsIndex].format) {
              parameterString = this.currentCommandMaster.workflow[this.currentWorkflowIndex].passedParameters[passedParamsIndex].format.replace(`{{${this.currentCommandMaster.workflow[this.currentWorkflowIndex].passedParameters[passedParamsIndex].parameter}}}`, `${parameterString}`)
            }
          }
        }
        // After looping though all selections is done, apply format to whole parameter if it is array parameter and insert to object
        if (this.currentCommand.joinParamsAsString) {
          // If parameter has format, apply it
          if (this.currentCommandMaster.workflow[this.currentWorkflowIndex].passedParameters[passedParamsIndex].format) {
            parameterString = this.currentCommandMaster.workflow[this.currentWorkflowIndex].passedParameters[passedParamsIndex].format.replace(`{{${this.currentCommandMaster.workflow[this.currentWorkflowIndex].passedParameters[passedParamsIndex].parameter}}}`, `${parameterString}`)
          }
          // Set parameter to returnParams
          this.returnParams['1__' + this.currentCommandMaster.workflow[this.currentWorkflowIndex].passedParameters[passedParamsIndex].parameter] = parameterString
        }
      }
      if (this.currentCommand.joinParamsAsString) { this.resultsSelected = [] } // clear resultsSelected to make command dialog behave in single input mode
      this.currentWorkflowIndex++
    },
    executeCommand () {
      // Always assume one set of parameters passed, unless there is more than one resultsSelected
      let parametersSetsNum = 1
      if (this.resultsSelected.length > 1) {
        parametersSetsNum = this.resultsSelected.length
      }
      this.resultsSelected = [] // Clear variable as we do not need it anymore
      let resultCommand = '' // Command to be executed
      // Loop through parameterSets and get parameters for each one to resultsCommand
      for (let paramSetIndex = 1; paramSetIndex <= parametersSetsNum; paramSetIndex++) {
        // Get commandBlock with template variables and replace with real values
        let tempResultCommand = this.currentCommand.commandBlock
        for (let i = 0; i < this.currentCommand.parameters.length; i++) {
          let param = this.currentCommand.parameters[i]
          let input = this.returnParams[paramSetIndex + '__' + param.parameter]
          // console.log('Checking input: ', input)
          if (input) {
            // console.log('input is here!')
            // If parameter has additional text format, insert it
            if (param.format) {
              // console.log('format is here!')
              tempResultCommand = tempResultCommand.replace(`{{${param.parameter}}}`, `${param.format}`)
            }
            // If parameter was supplied, insert param in place of template variable
            tempResultCommand = tempResultCommand.replace(`{{${param.parameter}}}`, `${input}`)
          } else {
            // If parameter was not supplied, remove template variable
            tempResultCommand = tempResultCommand.replace(`{{${param.parameter}}}`, '')
          }
        }
        // If command is part of workflow, load passed parameters
        if (this.currentCommand.passedParameters) {
          for (let i = 0; i < this.currentCommand.passedParameters.length; i++) {
            let param = this.currentCommand.passedParameters[i]
            let input = this.returnParams[paramSetIndex + '__' + param.parameter]
            if (input) {
              // If parameter was supplied, insert param in place of template variable
              tempResultCommand = tempResultCommand.replace(`{{${param.parameter}}}`, `${input}`)
            } else {
              // If parameter was not supplied, remove template variable
              tempResultCommand = tempResultCommand.replace(`{{${param.parameter}}}`, '')
            }
          }
          // If user uses raw parameter, replace
          tempResultCommand = tempResultCommand.replace(`{{__raw_argument}}`, `${this.results.output}`)
        }
        resultCommand += tempResultCommand + ';'
        resultCommand = resultCommand.replace(/(\r\n|\n|\r)/gm, '')
      }
      // TODO: Above move to preexecute command, so user can see it and edit it before running
      this.toggleLoading(true)
      // TODO: Save command to history
      this.$pwsh.shell.clear().then(() => {
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
              if (this.currentCommandMaster.workflow) {
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
            if (output === '') {
              output = this.$t('powershellNoOutput')
            }
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
