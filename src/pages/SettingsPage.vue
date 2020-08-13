<template>
  <q-page class="row justify-center items-center">
    <div class="column">
      <q-card
        class="full-width"
        square
        bordered
      >
        <q-card-section>
          <q-toolbar-title class="text-h2 text-center">
            {{ $t('settings') }}
          </q-toolbar-title>
        </q-card-section>
        <q-card-section>
          <settings-items
            v-for="(settings, index) in settingsItems"
            v-model="settingsHelper[settings]"
            :key="index"
            :label="$t(settings)"
          ></settings-items>
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
        'displayProgress'
      ]
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getAlwaysConfirm', 'getDenseInput', 'getDenseTable', 'getDisplayProgress']),
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
    }
  }
}
</script>
