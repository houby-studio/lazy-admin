<template>
  <q-layout view="hhh lpr lff">

    <q-header
      elevated
      reveal
      :reveal-offset="Infinity"
      class="window-color window-color-text"
    >
      <q-bar class="q-electron-drag q-pr-none">
        <q-icon name="navigate_next" />
        <div class="text-no-wrap hide-title">Lazy Admin</div>

        <q-space />

        <q-btn
          dense
          flat
          icon="minimize"
          @click="minimize"
          style="height: 100%"
        />
        <q-btn
          dense
          flat
          icon="crop_square"
          @click="maximize"
          style="height: 100%"
        />
        <q-btn
          dense
          flat
          icon="close"
          @click="closeApp"
          style="height: 100%"
        />
      </q-bar>

      <transition
        appear
        enter-active-class="animated fadeIn"
      >
        <q-toolbar>
          <q-btn
            dense
            flat
            round
            icon="menu"
            @click="left = !left"
          />

          <q-space />

          <q-input
            dense
            outlined
            color="white"
            label-color="white"
            v-model="searchText"
            :placeholder="$t('search')"
            style="width: 90%;"
            dark
          >
            <template v-slot:prepend>
              <q-icon
                v-if="searchText === ''"
                name="search"
                color="white"
              />
              <q-icon
                v-else
                name="clear"
                class="cursor-pointer"
                color="white"
                @click="searchText = ''"
              />
            </template>
          </q-input>

          <q-space />

          <div class="row items-center no-wrap">
            <q-btn
              round
              dense
              flat
              icon="history"
            >
              <q-tooltip>{{ $t('history') }}</q-tooltip>
            </q-btn>
          </div>

        </q-toolbar>
      </transition>
    </q-header>

    <q-drawer
      v-model="left"
      side="left"
      behavior="desktop"
      overlay
      elevated
    >
      <q-list>
        <q-item-label header>{{ $t('visibleGroups') }}</q-item-label>
        <q-item
          clickable
          to="/scripts"
          active-class="text-white"
          @click="showAll"
        >
          <q-item-section avatar>
            <q-icon name="all_inclusive" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('all') }}</q-item-label>
            <q-item-label caption>{{ $t('allDesc') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-for="menuEntry in menuEntries"
          :key="menuEntry.name"
          to="/scripts"
          active-class="text-white"
          @click="filterMenu(menuEntry.name)"
        >
          <q-item-section avatar>
            <q-icon :name="menuEntry.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ menuEntry.displayName }}</q-item-label>
            <q-item-label caption>{{ menuEntry.description }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item
          clickable
          to="/"
          active-class="dark"
        >
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('settings') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          to="/about"
          active-class="dark"
        >
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('about') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          @click="showDebugWindow"
          active-class="dark"
        >
          <q-item-section avatar>
            <q-icon name="mdi-bug" />
          </q-item-section>
          <q-item-section>
            <q-item-label>DEBUG</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <!-- Dialog to show debug window -->
      <q-dialog
        v-model="displayDebugWindow"
        transition-show="scale"
        transition-hide="scale"
        full-width
        full-height
        persistent
      >
        <q-card class="full-width">
          <q-card-section>
            <q-toolbar-title class="text-h2 text-center">
              <q-icon name="mdi-bug" /> Debug Tools
            </q-toolbar-title>
          </q-card-section>
          <q-card-section>
            <!-- TOOLS RELATED TO DEFINITIONS STATE -->
            <q-toolbar-title class="q-px-none">
              <q-icon name="mdi-json" /> Definitions
            </q-toolbar-title>
            <div class="row text-center">
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  label="Get Definitions"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                  @click="debugGetDefinitions"
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="text-h6">
                  <q-btn
                    color="primary"
                    label="Clear Definitions"
                    style="width: 90%"
                    class="q-mb-sm"
                    no-wrap
                    @click="debugClearDefinitions"
                  />
                </div>
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  label="Get Master Definition"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                  @click="debugGetMasterDefinitions"
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  label="Clear Master Definition"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                  @click="debugClearMasterDefinition"
                />
              </div>
            </div>
            <!-- TOOLS RELATED TO ELECTRON APPLICATION -->
            <q-toolbar-title class="q-px-none">
              <q-icon name="mdi-application" /> Program
            </q-toolbar-title>
            <div class="row text-center">
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  label="Open AppData"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                  @click="debugOpenAppDataPath"
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="text-h6">
                  <q-btn
                    color="primary"
                    label="Open Log"
                    style="width: 90%"
                    class="q-mb-sm"
                    no-wrap
                    @click="debugOpenLog"
                  />
                </div>
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  label="Open Install Path"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                  @click="debugOpenInstallPath"
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  label="-"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                />
              </div>
            </div>
            <!-- TOOLS RELATED TO UPDATES -->
            <q-toolbar-title class="q-px-none">
              <q-icon name="update" /> Updates
            </q-toolbar-title>
            <div class="row text-center">
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  label="Update Definitions"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                  @click="debugUpdateDefinitions"
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="text-h6">
                  <q-btn
                    color="primary"
                    label="Update Master Definition"
                    style="width: 90%"
                    class="q-mb-sm"
                    no-wrap
                    @click="debugUpdateMasterDefinition"
                  />
                </div>
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  label="Update Lazy Admin"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  label="-"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                />
              </div>
            </div>
          </q-card-section>
          <q-page-sticky
            position="bottom"
            :offset="[0, 0]"
          >
            <q-card-actions>
              <!-- Close Debug window dialog -->
              <q-btn
                icon="close"
                round
                color="primary"
                v-close-popup
              >
              </q-btn>
            </q-card-actions>
          </q-page-sticky>
        </q-card>
      </q-dialog>
      <keep-alive>
        <router-view />
      </keep-alive>
    </q-page-container>

  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
const { app, globalShortcut } = require('electron').remote
const { shell } = require('electron')
const { transports } = require('electron-log')

export default {
  name: 'FullLayout',

  data () {
    return {
      left: false, // Controls visibility of side menu
      loadToolBar: false, // Toolbar starts as hidden (false state), on 'created', animation 'animateToolBar' starts transform and displays toolbar
      displayDebugWindow: false // Controls visibility of debug window
    }
  },
  computed: {
    ...mapGetters('lazystore', ['scriptsArray', 'menuEntries', 'getSearch', 'getMasterDefinition', 'getDefinitions']),
    animateToolBar: {
      get () {
        // Toolbar starts as hidden (false state), on 'created', animation 'animateToolBar' starts transform and displays toolbar
        return this.loadToolBar ? 'animated slideInDown' : 'hidden'
      }
    },
    searchText: {
      get () {
        return this.getSearch
      },
      set (val) {
        this.$store.dispatch('lazystore/setSearch', val)
      }
    },
    language: {
      get () {
        // retrieve language preference from store
        return this.$store.state.lazystore.language
      }
    },
    masterDefinition: {
      get () {
        return this.getMasterDefinition
      },
      set (val) {
        this.$store.dispatch('lazystore/setMasterDefinition', val)
      }
    },
    definitions: {
      get () {
        return this.getDefinitions
      },
      set (val) {
        this.$store.dispatch('lazystore/setMasterDefinition', val)
      }
    },
    updateInProgress: {
      get () {
        return this.$store.state.lazystore.updateInProgress
      },
      set (val) {
        this.$store.commit('lazystore/toggleUpdateInProgress', val)
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
      set (val) {
        this.$store.commit('lazystore/toggleRestartRequired', val)
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
    minimize () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize()
      }
    },

    maximize () {
      if (process.env.MODE === 'electron') {
        const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow()

        if (win.isMaximized()) {
          win.unmaximize()
        } else {
          win.maximize()
        }
      }
    },

    closeApp () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().close()
      }
    },

    showAll () {
      this.$store.dispatch('lazystore/setScriptsFilter', Object.keys(this.$store.state.lazystore.definitions)) // Move keys getter to actions
    },

    filterMenu (name) {
      this.$store.dispatch('lazystore/setScriptsFilter', name)
    },

    showDebugWindow () {
      this.displayDebugWindow = !this.displayDebugWindow
    },

    updateMasterDefinition () {
      console.debug('Update of master definition started.')
      // Read update URL from registry
      this.$defUpdater.getRegUrl((error, masterDefinitionUrl) => {
        if (error) {
          console.error(error)
          return
        }
        console.debug('Found master definition URL: ', masterDefinitionUrl)
        // Download JSON definition from URL
        this.$defUpdater.downloadDefinitions(masterDefinitionUrl, (error, masterDefinitionResponse) => {
          if (error) {
            console.error(error)
            return
          }
          if (masterDefinitionResponse.data) {
            if (this.masterDefinition) {
              if (masterDefinitionResponse.data.version !== this.masterDefinition.version) {
                // New version found, remove all previous definitions and download everything fresh.
                console.debug('Newer version of master definition has been found.')
                console.debug(`Current stored version: ${this.masterDefinition.version}, New version: ${masterDefinitionResponse.data.version}`)
                this.masterDefinition = masterDefinitionResponse.data
                this.$store.dispatch('lazystore/clearDefinitions')
              } else {
                console.debug('Master definition file is up to date.')
              }
            } else {
              console.debug('Master definition does not yet exist, creating.')
              this.masterDefinition = masterDefinitionResponse.data
            }
          } else {
            console.error('Did not receive data from Master definition URL response.')
          }
        })
      })
    },

    updateDefinitions () {
      console.log('Manual update of script definitions started')
      for (let updateUrl of this.masterDefinition.definitionsUrl) {
        console.debug(`Downloading definitions from URL: ${updateUrl}`)
        this.$defUpdater.downloadDefinitions(updateUrl, (error, definitionsResponse) => {
          if (error) {
            console.log(error)
            return
          }
          if (definitionsResponse.data) {
            let definitionsName = Object.keys(definitionsResponse.data)[0]
            console.debug(`Updating script definitions ${definitionsName}`)
            this.$store.dispatch('lazystore/setDefinitions', definitionsResponse.data)
          } else {
            console.error(`Did not receive data from definition URL ${updateUrl} response.`)
          }
        })
      }
    },
    clearDefinitions () {
      this.$store.dispatch('lazystore/clearDefinitions')
    },

    // Functions accessed in debug window
    debugGetDefinitions () {
      console.log('DEBUG function: Showing definitions in console!', this.definitions)
    },

    debugClearDefinitions () {
      console.log('DEBUG function: Clearing definitions!')
      this.clearDefinitions()
    },

    debugGetMasterDefinitions () {
      console.log('DEBUG function: Showing master definition in console.', this.masterDefinition)
    },

    debugClearMasterDefinition () {
      console.log('DEBUG function: Clearing definitions.')
      this.$store.dispatch('lazystore/clearMasterDefinition')
    },

    debugOpenAppDataPath () {
      console.log('DEBUG function: Openining Lazy Admin\'s AppData folder.')
      shell.openItem(app.getPath('userData'))
    },

    debugOpenLog () {
      console.log('DEBUG function: Opening electron log.')
      shell.openItem(transports.file.getFile().path)
    },

    debugOpenInstallPath () {
      console.log('DEBUG function: Opening install location folder.')
      shell.openItem(app.getAppPath().slice(0, (process.env.PROD ? -18 : 0)))
    },

    debugUpdateMasterDefinition () {
      console.log('DEBUG function: Updating master definition.')
      this.updateMasterDefinition()
    },

    debugUpdateDefinitions () {
      console.log('DEBUG function: Updating scripts definitions.')
      this.updateDefinitions()
    }
  },
  created: function () {
    // Toolbar starts as hidden (false state), on 'created', animation 'animateToolBar' starts transform and displays toolbar
    this.loadToolBar = true
    // Check for application updates and download
    this.restartRequired = false // Remove potential leftover variable from previous update
    this.updateProgress = '' // Remove potential leftover variable from previous update
    this.updateInProgress = true
    this.$autoUpdater.checkForUpdatesAndNotify() // We could prevent duplicate downloads if we put this in if-condition, but closing app unexpectedly could lead to bricking updates forever
    // Check for definitions updates delayed
    this.definitionsUpdateInProgress = true
    // setTimeout(() => this.$defUpdater.checkForUpdates(this), 5000) // enable wtf
    // When master definition update was successful, start updating modules
    // this.$defUpdater.on('update-check-done', (updateStatus) => {
    //   console.log(this.definitions)
    //   setTimeout(() => this.$defUpdater.updateDefinitionsAndModules(this, updateStatus), 5000)
    //   this.definitionsUpdateInProgress = false
    // })
    // When master definition update errored, notify error
    // this.$defUpdater.on('update-check-error', () => {
    //   this.$q.notify({
    //     type: 'negative',
    //     icon: 'error',
    //     timeout: 5000,
    //     message: this.$t('definitionsError'),
    //     actions: [
    //       { label: this.$t('dismiss'), color: 'white' }
    //     ]
    //   })
    //   this.definitionsUpdateInProgress = false
    // })
    // Register event listener, which triggers when update is found
    this.$autoUpdater.on('update-available', (updateInfo) => {
      console.log(`Found new application release: Version ${updateInfo.version}; Release date ${updateInfo.releaseDate}; Setup size ${(updateInfo.files[0].size / 1024 / 1024).toFixed(2)}MB. Download started.`)
      this.$q.notify({
        icon: 'system_update',
        timeout: 2500,
        message: this.$t('updateFound'),
        actions: [
          { label: this.$t('dismiss'), color: 'primary' }
        ]
      })
    })

    // LazyAdminApp: Register event listener to show 'check' icon when update is not found
    this.$autoUpdater.on('update-not-available', () => {
      // Change spinner to 'check' button
      this.updateInProgress = false
      console.log('Lazy Admin application is already latest version.')
    })

    // Register event listener, which triggers when update is downloaded
    this.$autoUpdater.on('update-downloaded', (updateInfo) => {
      console.log(`Lazy Admin setup downloaded to ${updateInfo.downloadedFile}`)
      this.restartRequired = true
      this.updateInProgress = false
      this.$q.notify({
        icon: 'system_update',
        timeout: 5000,
        message: this.$t('downloadCompleted'),
        actions: [
          { label: this.$t('install'), color: 'primary', handler: () => { this.$autoUpdater.quitAndInstall(false, true) } }, // User can click 'Install', which closes application and starts update immediately
          { label: this.$t('dismiss'), color: 'primary' }
        ]
      })
    })

    // LazyAdminApp: Register event listener to display download progress
    this.$autoUpdater.on('download-progress', (event) => {
      this.updateProgress = `${(event.transferred / 1024 / 1024).toFixed(2)}MB ${this.$t('of')} ${(event.total / 1024 / 1024).toFixed(2)}MB`
    })

    // Register always listening function for Shift+F12 shortcut to display debug window
    globalShortcut.register('Shift+F11', () => {
      this.showDebugWindow()
    })
  },
  destroyed: function () {
    // Unregister listening function
    globalShortcut.unregister('Shift+F11')
  }
}
</script>
