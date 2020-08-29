<template>
  <q-dialog
    v-model="localValue"
    @show="loadHelpDiag"
    @hide="externalHelpFile = ''"
    transition-show="scale"
    transition-hide="scale"
    full-width
    full-height
  >
    <q-card class="full-width">
      <q-card-section>
        <div class="text-h6">
          <q-icon :name="currentCommand.icon ? currentCommand.icon : 'mdi-powershell'"></q-icon> {{ currentCommand.commandName }} - {{ $t('help') }}
        </div>
      </q-card-section>
      <q-card-section>
        <div>
          <q-markdown
            :src="externalHelpFile"
            no-line-numbers
          />
        </div>
      </q-card-section>
      <floating-actions />
    </q-card>
  </q-dialog>
</template>

<script>
import FloatingActions from 'components/partials/FloatingActions'

export default {
  components: { 'floating-actions': FloatingActions },
  props: {
    value: { required: true, type: Boolean },
    currentCommand: { required: true, type: Object }
  },
  data () {
    return {
      externalHelpFile: ''
    }
  },
  computed: {
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
    loadHelpDiag () {
      this.externalHelpFile = this.$t('loadingHelp')
      if (this.currentCommand.help) {
        let helpUrl = this.currentCommand.help[this.language] ? this.currentCommand.help[this.language] : this.currentCommand.help.default
        this.$utils.downloadUrl(helpUrl, (err, result) => {
          if (err) {
            this.externalHelpFile = this.$t('externalHelpNotFound', { helpUrl: helpUrl })
            return
          }
          this.externalHelpFile = result.data
        })
      } else {
        let description = this.currentCommand.description ? this.currentCommand.description[this.language] ? this.currentCommand.description[this.language] : this.currentCommand.description.default : this.$t('noDescription')
        this.externalHelpFile = this.$t('noExternalHelp', { description: description })
      }
    }
  }
}
</script>
