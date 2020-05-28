<template>
  <div class="fixed-center text-center">
    <p>
      <q-icon
        name="error"
        size="xl"
      />
    </p>
    <p class="text-faded">{{ $t('errorPage') }}</p>
    <q-btn
      color="primary"
      style="width:200px;"
      v-go-back.single
      :label="$t('goBack')"
    />
  </div>
</template>

<script>
export default {
  name: 'Error404'
}
</script>
