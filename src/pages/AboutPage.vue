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
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list>
            <q-item
              v-for="info in definitionsInfo"
              :key="info.name"
            >
              <q-item-section avatar>
                <q-icon :name="info.icon" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ info.displayName ? info.displayName[language] || info.displayName['default'] : '' }}</q-item-label>
                <q-item-label caption>{{ info.version }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
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
    masterDefinitionVersion: {
      get () {
        return this.$store.state.lazystore.masterDefinition.version
      }
    },
    language: {
      get () {
        // retrieve language preference from store
        return this.$store.state.lazystore.language
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
    },
    definitionsInfo: {
      get () {
        return this.$store.state.lazystore.definitionsMenu
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
