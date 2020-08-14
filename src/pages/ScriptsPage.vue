<template>
  <q-page class="flex">
    <!-- Right drawer displaying history table -->
    <history-drawer
      v-model="historyVisible"
      @hide-drawer="resetAllParams"
      @show-results-dialog="historyShowResultsDiag"
      @show-command-dialog="historyShowCommandDiag"
    ></history-drawer>
    <!-- Dialog window is shown when command is selected with 'Execute' button -->
    <q-dialog
      v-model="displayCommandDiag"
      :full-width="commandDialogMaximized"
      :full-height="commandDialogMaximized"
      @hide="resetAllParams"
      transition-show="scale"
      transition-hide="scale"
      no-backdrop-dismiss
    >
      <q-card class="full-width">
        <q-form
          @submit="preExecuteCheck"
          @reset="resetForm"
          autofocus
        >
          <q-card-section>
            <div class="row">
              <div class="col">
                <div class="text-h6 float-left">
                  <q-icon :name="currentCommandMaster.icon ? currentCommandMaster.icon : 'mdi-powershell'"></q-icon> {{ currentCommandMaster.commandName }} {{ currentWorkflowIndex +1 }}/{{ currentCommandMaster.workflow ? currentCommandMaster.workflow.length + 1 : 1 }}
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
                    tabindex="-1"
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
              :default-opened="resultsSelected[currentWorkflowIndex].length > 1"
              :caption="$t('workflowReadOnly')"
              :label="$t('workflowParameters')"
              :dense="denseInput"
              icon="mdi-cogs"
              expand-separator
            >
              <q-input
                v-for="param in currentCommand.passedParameters"
                v-model="returnParams[returnParamsPaginate + '__' + param.parameter]"
                :label="param.parameter"
                :key="param.parameter"
                :dense="denseInput"
                type="text"
                hide-bottom-space
                standout
                readonly
              ></q-input>
            </q-expansion-item>
            <q-separator
              v-if="currentCommand.passedParameters ? currentCommand.passedParameters.length > 0 : false"
              spaced
            ></q-separator>
            <!-- Command parameters -->
            <div
              v-for="(param, index) in currentCommand.parameters"
              :key="param.parameter"
              class="q-mb-sm"
            >
              <component
                v-model="returnParams[returnParamsPaginate + '__' + param.parameter]"
                :tabindex="index + 1"
                :is="paramType[param.type][0]"
                :toggle-indeterminate="paramType[param.type][1]"
                :false-value="paramType[param.type][1] ? 'false' : false"
                :label="param.parameter"
                :label-color="param.required ? 'primary' : ''"
                :rules="param.required ? [ val => val && val.length > 0 || $t('requiredField') ] : [] "
                :type="paramType[param.type][1]"
                :dense="denseInput"
                :options="param.options"
                :multiple="paramType[param.type][1]"
                @keydown.enter.prevent
                bottom-slots
                filled
                clearable
                lazy-rules
              >
                <!-- Template showing parameter informatin button -->
                <template v-slot:append>
                  <q-btn
                    @click.capture.stop="showParameterHelp(param)"
                    padding="none"
                    class="btn-param-info"
                    icon="info"
                    dense
                    round
                    flat
                  ></q-btn>
                </template>
                <!-- Template showing parameter information button -->
                <template v-slot:counter>
                  <p>{{ param.required ? $t('requiredParam') : $t('optionalParam') }} | {{ param.type }}</p>
                </template>
              </component>
              <!-- Hint for components which lack native hint slot -->
              <span
                v-if="param.type === 'Boolean' || param.type === 'Switch'"
                class="hint-opacity text-caption float-right"
              >
                <q-btn
                  @click="showParameterHelp(param)"
                  padding="none"
                  class="btn-param-info"
                  size="sm"
                  icon="info"
                  dense
                  round
                  flat
                ></q-btn>
                {{ param.required ? $t('requiredParam') : $t('optionalParam') }} | {{ param.type }}
              </span>
            </div>
          </q-card-section>
          <!-- Actions for command dialog -->
          <q-card-actions
            align="right"
            class="text-primary"
          >
            <!-- Show pagination if there is more than one selected result from previous command -->
            <q-pagination
              v-if="resultsSelected[currentWorkflowIndex -1 ] ? resultsSelected[currentWorkflowIndex-1].length > 1 : false"
              v-model="returnParamsPaginate"
              :max="resultsSelected[currentWorkflowIndex-1].length"
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
              type="reset"
              tabindex="999"
              flat
            />
            <q-btn
              :label="$t('launch')"
              type="submit"
              tabindex="998"
              flat
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <!-- Dialog to show help window -->
    <help-dialog
      v-model="displayHelpDiag"
      :current-command="currentCommand"
    />
    <!-- Dialog to show progress window -->
    <progress-dialog
      v-model="displayProgressDiag"
      :progress="scriptProgress"
      ref="progressDialog"
    />
    <!-- Dialog to show results window -->
    <results-dialog
      v-model="displayResultsDiag"
      :currentCommandMaster="currentCommandMaster"
      :currentWorkflowIndex="currentWorkflowIndex"
      :results="results"
      :resultsSelected="resultsSelected"
      @workflow-button="nextWorkflowStep"
    />
    <!-- Dialog to show preexecute window -->
    <q-dialog
      v-model="displayPreExecuteCheck"
      transition-show="scale"
      transition-hide="scale"
      full-width
      no-backdrop-dismiss
    >
      <q-card class="full-width">
        <q-form
          @submit="executeCommand"
          autofocus
        >
          <q-card-section>
            <div class="text-h6">
              <q-icon
                name="mdi-help-circle"
                size="md"
              ></q-icon> {{ $t('confirm') }}
            </div>
          </q-card-section>
          <q-card-section> {{ $t('confirmMsg') }} </q-card-section>
          <q-card-section>
            <div class="text-h6">
              {{ $t('commandToBeExecuted') }}
            </div>
          </q-card-section>
          <q-card-section>
            <prism
              :code="resultCommand"
              language="powershell"
            ></prism>
          </q-card-section>
          <q-card-actions
            align="right"
            class="text-primary"
          >
            <q-btn
              v-close-popup
              :label="$t('cancel')"
              flat
            />
            <q-btn
              v-close-popup
              :label="$t('launch')"
              type="submit"
              flat
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <!-- Datatable showing all commands in main window -->
    <div class="row fit">
      <div class="col">
        <q-table
          :data="scriptsArray"
          :columns="scriptsColumns"
          :filter="searchScripts"
          :pagination.sync="scriptsPagination"
          :no-data-label="$t('noScriptsFound')"
          :no-results-label="$t('noScriptsFound')"
          :dense="denseTable"
          row-key="parameter"
          wrap-cells
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
                @click="showHelpDiag(props.row)"
                icon="help"
                dense
                round
                flat
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
                :disable="loginSkipped && props.row.usesLoginObjects"
                @click="showCommandDiag(props.row)"
                flat
              >{{ $t('launch') }}</q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { extend } from 'quasar'
import { mapGetters } from 'vuex'
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
import Prism from 'vue-prismjs'
import _ from 'lodash'
import 'src/assets/prism_tomorrowlight.css'
const childProcess = require('child_process')

export default {
  name: 'ScriptsPage',
  components: {
    Prism,
    QMarkdown
  },
  data () {
    return {
      currentCommand: {}, // User click "Execute" on datatable, chosen command is set to this object, which gets rendered with dialog
      currentCommandMaster: {}, // User click "Execute" on datatable, chosen command is set to this object, which is held as reference for workflows
      currentWorkflowIndex: 0, // Index of currently workflow step to run
      returnParams: {}, // User defined parameters from Command Dialog
      returnParamsPaginate: 1, // In multiple selection workflows allows parameters for each selection
      resultCommand: '', // Command ready to be executed, that is variables replaced for user set parameters
      results: {}, // Command result object displayed in Results Dialog
      resultsSelected: [[]], // Array of selected objects from Results Dialog
      scriptProgress: '', // Display current script execution progress
      displayCommandDiag: false, // Visibility state for command dialog
      displayHelpDiag: false, // Visibility state for help dialog
      displayResultsDiag: false, // Visibility state for results dialog
      displayPreExecuteCheck: false, // Visibility state for preexecute dialog
      displayProgressDiag: false, // Visibility state for progress dialog
      paramType: { // Table translating PowerShell variable types to Quasar components names and options
        'String': ['q-input', 'text'],
        'Number': ['q-input', 'number'],
        'ScriptBlock': ['q-input', 'textarea'],
        'Boolean': ['q-toggle', true],
        'Switch': ['q-toggle', false],
        'Select': ['q-select', false],
        'MultiSelect': ['q-select', true]
      }, // Column definitions for scripts table
      scriptsColumns: [
        { name: 'icon', label: 'Icon', classes: 'gt-xs' },
        { name: 'commandName', label: 'Command Name', align: 'left', field: row => row.commandName, classes: 'text-no-wrap' },
        { name: 'friendlyName', label: 'Friendly Name', field: row => row.friendlyName ? row.friendlyName[(this.$i18n.locale)] ? row.friendlyName[(this.$i18n.locale)] : row.friendlyName['default'] : '', classes: 'hidden' },
        { name: 'description', label: 'Description', align: 'left', field: row => row.description ? row.description[(this.$i18n.locale)] ? row.description[(this.$i18n.locale)] : row.description.default : '', classes: 'gt-sm' },
        { name: 'spacer', label: 'Spacer' },
        { name: 'help', label: 'Icon', classes: 'gt-xs' },
        { name: 'execute', label: 'Execute' }
      ],
      // table pagination options for scripts table
      scriptsPagination: { rowsPerPage: 0 }
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getLanguage', 'getSearchScripts', 'getScriptsArray', 'getCommandMaximized', 'getAlwaysConfirm', 'getHistoryLength', 'getHistoryVisible', 'getHistory', 'getDenseInput', 'getDenseTable', 'getLoginSkipped', 'getCredentialsSaved', 'getDisplayProgress']),
    language: function () {
      return this.getLanguage
    },
    searchScripts: function () {
      return this.getSearchScripts
    },
    scriptsArray: function () {
      return this.getScriptsArray
    },
    commandDialogMaximized: {
      get () {
        return this.getCommandMaximized
      },
      set (val) {
        this.$store.dispatch('lazystore/setCommandMaximized', val)
      }
    },
    alwaysConfirm: function () {
      return this.getAlwaysConfirm
    },
    historyLength: function () {
      return this.getHistoryLength
    },
    historyVisible: {
      get () {
        return this.getHistoryVisible
      },
      set (val) {
        this.$store.dispatch('lazystore/setHistoryVisible', val)
      }
    },
    history: {
      get () {
        return this.getHistory
      },
      set (val) {
        let history = _.cloneDeep(val)
        this.$store.dispatch('lazystore/setHistory', history)
      }
    },
    denseInput: function () {
      return this.getDenseInput
    },
    denseTable: function () {
      return this.getDenseTable
    },
    displayProgress: function () {
      return this.getDisplayProgress
    },
    loginSkipped: function () {
      return this.getLoginSkipped
    },
    credentialsSaved: function () {
      return this.getCredentialsSaved
    }
  },
  methods: {
    showCommandDiag (commandCtx) {
      this.currentCommand = commandCtx
      this.currentCommandMaster = commandCtx
      // Loop through parameterSets and their parameters to set default values for each parameter
      let parametersSetsNum = 1
      if (this.resultsSelected[this.currentWorkflowIndex - 1]) {
        if (this.resultsSelected[this.currentWorkflowIndex - 1].length > 1) {
          parametersSetsNum = this.resultsSelected[this.currentWorkflowIndex - 1].length
        }
      }
      for (let paramSetIndex = 1; paramSetIndex <= parametersSetsNum; paramSetIndex++) {
        for (let i = 0; i < this.currentCommand.parameters.length; i++) {
          let param = this.currentCommand.parameters[i]
          this.$set(this.returnParams, [`${paramSetIndex}__${param.parameter}`], param.value)
        }
      }
      this.displayCommandDiag = !this.displayCommandDiag
    },
    historyShowCommandDiag (commandCtx) {
      // Restore required objects from history, so user can run command again
      this.currentCommand = extend({}, commandCtx.currentCommand)
      this.currentCommandMaster = extend({}, commandCtx.currentCommandMaster)
      this.currentWorkflowIndex = commandCtx.currentWorkflowIndex
      this.returnParams = extend({}, commandCtx.returnParams)
      this.results = extend({}, commandCtx.results)
      this.$set(this.resultsSelected, [this.currentWorkflowIndex], [])
      this.displayCommandDiag = !this.displayCommandDiag
    },
    showHelpDiag (helpCtx) {
      this.currentCommand = helpCtx
      this.displayHelpDiag = !this.displayHelpDiag
    },
    showResultsDiag (resultspCtx) {
      this.results[this.currentWorkflowIndex] = resultspCtx
      this.displayResultsDiag = !this.displayResultsDiag
    },
    historyShowResultsDiag (resultspCtx) {
      this.currentCommand = extend({}, resultspCtx.currentCommand)
      this.currentCommandMaster = extend({}, resultspCtx.currentCommandMaster)
      this.currentWorkflowIndex = resultspCtx.currentWorkflowIndex
      this.results = extend({}, resultspCtx.results)
      this.$set(this.resultsSelected, [this.currentWorkflowIndex], [])
      this.displayResultsDiag = !this.displayResultsDiag
    },
    showPreExecuteCheck () {
      this.displayPreExecuteCheck = !this.displayPreExecuteCheck
    },
    showParameterHelp (param) {
      this.$q.dialog({
        title: param.parameter,
        message: `
        ${this.$t('requiredParam')}: ${param.required ? this.$t('yes') : this.$t('no')}<br>
        ${this.$t('type')}: ${param.type}<br>
        ${this.$t('help')}: ${param.hint ? param.hint[this.language] || param.hint['default'] : this.$t('none')}<br>
        ${this.$t('format')}:<br>
        <code class="text-no-wrap">${param.format ? param.format : this.$t('none')}</code>
        `,
        html: true,
        color: 'primary'
      })
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
      if (this.resultsSelected[this.currentWorkflowIndex].length > 1) {
        parametersSetsNum = this.resultsSelected[this.currentWorkflowIndex].length
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
      this.displayPreExecuteCheck = false
      this.currentCommand = {} // User click "Execute" on datatable, chosen command is set to this object, which gets rendered with dialog
      this.currentCommandMaster = {} // User click "Execute" on datatable, chosen command is set to this object, which is held as reference for workflows
      this.currentWorkflowIndex = 0 // Index of currently workflow step to run
      this.resultCommand = '' // Command ready to be executed, that is variables replaced for user set parameters
      this.returnParams = {} // User defined parameters from Command Dialog
      this.returnParamsPaginate = 1 // In multiple selection workflows allows parameters for each selection
      this.results = {} // Command result object displayed in Results Dialog
      this.resultsSelected = [[]] // Array of selected objects from Results Dialog
      // this.resultsFilter = '' // Filter for results table
    },
    // If user needs to stop PowerShell execution for whatever reason, he can smash Esc to kill process and launch new one.
    // This requires user to have credential saved in Credential Manager, otherwise CredentialObject and Session cannot be created.
    cancelCommand (key) {
      if (key.key === 'Escape') {
        this.toggleLoading()
        this.$q.loading.show({
          message: '<h6>' + this.$t('cancelling') + '</h6><p>' + this.$t('pleaseWait') + '</p>'
        })
        // Stop listening to output, hide progress dialog and reset dialog
        this.stopProgress()
        // Kill current powershell proccess
        childProcess.exec(`taskkill /f /pid ${this.$pwsh.shell.pid}`, (error, stdout, stderr) => {
          if (error) {
            console.error('Could not stop PowerShell. Original error: ', error)
          }
          // Create new PowerShell instance
          this.$pwsh.createShell((done) => {
            if (!(this.credentialsSaved) && !(this.loginSkipped)) {
              // User logged in, but did not save credentials, likely missing credentials module, redirect to login page.
              this.toggleLoading()
              this.$router.push({ path: '/' })
            } else if (this.loginSkipped) {
              // User skipped logging in, do not attempt to log in and just load plain PowerShell with empty Credential Object.
              this.$pwsh.shell.addCommand(`$Global:CredentialObject = [System.Management.Automation.PSCredential]::Empty`)
              this.$pwsh.shell.invoke().then(output => {
                // PowerShell restarted, hide loading
                this.toggleLoading()
              }).catch(e => {
                console.error(`Failed to create empty Credential Object. Error message: ${e}`)
                this.toggleLoading()
                this.$router.push({ path: '/' })
              })
            } else {
              // User has saved credentials and did not skip log in. Load credentials from Credentials Manager and log in.
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
            }
          })
        })
      }
    },
    // Processes selected results to parameters and pushes next workflow step to current command dialog
    nextWorkflowStep () {
      this.displayCommandDiag = true
      this.displayResultsDiag = false
      this.currentCommand = this.currentCommandMaster.workflow[this.currentWorkflowIndex] // Set current workflow step as currentCommand
      // For each parameter expected in passedParameters, loop through all of them and then throigh all selections to either join them to single string or insert as numbered parameters separately to returnParams
      for (let passedParamsIndex = 0; passedParamsIndex < this.currentCommand.passedParameters.length; passedParamsIndex++) {
        let parameterString = '' // Helper string for joining input arrays to single string
        for (let i = 1; i <= this.resultsSelected[this.currentWorkflowIndex].length; i++) {
          // If parameters are to be passed as array of values separated by commas to parameter withing one command, join them
          if (this.currentCommand.joinParamsAsString) {
            // First parameter value does not have join format in front of it, only subsequent ones
            if (i !== 1) {
              parameterString += this.currentCommand.passedParameters[passedParamsIndex].joinFormat
            }
            // Add value from resultsSelected for given command e.g. resultsSelected[0]['Name']
            parameterString += this.resultsSelected[this.currentWorkflowIndex][i - 1][this.currentCommand.passedParameters[passedParamsIndex].passedParamName]
          } else {
            // If parameters join method set is 'separate', set each result param to its own property with value
            this.returnParams[i + '__' + this.currentCommand.passedParameters[passedParamsIndex].parameter] = this.resultsSelected[this.currentWorkflowIndex][i - 1][this.currentCommand.passedParameters[passedParamsIndex].passedParamName]

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
      // Loop through parameterSets and their parameters to set default values for each parameter
      let parametersSetsNum = 1
      if (this.resultsSelected[this.currentWorkflowIndex].length > 1) {
        parametersSetsNum = this.resultsSelected[this.currentWorkflowIndex].length
      }
      for (let paramSetIndex = 1; paramSetIndex <= parametersSetsNum; paramSetIndex++) {
        for (let i = 0; i < this.currentCommand.parameters.length; i++) {
          let param = this.currentCommand.parameters[i]
          this.$set(this.returnParams, [`${paramSetIndex}__${param.parameter}`], param.value)
          // this.returnParams[`${paramSetIndex}__${param.parameter}`] = param.value
        }
      }
      if (this.currentCommand.joinParamsAsString) { this.resultsSelected[this.currentWorkflowIndex] = [] } // clear resultsSelected to make command dialog behave in single input mode
      this.currentWorkflowIndex++
      // Reactivity solution how to add keys to object https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
      this.$set(this.resultsSelected, [this.currentWorkflowIndex], [])
    },
    // If command or user requires confirmation before executing, display this dialog.
    preExecuteCheck () {
      this.prepareCommand()
      if (this.currentCommand.confirm || this.alwaysConfirm) {
        this.showPreExecuteCheck()
      } else {
        this.executeCommand()
      }
    },
    // Run command template through preparations, replacing template variables with user defined input
    prepareCommand () {
      // Clear resultCommand before inserting values to it
      this.resultCommand = ''
      // Always assume one set of parameters passed, unless there is more than one resultsSelected
      let parametersSetsNum = 1
      if (this.resultsSelected[this.currentWorkflowIndex - 1]) {
        if (this.resultsSelected[this.currentWorkflowIndex - 1].length > 1) {
          parametersSetsNum = this.resultsSelected[this.currentWorkflowIndex - 1].length
        }
      }
      // Loop through parameterSets and get parameters for each one to resultsCommand
      for (let paramSetIndex = 1; paramSetIndex <= parametersSetsNum; paramSetIndex++) {
        // Get commandBlock with template variables and replace with real values
        let tempResultCommand = this.currentCommand.commandBlock
        for (let i = 0; i < this.currentCommand.parameters.length; i++) {
          let param = this.currentCommand.parameters[i]
          let input = this.returnParams[paramSetIndex + '__' + param.parameter]
          // if (input.match(/(\r\n|\n|\r)/gm)) {
          //   input = `@"
          //   ${input}
          //   @"
          //   `
          // }
          if (input) {
            // If parameter has additional text format, insert it
            if (param.format) {
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
          tempResultCommand = tempResultCommand.replace(`{{__raw_argument}}`, `${this.results[this.currentWorkflowIndex - 1].output}`)
        }
        this.resultCommand += tempResultCommand + ';'
        // TODO: Possibly allow multiline strings, instead of replacing them with ';'
        this.resultCommand = this.resultCommand.replace(/(\r\n|\n|\r)/gm, ';')
      }
    },
    async executionProgress (data) {
      // Do not display ending string, which starts with EOI hash or progress delimiter, which is EOIP
      if (!data.startsWith('EOI')) {
        this.scriptProgress += data
      }
      // Try to scroll if output is too long
      this.$refs.progressDialog.scrollDown()
    },
    async stopProgress () {
      if (this.displayProgress || this.currentCommand.progress) {
        this.$pwsh.shell.streams.stdout.removeListener('data', this.executionProgress)
        setTimeout(() => {
          this.displayProgressDiag = false
          this.scriptProgress = ''
        }, 1000)
      }
    },
    executeCommand () {
      this.toggleLoading(true)
      this.$pwsh.shell.clear().then(() => {
        if (this.currentCommand.insidePsSession && !(this.loginSkipped)) {
          this.$pwsh.shell.addCommand(`Invoke-Command -Session $Global:LazyAdminPSSession -ScriptBlock {${this.resultCommand}}`)
        } else {
          this.$pwsh.shell.addCommand(this.resultCommand)
        }
        // Write output to progress window if it is still running after one second to prevent useless progress window flash for fast commands
        if (this.displayProgress || this.currentCommand.progress) {
          this.$pwsh.shell.streams.stdout.on('data', this.executionProgress)
          setTimeout(() => {
            if (this.$pwsh.shell.invocationStateInfo === 'Running') {
              this.displayProgressDiag = true
            }
          }, 1000)
        }
        this.$pwsh.shell.invoke().then(output => {
          //  Code block to handle PowerShell return data
          // Stop listening to output, hide progress dialog and reset dialog
          this.stopProgress()
          // If command emits progress end, split progress from results
          if (this.currentCommand.progress || this.currentCommand.progress) {
            let splitOutput = output.split('EOIP', 2)
            output = splitOutput[splitOutput.length - 1]
          }
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
            this.results[this.currentWorkflowIndex] = {
              error: params.error,
              returnType: 'object',
              params: params,
              output: dataArray
            }
          } catch (error) {
            if (output.trim() === '') {
              output = this.$t('powershellNoOutput')
            }
            // Result was not an array of objects or single object. Console returned error, additional text or that's how command was written.
            this.results[this.currentWorkflowIndex] = {
              error: this.currentCommand.returns !== 'raw', // If command should return raw, it is not an error (or there is no way to tell)
              returnType: 'raw',
              output: output.trim()
            }
          }
          // Save to history
          this.history = {
            date: new Date(),
            currentCommand: this.currentCommand,
            currentCommandMaster: this.currentCommandMaster,
            currentWorkflowIndex: this.currentWorkflowIndex,
            resultCommand: this.resultCommand,
            returnParams: this.returnParams,
            returnParamsPaginate: this.returnParamsPaginate,
            results: this.results
          }
          this.displayResultsDiag = true
          this.toggleLoading()
        }).catch(error => {
          // If PowerShell itself runs into problem and throws, catch and display error as raw output.
          console.error(error)
          // Stop listening to output, hide progress dialog and reset dialog
          this.stopProgress()
          this.results[this.currentWorkflowIndex] = {
            error: true,
            returnType: 'raw',
            // eslint-disable-next-line no-control-regex
            output: (error.toString().replace(/\x1b\[[0-9;]*m/g, ''))
          }
          this.displayResultsDiag = true
          this.toggleLoading()
        })
      })
    }
  }
}
</script>

<style>
.q-markdown--link {
  color: aqua;
}

.btn-param-info {
  opacity: 0.6;
}

.hint-opacity {
  opacity: 0.7;
}
</style>
