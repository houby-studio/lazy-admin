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
          <version-list
            :value="[{
              displayName: 'Lazy Admin',
              version: lazyVersion,
              icon: 'mdi-sleep',
              updateProgress: updateProgress,
              updateStatus: appVersionUpdateStatus
            },
            {
              displayName: $t('masterDefinition'),
              version: masterDefinitionVersion,
              icon: 'mdi-json',
              updateStatus: masterDefinitionUpdateStatus
            }]"
            :definitions-update-status="definitionsUpdateStatus"
          ></version-list>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <version-list
            v-model="menuEntries"
            :definitions-update-status="definitionsUpdateStatus"
          ></version-list>
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
  name: 'AboutPage',
  data () {
    return {
      updateButtonDisabled: false, // Handles Update/Restart button availability
      appVersionUpdateStatus: '', // possible values: '', 'checking', 'restart', 'uptodate', 'error'
      masterDefinitionUpdateStatus: '', // possible values: '', 'checking', 'uptodate'
      definitionsUpdateStatus: '' // possible values: '', 'error'
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getLanguage', 'getMenuEntries', 'getMasterDefinition', 'getUpdateInProgress', 'getUpdateProgress', 'getDefinitionsUpdateInProgress', 'getRestartRequired']),
    lazyVersion: {
      get () {
        return require('@electron/remote').app.getVersion()
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
        this.appVersionUpdateStatus = 'checking'
        this.$autoUpdater.checkForUpdatesAndNotify()
        // Definitions
        this.masterDefinitionUpdateStatus = 'checking'
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
      this.appVersionUpdateStatus = 'checking'
    } else if (this.restartRequired) {
      this.appVersionUpdateStatus = 'restart'
      this.updateProgress = `${this.$t('restartRequired')}`
    }
    if (this.definitionsUpdateInProgress) {
      this.masterDefinitionUpdateStatus = 'checking'
    }

    // LazyAdminApp: Register event listener to ask for restart when update is downloaded
    this.$autoUpdater.on('update-downloaded', () => {
      // Change icon to warning and progress text to 'Restart required'
      this.appVersionUpdateStatus = 'restart'
      this.updateProgress = `${this.$t('restartRequired')}`
      this.updateButtonDisabled = false
    })

    // LazyAdminApp: Register event listener to show 'check' icon when update is not found
    this.$autoUpdater.on('update-not-available', () => {
      // Change spinner to 'check' button
      this.appVersionUpdateStatus = 'uptodate'
      // Update not found, enable 'Update' button again
      this.updateButtonDisabled = false
    })

    // LazyAdminApp: Register event listener to show error when error occurs
    this.$autoUpdater.on('error', () => {
      // Change spinner to 'check' button
      this.appVersionUpdateStatus = 'error'
      this.updateButtonDisabled = false
    })

    // Master definition: Change status to check when update finished
    this.$utils.on('master-check-done', () => {
      this.masterDefinitionUpdateStatus = 'uptodate'
      this.definitionsUpdateStatus = '' // Clear possible previous error for scripts definitions
    })

    // Master definition: Change status to error when update errored
    this.$utils.on('master-check-error', () => {
      this.masterDefinitionUpdateStatus = 'error'
    })

    // Scripts definitions: When one definition failed, display warning above definitions
    this.$utils.on('definitions-check-error', () => {
      this.definitionsUpdateStatus = 'error'
    })
  }
}
</script>
