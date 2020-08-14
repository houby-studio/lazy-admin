<template>
  <q-bar class="q-electron-drag q-pr-none">
    <q-icon name="navigate_next" />
    <div class="text-no-wrap hide-title">Lazy Admin</div>

    <q-space />

    <q-btn
      @click="$emit('minimize')"
      icon="minimize"
      style="height: 100%"
      dense
      flat
    />
    <q-btn
      @click="$emit('maximize')"
      icon="crop_square"
      style="height: 100%"
      dense
      flat
    />
    <q-btn
      @click="$emit('close-app')"
      icon="close"
      style="height: 100%"
      dense
      flat
    />
  </q-bar>
</template>

<script>
export default {}
</script>
