<template>
  <q-drawer
    v-model="localValue"
    :width="historyWidth"
    @hide="$emit('hide-drawer')"
    side="right"
    behavior="desktop"
    overlay
  >
    <div class="row fit">
      <div class="col">
        <q-table
          :data="history"
          :columns="historyColumns"
          :pagination.sync="historyPagination"
          :dense="denseTable"
          :filter="searchHistory"
          row-key="index"
          wrap-cells
          hide-bottom
          hide-header
        >
          <!-- Template showing command date -->
          <template v-slot:body-cell-date="props">
            <q-td
              :props="props"
              class="text-no-wrap"
              auto-width
            >
              {{ props.value}}
            </q-td>
          </template>
          <!-- Template showing workflow steps -->
          <template v-slot:body-cell-steps="props">
            <q-td
              :props="props"
              class="text-no-wrap"
              auto-width
            >
              {{ props.row.currentWorkflowIndex +1 }}/{{ props.row.currentCommandMaster.workflow ? props.row.currentCommandMaster.workflow.length + 1 : 1 }}
            </q-td>
          </template>
          <!-- Template showing friendly command name and 'Cmdlet' which gets executed -->
          <template v-slot:body-cell-commandName="props">
            <q-td :props="props">
              <div>
                {{ props.row.currentCommandMaster.friendlyName ? props.row.currentCommandMaster.friendlyName[language] ? props.row.currentCommandMaster.friendlyName[language] : props.row.currentCommandMaster.friendlyName.default : '' }}
              </div>
              <div>
                {{ props.row.currentCommandMaster.commandName }}
              </div>
            </q-td>
          </template>
          <!-- Template showing results button -->
          <template v-slot:body-cell-results="props">
            <q-td
              :props="props"
              auto-width
            >
              <q-btn
                @click="$emit('show-results-dialog', props.row)"
                flat
              >{{ $t('results') }}</q-btn>
            </q-td>
          </template>
          <!-- Template showing execute button -->
          <template v-slot:body-cell-execute="props">
            <q-td
              :props="props"
              auto-width
            >
              <q-btn
                :disable="loginSkipped && props.row.currentCommandMaster.usesLoginObjects"
                @click="$emit('show-command-dialog', props.row)"
                flat
              >{{ $t('repeat') }}</q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-drawer>
</template>

<script>
import { date } from 'quasar'
import { mapGetters } from 'vuex'

export default {
  props: {
    value: { required: true, type: Boolean } // historyVisible
  },
  data () {
    return {
      historyPagination: { rowsPerPage: 0 },
      historyColumns: [
        { name: 'date', label: 'Date', field: row => date.formatDate(row.date, 'YYYY-MM-DD HH:mm:ss'), classes: 'gt-xs' },
        { name: 'steps', label: 'Steps', field: row => row.currentCommandMaster.workflow ? 'workflow' : 'basic' },
        { name: 'commandName', label: 'Command Name', align: 'left', field: row => row.currentCommandMaster.commandName, classes: 'text-no-wrap' },
        { name: 'friendlyName', label: 'Friendly Name', field: row => row.currentCommandMaster.friendlyName ? row.currentCommandMaster.friendlyName[(this.$i18n.locale)] ? row.currentCommandMaster.friendlyName[(this.$i18n.locale)] : row.currentCommandMaster.friendlyName['default'] : '', classes: 'hidden' },
        { name: 'spacer', label: 'Spacer' },
        { name: 'results', label: 'results' },
        { name: 'execute', label: 'Execute' }
      ]
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getLanguage', 'getSearchHistory', 'getHistory', 'getDenseTable', 'getLoginSkipped']),
    language: function () {
      return this.getLanguage
    },
    searchHistory: function () {
      return this.getSearchHistory
    },
    history: function () {
      return this.getHistory
    },
    denseTable: function () {
      return this.getDenseTable
    },
    loginSkipped: function () {
      return this.getLoginSkipped
    },
    historyWidth: function () {
      return this.$q.screen.width
    },
    localValue: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  }
}
</script>
