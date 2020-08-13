<template>
  <div class="row">
    <div class="col-12">
      <q-checkbox
        :label="$t(label)"
        v-model="localValue"
      />
    </div>
  </div>
</template>

<script>
// https://simonkollross.de/posts/vuejs-using-v-model-with-objects-for-custom-components

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
