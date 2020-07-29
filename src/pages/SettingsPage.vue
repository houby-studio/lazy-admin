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
            <!-- <div class="col-12">
              <q-checkbox
                v-model="teal"
                label="Teal"
              />
              <p>Always show confirmation dialog before executing</p>
            </div> -->
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
    ...mapGetters('lazystore', ['getAlwaysConfirm']),
    alwaysConfirm: {
      get () {
        return this.getAlwaysConfirm
      },
      set (val) {
        this.$store.dispatch('lazystore/setAlwaysConfirm', val)
      }
    }
  }
}
</script>
