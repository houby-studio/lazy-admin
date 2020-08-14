<template>
  <q-list>
    <q-item
      v-if="definitionsUpdateStatus === 'error'"
      dense
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
      v-for="(item, index) in value"
      :key="index"
    >
      <q-item-section avatar>
        <q-icon :name="item.icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ item.displayName }}</q-item-label>
        <q-item-label caption>{{ item.version }}</q-item-label>
        <q-item-label caption>{{ item.updateProgress }}</q-item-label>
      </q-item-section>
      <q-item-section
        v-if="item.updateStatus"
        avatar
      >
        <update-status-icon v-model="item.updateStatus"></update-status-icon>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import UpdateStatusIcon from 'components/partials/UpdateStatusIcon.vue'

export default {
  components: { 'update-status-icon': UpdateStatusIcon },
  props: {
    value: { required: true, type: Array },
    updateProgress: { required: false, type: String },
    updateStatus: { required: false, type: String },
    definitionsUpdateStatus: { required: false, type: String }
  }
}
</script>
