<template>
  <q-bar class="q-electron-drag q-pr-none">
    <q-icon name="navigate_next" />
    <div class="text-no-wrap hide-title">Lazy Admin</div>

    <q-space />

    <q-btn
      @click="$emit('minimize')"
      dense
      flat
      icon="minimize"
      style="height: 100%"
    />
    <q-btn
      @click="$emit('maximize')"
      dense
      flat
      icon="crop_square"
      style="height: 100%"
    />
    <q-btn
      @click="$emit('close-app')"
      dense
      flat
      icon="close"
      style="height: 100%"
    />
  </q-bar>
</template>

<script>
// https://simonkollross.de/posts/vuejs-using-v-model-with-objects-for-custom-components

export default {}
</script>
