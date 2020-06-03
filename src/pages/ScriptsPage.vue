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
              <q-icon :name="currentCommand.icon ? currentCommand.icon : 'mdi-powershell'"></q-icon> {{ currentCommand.commandName }}
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
              :hint="`${param.required ? $t('requiredParam') : $t('optionalParam') } | ${param.type} | ${param.hint ? param.hint[language] || param.hint['default'] : ''}`"
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
              :label="$t('cancel')"
              v-close-popup
            />
            <q-btn
              flat
              type="submit"
              ref="execute"
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
            <q-icon :name="currentCommand.icon ? currentCommand.icon : 'mdi-powershell'"></q-icon> {{ $t('results', { commandName: currentCommand.commandName }) }}
          </div>
        </q-card-section>
        <q-card-section>
          <!-- Check which type of result was returned -->
          <div v-if="results.returnType === 'object'">
            <q-table
              :data="results.output"
              :columns="resultsColumns"
              row-key="name"
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
      returnParams: {}, // User defined parameters from Command Dialog
      results: {}, // Command result object displayed in Results Dialog
      displayCommandDiag: false,
      displayHelpDiag: false,
      displayResultsDiag: false,
      scriptsColumns: [
        { name: 'icon', align: 'center', label: 'Icon', field: row => row.icon, sortable: true },
        { name: 'commandName', required: true, label: 'Command Name', align: 'left', field: row => row.commandName, format: val => `${val}`, sortable: true },
        { name: 'friendlyName', label: 'Friendly Name', align: 'left', field: row => row.friendlyName ? row.friendlyName[(this.$i18n.locale)] ? row.friendlyName[(this.$i18n.locale)] : row.friendlyName['default'] : '', format: val => `${val}`, sortable: true, classes: 'hidden' },
        { name: 'description', align: 'left', label: 'Description', field: row => row.description ? row.description[(this.$i18n.locale)] ? row.description[(this.$i18n.locale)] : row.description.default : '', sortable: true, classes: 'gt-sm' },
        { name: 'spacer', align: 'center', label: 'Spacer', field: '', sortable: false, classes: 'full-width' },
        { name: 'favorite', align: 'center', label: 'Icon', field: 'star', sortable: true },
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
    ...mapGetters('lazystore', ['getLanguage', 'getSearch', 'getScriptsArray', 'getDefinitions']),
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
    resultsColumns: {
      get () {
        let columns = []
        for (let i = 0; i < this.results.params.length; i++) {
          let definition = { name: this.results.params[i], align: 'left', label: this.results.params[i], field: this.results.params[i], sortable: true }
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
    executeCommand () {
      // Insert parameter variables to command template
      let resultCommand = this.currentCommand.commandBlock
      for (let i = 0; i < this.currentCommand.parameters.length; i++) {
        let param = this.currentCommand.parameters[i]
        let input = this.returnParams[param.parameter]
        if (input) {
          // If parameter has additional text format, insert it
          if (param.format) {
            resultCommand = resultCommand.replace(`{{${param.parameter}}}`, `${param.format}`)
          }
          // If parameter was supplied, insert param in place of template variable
          resultCommand = resultCommand.replace(`{{${param.parameter}}}`, `${input}`)
        } else {
          // If paramter was not supplied, remove template variable
          resultCommand = resultCommand.replace(`{{${param.parameter}}}`, '')
        }
      }
      this.$q.loading.show()
      // TODO: Save command to history
      this.$pwsh.clear().then(() => {
        if (this.currentCommand.insidePsSession) {
          this.$pwsh.addCommand(`Invoke-Command -Session $Global:LazyAdminPSSession -ScriptBlock {${resultCommand}}`)
        } else {
          this.$pwsh.addCommand(resultCommand)
        }
        this.$pwsh.invoke().then(output => {
          //  Code block to handle PowerShell return data
          let data
          let params
          let dataArray = []
          try {
            // Cast data to JSON, if this fails, display data as raw output
            data = JSON.parse(output)
            try {
              params = Object.keys(data[0]) // Get param names from array
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
          this.$q.loading.hide()
        }).catch(error => {
          // If PowerShell itself runs into problem and throws, catch and display error as raw output.
          console.log(error)
          this.results = {
            error: true,
            returnType: 'raw',
            output: error
          }
          this.displayResultsDiag = true
          this.$q.loading.hide()
        })
      })
    }
  }
}
</script>
