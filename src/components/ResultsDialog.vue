<template>
  <q-dialog
    v-model="localValue"
    @hide="resetData"
    transition-show="scale"
    transition-hide="scale"
    full-width
    full-height
    no-backdrop-dismiss
  >
    <q-card class="full-width">
      <q-card-section>
        <div class="text-h6">
          <q-icon :name="currentCommandMaster.icon ? currentCommandMaster.icon : 'mdi-powershell'"></q-icon> {{ $t('resultsTitle', { commandName: currentCommandMaster.commandName }) }} {{ currentWorkflowIndex +1 }}/{{ currentCommandMaster.workflow ? currentCommandMaster.workflow.length + 1 : 1 }}
        </div>
      </q-card-section>
      <q-card-section>
        <!-- Check which type of result was returned -->
        <div v-if="results[currentWorkflowIndex] ? results[currentWorkflowIndex].returnType === 'object' : false">
          <q-table
            :data="results[currentWorkflowIndex].output"
            :columns="resultsColumns"
            :pagination.sync="outputPagination"
            :selection="resultsTableSelection"
            :selected.sync="resultsSelected[currentWorkflowIndex]"
            :filter="resultsFilter"
            :dense="denseTable"
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
            v-if="results[currentWorkflowIndex]"
            :value="results[currentWorkflowIndex].output"
            @keyup.enter.stop
            type="textarea"
            readonly
            autogrow
            borderless
          />
        </div>
      </q-card-section>
      <floating-actions
        :export-csv-button="results[currentWorkflowIndex] ? results[currentWorkflowIndex].returnType === 'object' : false"
        :clipboard-button="results[currentWorkflowIndex] ? results[currentWorkflowIndex].returnType === 'raw' : false"
        :workflow-button="currentCommandMaster.workflow ? currentWorkflowIndex < currentCommandMaster.workflow.length : false"
        :disable-workflow="(resultsSelected[currentWorkflowIndex].length === 0 && results[currentWorkflowIndex] ? results[currentWorkflowIndex].returnType !== 'raw' : false) || (loginSkipped && currentCommandMaster.usesLoginObjects)"
        @export-csv="exportCsv"
        @copy-results="copyResults"
        @next-workflow-step="$emit('workflow-button')"
      ></floating-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { exportFile, copyToClipboard } from 'quasar'
import { mapGetters } from 'vuex'
import { stringify } from 'csv'
import FloatingActions from 'components/partials/FloatingActions'

export default {
  components: { 'floating-actions': FloatingActions },
  props: {
    value: { required: true, type: Boolean },
    currentCommandMaster: { required: true, type: Object },
    currentWorkflowIndex: { required: true, type: Number },
    results: { required: true, type: Object },
    resultsSelected: { required: true, type: Array }
  },
  data () {
    return {
      resultsFilter: '',
      outputPagination: { rowsPerPage: 0 }
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getDenseTable', 'getLoginSkipped']),
    denseTable: function () {
      return this.getDenseTable
    },
    loginSkipped: function () {
      return this.getLoginSkipped
    },
    resultsColumns: {
      get () {
        let columns = [
          // Auto generated __id column for workflow commands
          { name: '__id', align: 'left', label: '__id', field: row => row.__id, classes: 'hidden', headerClasses: 'hidden' }
        ]
        // For every parameter received from command, generate column definition.
        for (let i = 0; i < this.results[this.currentWorkflowIndex].params.length; i++) {
          let definition = { name: this.results[this.currentWorkflowIndex].params[i], align: 'left', label: this.results[this.currentWorkflowIndex].params[i], field: this.results[this.currentWorkflowIndex].params[i], sortable: true }
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
    },
    localValue: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    resetData () {
      this.resultsFilter = ''
      this.outputPagination.rowsPerPage = 0
    },
    copyResults () {
      copyToClipboard(this.results[this.currentWorkflowIndex].output).then(() => {
        this.$q.notify({
          icon: 'check',
          color: 'positive',
          position: 'bottom-left',
          timeout: 1500,
          message: this.$t('copied')
        })
      }).catch()
    },
    exportCsv () {
      stringify(this.results[this.currentWorkflowIndex].output, {
        delimiter: ';',
        header: true,
        quoted: true
      }, (err, content) => {
        if (err) { }
        const status = exportFile(
          `${this.currentCommandMaster.commandName}.csv`,
          content,
          'text/csv'
        )

        if (status !== true) {
          this.$q.notify({
            icon: 'warning',
            color: 'negative',
            position: 'bottom-left',
            timeout: 1500,
            message: this.$t('csvExportError')
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
      })
    }
  }
}
</script>
