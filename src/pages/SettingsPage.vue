<template>
  <q-page class="row justify-center items-center">
    <div class="column">
      <q-card
        square
        bordered
        class="q-pa-lg shadow-1"
      >
        <q-card-section>
          About
        </q-card-section>
        <q-card-section>
          Version: {{ lazyVersion }}
        </q-card-section>
        <q-card-actions class="q-px-md">
          <q-btn
            autofocus
            unelevated
            color="primary"
            size="lg"
            class="full-width"
            type="submit"
            ref="login"
            label="TODO"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'SettingsPage',
  data () {
    return {
      computerName: ''
    }
  },
  computed: {
    lazyVersion: {
      get () {
        return require('electron').remote.app.getVersion()
      }
    }
  }
}
</script>
