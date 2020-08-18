<template>
  <q-dialog
    v-model="localValue"
    transition-show="scale"
    transition-hide="scale"
    full-width
    no-backdrop-dismiss
  >
    <q-card class="full-width">
      <q-form
        @submit="$emit('execute-command')"
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
            autofocus
            flat
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import Prism from 'vue-prismjs'
export default {
  components: { Prism },
  props: {
    value: { required: true, type: Boolean },
    resultCommand: { required: true, type: String }
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
  }
}
</script>
