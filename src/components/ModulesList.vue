<template>
  <q-list>
    <q-item
      dense
      v-if="definitionsUpdateStatus === 'error'"
    >
      <q-item-section avatar>
        <q-icon
          name="error"
          color="primary"
        />
      </q-item-section>
      <q-item-label caption>{{ $t('definitionsError') }}</q-item-label>
      <q-item-section>
      </q-item-section>
    </q-item>
    <q-item
      v-for="info in value"
      :key="info.name"
    >
      <q-item-section avatar>
        <q-icon :name="info.icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ info.displayName }}</q-item-label>
        <q-item-label caption>{{ info.version }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
// https://simonkollross.de/posts/vuejs-using-v-model-with-objects-for-custom-components

export default {
  props: {
    value: { required: true, type: Array },
    definitionsUpdateStatus: { required: true, type: String }
  }
}
</script>
