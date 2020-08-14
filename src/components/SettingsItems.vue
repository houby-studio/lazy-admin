<template>
  <div class="row">
    <div class="col-12">
      <q-checkbox
        v-model="localValue"
        :label="$t(label)"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: { required: true, type: Boolean },
    label: { required: true, type: String }
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
