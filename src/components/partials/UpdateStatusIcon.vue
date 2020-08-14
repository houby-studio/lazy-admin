<template>
  <div>
    <q-icon
      v-if="value === 'uptodate'"
      name="check"
      color="white"
      size="1.1rem"
    />
    <q-icon
      v-if="value === 'error'"
      name="error"
      color="primary"
      size="1.1rem"
    />
    <q-spinner
      v-else-if="value === 'checking'"
      color="primary"
      size="1.1rem"
    />
    <q-icon
      v-show="value === 'restart'"
      v-else
      name="warning"
      color="yellow"
      size="1.1rem"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: { required: true, type: String }
  }
}
</script>
