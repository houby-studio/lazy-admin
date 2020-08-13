<template>
  <q-list>
    <q-item>
      <q-item-section avatar>
        <q-icon name="mdi-sleep" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Lazy Admin</q-item-label>
        <q-item-label caption>{{ lazyVersion }}</q-item-label>
        <q-item-label caption>{{ updateProgress }}</q-item-label>
      </q-item-section>

      <q-item-section avatar>
        <q-icon
          v-if="appVersionStatus === 'uptodate'"
          name="check"
          color="white"
          size="1.1rem"
        />
        <q-icon
          v-if="appVersionStatus === 'error'"
          name="error"
          color="primary"
          size="1.1rem"
        />
        <q-spinner
          v-else-if="appVersionStatus === 'checking'"
          color="primary"
          size="1.1rem"
        />
        <q-icon
          v-else
          name="warning"
          color="yellow"
          size="1.1rem"
          v-show="appVersionStatus === 'restart'"
        />
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section avatar>
        <q-icon name="mdi-json" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ $t('masterDefinition') }}</q-item-label>
        <q-item-label caption>{{ masterDefinitionVersion }}</q-item-label>
      </q-item-section>

      <q-item-section avatar>
        <q-spinner
          v-if="masterDefinitionUpdateStatus === 'checking'"
          color="primary"
          size="1.1rem"
        />
        <q-icon
          v-else-if="masterDefinitionUpdateStatus === 'error'"
          name="error"
          color="primary"
          size="1.1rem"
        />
        <q-icon
          v-else
          name="check"
          color="white"
          size="1.1rem"
          v-show="masterDefinitionUpdateStatus === 'uptodate'"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
// https://simonkollross.de/posts/vuejs-using-v-model-with-objects-for-custom-components

export default {
  props: {
    lazyVersion: { required: true, type: String },
    updateProgress: { required: true, type: String },
    appVersionStatus: { required: true, type: String },
    masterDefinitionVersion: { required: true, type: String },
    masterDefinitionUpdateStatus: { required: true, type: String }
  }
}
</script>
