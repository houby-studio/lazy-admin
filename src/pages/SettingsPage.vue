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
          <div class="row">
            <div class="col-12">
              <q-checkbox
                v-model="alwaysConfirm"
                :label="$t('alwaysConfirm')"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <q-checkbox
                v-model="denseInput"
                :label="$t('inputDense')"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <q-checkbox
                v-model="denseTable"
                :label="$t('tableDense')"
              />
            </div>
          </div>
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
      test: ''
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getAlwaysConfirm', 'getDenseInput', 'getDenseTable']),
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
    }
  }
}
</script>
