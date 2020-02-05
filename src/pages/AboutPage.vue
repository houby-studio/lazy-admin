<template>
  <q-page class="row justify-center items-center">
    <div class="column">
      <q-card
        square
        bordered
        class="q-pa-lg shadow-1"
      >
        <q-card-section>
          <div class="h1 text-h2 text-center"> {{ $t('about') }} </div>
        </q-card-section>
        <q-card-section>
          <div class="row col">
            {{ $t('appVersion') }} {{ lazyVersion }}
          </div>
          <div class="row col">
            {{ $t('defVersion') }} 0.0.0
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row col">
            Mountfield Base: 0.0.1
          </div>
          <div class="row col">
            Mountfield Azure 0.0.0
          </div>
        </q-card-section>
        <q-card-actions class="q-px-md">
          <q-btn
            autofocus
            unelevated
            color="primary"
            size="lg"
            class="full-width"
            type="submit"
            ref="update"
            :label="$t('update')"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageAbout',
  computed: {
    lazyVersion: {
      get () {
        return require('electron').remote.app.getVersion()
      }
    }
  }
}
</script>
