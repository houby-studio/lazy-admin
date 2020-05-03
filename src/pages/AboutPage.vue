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
          <div class="row">
            <div class="col">
              {{ $t('appVersion') }} {{ lazyVersion }}
              <q-icon
                v-if="appVersionStatus === 'uptodate'"
                name="check"
                color="white"
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
              {{ updateProgress }}
            </div>
          </div>
          <div class="row">
            <div class="col">
              {{ $t('defVersion') }} 1.0.0.0
              <q-spinner
                v-if="definitionsVersionStatus === 'checking'"
                color="primary"
                size="1.1rem"
              />
              <q-icon
                v-else
                name="check"
                color="white"
                size="1.1rem"
                v-show="definitionsVersionStatus === 'uptodate'"
              />
            </div>
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
            :disable="updateButtonDisabled"
            :label="restartRequired ? $t('restart') : $t('update')"
            @click="checkUpdateOrRestart"
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
      updateButtonDisabled: false, // Handles Update/Restart button availability
      appVersionStatus: '', // possible values: '', 'checking', 'restart', 'uptodate'
      definitionsVersionStatus: '', // possible values: '', 'checking', 'uptodate'
      definitionsVersionProgress: '' // TODO: Could this possibly hold any value?
    }
  },
  computed: {
    lazyVersion: {
      get () {
        return require('electron').remote.app.getVersion()
      }
    },
    updateInProgress: {
      get () {
        return this.$store.state.lazystore.updateInProgress
      },
      set () {
        this.$store.commit('lazystore/toggleUpdateInProgress')
      }
    },
    definitionsUpdateInProgress: {
      get () {
        return this.$store.state.lazystore.definitionsUpdateInProgress
      },
      set (val) {
        this.$store.commit('lazystore/toggleDefinitionsUpdateInProgress', val)
      }
    },
    restartRequired: {
      get () {
        return this.$store.state.lazystore.restartRequired
      },
      set () {
        this.$store.commit('lazystore/toggleRestartRequired')
      }
    },
    updateProgress: {
      get () {
        return this.$store.state.lazystore.updateProgress
      },
      set (val) {
        this.$store.commit('lazystore/updateUpdateProgress', val)
      }
    }
  },
  methods: {
    checkUpdateOrRestart () {
      if (!this.restartRequired) {
        // LazyAdminApp
        // Allow only one press of the button
        this.updateButtonDisabled = true
        // Checking creates spinner next to version
        this.appVersionStatus = 'checking'
        this.$autoUpdater.checkForUpdatesAndNotify()
        // Definitions
        this.definitionsVersionStatus = 'checking'
        // Log
        console.log('Check for updates initialized by user.')
      } else {
        // If application update was found, Update button changes to Restart and triggers this function
        console.log('Restart button pressed by user, closing the application and starting update.')
        this.$autoUpdater.quitAndInstall(false, true)
      }
    }
  },
  created () {
    // Check if update is in progress (most likely from automatic event after login) and customize variables to reflect that
    if (this.updateInProgress) {
      this.updateButtonDisabled = true
      this.appVersionStatus = 'checking'
    } else if (this.restartRequired) {
      this.appVersionStatus = 'restart'
      this.updateProgress = `${this.$t('restartRequired')}`
    }
    if (this.definitionsUpdateInProgress) {
      this.definitionsVersionStatus = 'checking'
    }

    // LazyAdminApp: Register event listener to ask for restart when update is downloaded
    this.$autoUpdater.on('update-downloaded', () => {
      // Change icon to warning and progress text to 'Restart required'
      this.appVersionStatus = 'restart'
      this.updateProgress = `${this.$t('restartRequired')}`
      this.updateButtonDisabled = false
    })

    // LazyAdminApp: Register event listener to show 'check' icon when update is not found
    this.$autoUpdater.on('update-not-available', () => {
      // Change spinner to 'check' button
      this.appVersionStatus = 'uptodate'
      // Update not found, enable 'Update' button again
      this.updateButtonDisabled = false
    })
  }
}
</script>
