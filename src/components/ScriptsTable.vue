<template>
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
              @click="$emit('show-help',(props.row))"
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
              @click="$emit('show-command', (props.row))"
              flat
            >{{ $t('launch') }}</q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      scriptsColumns: [
        { name: 'icon', label: 'Icon', classes: 'gt-xs' },
        { name: 'commandName', label: 'Command Name', align: 'left', field: row => row.commandName, classes: 'text-no-wrap' },
        { name: 'friendlyName', label: 'Friendly Name', field: row => row.friendlyName ? row.friendlyName[(this.$i18n.locale)] ? row.friendlyName[(this.$i18n.locale)] : row.friendlyName['default'] : '', classes: 'hidden' },
        { name: 'description', label: 'Description', align: 'left', field: row => row.description ? row.description[(this.$i18n.locale)] ? row.description[(this.$i18n.locale)] : row.description.default : '', classes: 'gt-sm' },
        { name: 'spacer', label: 'Spacer' },
        { name: 'help', label: 'Icon', classes: 'gt-xs' },
        { name: 'execute', label: 'Execute' }
      ],
      scriptsPagination: { rowsPerPage: 0 }
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getLanguage', 'getSearchScripts', 'getScriptsArray', 'getDenseTable', 'getLoginSkipped']),
    language: function () {
      return this.getLanguage
    },
    searchScripts: function () {
      return this.getSearchScripts
    },
    scriptsArray: function () {
      return this.getScriptsArray
    },
    denseTable: function () {
      return this.getDenseTable
    },
    loginSkipped: function () {
      return this.getLoginSkipped
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
