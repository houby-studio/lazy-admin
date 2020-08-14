<template>
  <!-- Always display buttons on the center bottom of the main window -->
  <q-page-sticky
    :offset="[0, 0]"
    position="bottom"
  >
    <q-card-actions>
      <!-- Allow objects to be exported to CSV -> exportTable -->
      <q-btn
        v-if="exportCsvButton"
        @click="$emit('export-csv')"
        icon="mdi-file-delimited"
        color="primary"
        round
      >
        <q-tooltip>
          {{ $t('exportCsv') }}
        </q-tooltip>
      </q-btn>
      <!-- Allow raw text to be copied to clipboard -->
      <q-btn
        v-if="clipboardButton"
        @click="$emit('copy-results')"
        icon="mdi-content-copy"
        color="primary"
        round
      >
        <q-tooltip>
          {{ $t('copyClipboard') }}
        </q-tooltip>
      </q-btn>
      <!-- Button to close results -->
      <q-btn
        v-close-popup
        icon="close"
        color="primary"
        round
      >
        <q-tooltip>
          {{ $t('close') }}
        </q-tooltip>
      </q-btn>
      <!-- Button to launch another workflow step -->
      <q-btn
        v-if="workflowButton"
        :disable="disableWorkflow"
        @click="$emit('next-workflow-step')"
        icon="mdi-arrow-right-bold"
        size="lg"
        color="primary"
        round
      >
        <q-tooltip>
          {{ $t('workflowContinue') }}
        </q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-page-sticky>
</template>

<script>
export default {
  props: {
    clipboardButton: { required: false, type: Boolean },
    exportCsvButton: { required: false, type: Boolean },
    workflowButton: { required: false, type: Boolean },
    disableWorkflow: { required: false, type: Boolean }
  }
}
</script>
