<template>
  <q-page class="row justify-center items-center">
    <div class="column">
      <q-card
        class="full-width"
        square
        bordered
      >
        <q-card-section>
          <q-toolbar-title class="text-h2 text-center q-pb-sm">
            {{ $t('settings') }}
          </q-toolbar-title>
        </q-card-section>
        <q-card-section>
          <settings-items
            v-for="(settings, index) in settingsItems"
            v-model="settingsHelper[settings]"
            :key="index"
            :label="settings"
          ></settings-items>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="historyLength"
            :label="$t('historyLength')"
            :rules="[val => val && val >= 0]"
            @blur="validate(historyLength, 'historyLength', 25)"
            type="number"
          ></q-input>
          <language-picker />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SettingsPage',
  data () {
    return {
      settingsItems: [
        'alwaysConfirm',
        'denseInput',
        'denseTable',
        'displayProgress',
        'logCommand',
        'logResult'
      ]
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getAlwaysConfirm', 'getDenseInput', 'getDenseTable', 'getDisplayProgress', 'getHistoryLength', 'getLogCommand', 'getLogResult']),
    settingsHelper: function () {
      return this
    },
    alwaysConfirm: {
      get () {
        return this.getAlwaysConfirm
      },
      set (val) {
        this.$store.dispatch('lazystore/setAlwaysConfirm', val)
      }
    },
    denseInput: {
      get () {
        return this.getDenseInput
      },
      set (val) {
        this.$store.dispatch('lazystore/setDenseInput', val)
      }
    },
    denseTable: {
      get () {
        return this.getDenseTable
      },
      set (val) {
        this.$store.dispatch('lazystore/setDenseTable', val)
      }
    },
    displayProgress: {
      get () {
        return this.getDisplayProgress
      },
      set (val) {
        this.$store.dispatch('lazystore/setDisplayProgress', val)
      }
    },
    historyLength: {
      get () {
        return this.getHistoryLength
      },
      set (val) {
        this.$store.dispatch('lazystore/setHistoryLength', val)
      }
    },
    logCommand: {
      get () {
        return this.getLogCommand
      },
      set (val) {
        this.$store.dispatch('lazystore/setLogCommand', val)
      }
    },
    logResult: {
      get () {
        return this.getLogResult
      },
      set (val) {
        this.$store.dispatch('lazystore/setLogResult', val)
      }
    }
  },
  methods: {
    validate: function (value, model, defaultValue) {
      if (!value || value < 0) {
        this[model] = defaultValue
      }
    }
  }
}
</script>
