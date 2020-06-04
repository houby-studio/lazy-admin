<template>
  <q-page class="row justify-center items-center">
    <div class="column">
      <q-card
        square
        bordered
        class="q-pa-lg shadow-1"
      >
        <q-card-section>
          <div class="text-h2 text-center"> {{ $t('about') }} </div>
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
                <q-icon
                  v-if="appVersionStatus === 'error'"
                  name="error"
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
              v-for="info in menuEntries"
              :key="info.name"
            >
              <q-item-section avatar>
                <q-icon :name="info.icon" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ info.displayName }}</q-item-label>
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
import { mapGetters } from 'vuex'

export default {
  name: 'PageAbout',
  data () {
    return {
      updateButtonDisabled: false, // Handles Update/Restart button availability
      appVersionStatus: '', // possible values: '', 'checking', 'restart', 'uptodate', 'error'
      definitionsVersionStatus: '' // possible values: '', 'checking', 'uptodate'
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getLanguage', 'getMenuEntries', 'getMasterDefinition', 'getUpdateInProgress', 'getUpdateProgress', 'getDefinitionsUpdateInProgress', 'getRestartRequired']),
    lazyVersion: {
      get () {
        return require('electron').remote.app.getVersion()
      }
    },
    masterDefinitionVersion: function () {
      return this.getMasterDefinition.version
    },
    language: function () {
      return this.getLanguage
    },
    menuEntries: function () {
      return this.getMenuEntries
    },
    updateInProgress: function () {
      return this.getUpdateInProgress
    },
    definitionsUpdateInProgress: {
      get () {
        return this.getDefinitionsUpdateInProgress
      },
      set (val) {
        this.$store.dispatch('lazystore/setDefinitionsUpdateInProgress', val)
      }
    },
    restartRequired: {
      get () {
        return this.getRestartRequired
      },
      set (val) {
        this.$store.dispatch('lazystore/setRestartRequired', val)
      }
    },
    updateProgress: {
      get () {
        return this.getUpdateProgress
      },
      set (val) {
        this.$store.dispatch('lazystore/setUpdateProgress', val)
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
        this.$parent.$parent.$parent.updateMasterDefinition()
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

    // LazyAdminApp: Register event listener to show error when error occurs
    this.$autoUpdater.on('error', () => {
      // Change spinner to 'check' button
      this.appVersionStatus = 'error'
      this.updateButtonDisabled = false
    })

    // Master definitions: Check when update is found // TODO: REMOVE REPLACE
    this.$utils.on('update-check-done', () => {
      this.definitionsVersionStatus = 'uptodate'
    })

    // Master definitions: If fail, stop checking // TODO: REMOVE REPLACE
    this.$utils.on('update-check-error', () => {
      this.definitionsVersionStatus = 'error'
    })
  }
}
</script>
