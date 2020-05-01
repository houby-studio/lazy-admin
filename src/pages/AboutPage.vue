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
            {{ $t('appVersion') }} {{ lazyVersion }} {{ appVersionProgress }}
          </div>
          <div class="row col">
            {{ $t('defVersion') }} TODO
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
            @click="checkUpdate"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageAbout',
  data () {
    return {
      appVersionProgress: '',
      definitionsVersionProgress: ''
    }
  },
  computed: {
    lazyVersion: {
      get () {
        return require('electron').remote.app.getVersion()
      }
    }
  },
  methods: {
    checkUpdate () {
      const { autoUpdater } = this.$q.electron.remote.require('electron-updater')
      autoUpdater.checkForUpdatesAndNotify()
    }
  },
  created () {
    const { autoUpdater } = this.$q.electron.remote.require('electron-updater')
    // Register event listener to display download progress
    autoUpdater.on('download-progress', (event) => {
      this.appVersionProgress = `${(event.transferred / 1024 / 1024).toFixed(2)}MB ${this.$t('of')} ${(event.total / 1024 / 1024).toFixed(2)}MB`
    })
    // Register event listener to restart required when download is complete
    autoUpdater.on('update-downloaded', () => {
      this.appVersionProgress = `⚠ Restart required`
    })
    // TODO: Add other events to handle GUI events https://www.electronjs.org/docs/api/auto-updater#events
  }
}
</script>
