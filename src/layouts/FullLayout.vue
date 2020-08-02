<template>
  <q-layout view="hhh lpr lff">
    <q-header
      :reveal-offset="Infinity"
      elevated
      reveal
      class="window-color window-color-text"
    >
      <q-bar class="q-electron-drag q-pr-none">
        <q-icon name="navigate_next" />
        <div class="text-no-wrap hide-title">Lazy Admin</div>

        <q-space />

        <q-btn
          @click="minimize"
          dense
          flat
          icon="minimize"
          style="height: 100%"
        />
        <q-btn
          @click="maximize"
          dense
          flat
          icon="crop_square"
          style="height: 100%"
        />
        <q-btn
          @click="closeApp"
          dense
          flat
          icon="close"
          style="height: 100%"
        />
      </q-bar>

      <transition
        appear
        enter-active-class="animated fadeIn"
      >
        <q-toolbar>
          <q-btn
            @click="left = !left"
            dense
            flat
            round
            icon="menu"
          />

          <q-space />

          <q-input
            v-model="search"
            :placeholder="$t('search')"
            :disable="$route.path !== '/scripts'"
            dense
            outlined
            color="white"
            label-color="white"
            style="width: 90%;"
          >
            <template v-slot:prepend>
              <q-icon
                v-if="search === ''"
                name="search"
                color="white"
              />
              <q-icon
                v-else
                @click="search = ''"
                name="clear"
                class="cursor-pointer"
                color="white"
              />
            </template>
          </q-input>

          <q-space />

          <div class="row items-center no-wrap">
            <q-btn
              :flat="!historyVisible"
              @click="historyVisible = !historyVisible"
              push
              round
              dense
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
          @click="showAll"
          clickable
          to="/scripts"
          active-class="text-white"
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
          v-for="menuEntry in menuEntries"
          :key="menuEntry.name"
          @click="filterMenu(menuEntry.name)"
          to="/scripts"
          active-class="text-white"
          clickable
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
          to="/settings"
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
          @click="showDebugWindow"
          clickable
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
                  @click="debugGetDefinitions"
                  color="primary"
                  label="Get Definitions"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="text-h6">
                  <q-btn
                    @click="debugClearDefinitions"
                    color="primary"
                    label="Clear Definitions"
                    style="width: 90%"
                    class="q-mb-sm"
                    no-wrap
                  />
                </div>
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  @click="debugGetMasterDefinitions"
                  color="primary"
                  label="Get Master Definition"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  @click="debugClearMasterDefinition"
                  color="primary"
                  label="Clear Master Definition"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
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
                  @click="debugOpenAppDataPath"
                  color="primary"
                  label="Open AppData"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="text-h6">
                  <q-btn
                    @click="debugOpenLog"
                    color="primary"
                    label="Open Log"
                    style="width: 90%"
                    class="q-mb-sm"
                    no-wrap
                  />
                </div>
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  @click="debugOpenInstallPath"
                  color="primary"
                  label="Open Install Path"
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
            <!-- TOOLS RELATED TO UPDATES -->
            <q-toolbar-title class="q-px-none">
              <q-icon name="update" /> Updates
            </q-toolbar-title>
            <div class="row text-center">
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  @click="debugUpdateDefinitions"
                  color="primary"
                  label="Update Definitions"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <div class="text-h6">
                  <q-btn
                    @click="debugUpdateMasterDefinition"
                    color="primary"
                    label="Update Master Definition"
                    style="width: 90%"
                    class="q-mb-sm"
                    no-wrap
                  />
                </div>
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  @click="debugUpdateApplication"
                  color="primary"
                  label="Update Lazy Admin"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-btn
                  @click="debugClearUpdateDate"
                  color="primary"
                  label="Clear Update Date"
                  style="width: 90%"
                  class="q-mb-sm"
                  no-wrap
                />
              </div>
            </div>
          </q-card-section>
          <q-page-sticky
            :offset="[0, 0]"
            position="bottom"
          >
            <q-card-actions>
              <!-- Close Debug window dialog -->
              <q-btn
                v-close-popup
                icon="close"
                round
                color="primary"
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
    ...mapGetters('lazystore', ['getLanguage', 'getMenuEntries', 'getSearchScripts', 'getSearchHistory', 'getMasterDefinition', 'getDefinitions', 'getDefinitionsUpdateInProgress', 'getRestartRequired', 'getUpdateDate', 'getUpdateInProgress', 'getUpdateProgress', 'getHistoryVisible']),
    animateToolBar: function () {
      // Toolbar starts as hidden (false state), on 'created', animation 'animateToolBar' starts transform and displays toolbar
      return this.loadToolBar ? 'animated slideInDown' : 'hidden'
    },
    search: {
      get () {
        if (this.historyVisible) {
          return this.searchHistory
        } else {
          return this.searchScripts
        }
      },
      set (val) {
        if (this.historyVisible) {
          this.searchHistory = val
        } else {
          this.searchScripts = val
        }
      }
    },
    searchScripts: {
      get () {
        return this.getSearchScripts
      },
      set (val) {
        this.$store.dispatch('lazystore/setSearchScripts', val)
      }
    },
    searchHistory: {
      get () {
        return this.getSearchHistory
      },
      set (val) {
        this.$store.dispatch('lazystore/setSearchHistory', val)
      }
    },
    language: function () {
      return this.getLanguage
    },
    menuEntries: function () {
      return this.getMenuEntries
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
    updateDate: {
      get () {
        return this.getUpdateDate
      },
      set (val) {
        this.$store.dispatch('lazystore/setUpdateDate', val)
      }
    },
    updateInProgress: {
      get () {
        return this.getUpdateInProgress
      },
      set (val) {
        this.$store.dispatch('lazystore/setUpdateInProgress', val)
      }
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
    },
    historyVisible: {
      get () {
        return this.getHistoryVisible
      },
      set (val) {
        // If currently not on /scripts page, navigate there and shortly after display history (to work around drawer hiding when changing route)
        if (this.$route.path !== '/scripts') {
          this.$router.push('/scripts')
            .then(setTimeout(() => this.$store.dispatch('lazystore/setHistoryVisible', val), 100))
        } else {
          this.$store.dispatch('lazystore/setHistoryVisible', val)
        }
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
      if (this.historyVisible) {
        this.historyVisible = false
      }
      this.left = false
      // Gets all keys from definitions object and sets it as filter, displaying scripts from all modules
      this.$store.dispatch('lazystore/setScriptsFilter', Object.keys(this.definitions))
    },

    filterMenu (name) {
      // Sets selected module key as filter, displaying scripts from said module
      if (this.historyVisible) {
        this.historyVisible = false
      }
      this.left = false
      this.$store.dispatch('lazystore/setScriptsFilter', name)
    },

    showDebugWindow () {
      this.displayDebugWindow = !this.displayDebugWindow
    },

    updateMasterDefinition () {
      console.debug('Update of master definition started.')
      // Read update URL from registry
      this.$utils.getRegUrl((error, masterDefinitionUrl) => {
        if (error) {
          console.error(error)
          this.$utils.emit('master-check-error')
          return
        }
        console.debug('Found master definition URL: ', masterDefinitionUrl)
        // Download JSON definition from URL
        this.$utils.downloadDefinitions(masterDefinitionUrl, (error, masterDefinitionResponse) => {
          if (error) {
            console.error(error)
            this.$utils.emit('master-check-error')
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
                this.$utils.emit('master-check-done', true)
              } else {
                console.debug('Master definition file is up to date.')
                this.$utils.emit('master-check-done', false)
              }
            } else {
              console.debug('Master definition does not yet exist, creating.')
              this.masterDefinition = masterDefinitionResponse.data
              this.$utils.emit('master-check-done', true)
            }
          } else {
            console.error('Did not receive data from Master definition URL response.')
            this.$utils.emit('master-check-error')
          }
        })
      })
    },

    updateDefinitions (newMasterDefinition) {
      console.debug('Update of scripts definitions started.')
      for (let updateUrl of this.masterDefinition.definitionsUrl) {
        console.debug(`Downloading definitions from URL: ${updateUrl}`)
        this.$utils.downloadDefinitions(updateUrl, (error, definitionsResponse) => {
          if (error) {
            console.error(error)
            this.$utils.emit('definitions-check-error')
            return
          }
          if (definitionsResponse.data) {
            let definitionsName = Object.keys(definitionsResponse.data)[0]
            console.debug(`Updating script definitions ${definitionsName}`)
            this.$store.dispatch('lazystore/setDefinitions', definitionsResponse.data)
            if (newMasterDefinition) { this.showAll() }
          } else {
            console.error(`Did not receive data from definition URL ${updateUrl} response.`)
            this.$utils.emit('definitions-check-error')
          }
        })
      }
    },
    clearDefinitions () {
      this.$store.dispatch('lazystore/clearDefinitions')
    },

    // Functions accessed in debug window
    debugGetDefinitions () {
      console.log('DEBUG function: Outputting definitions to console!', this.definitions)
    },

    debugClearDefinitions () {
      console.log('DEBUG function: Clearing definitions!')
      this.clearDefinitions()
    },

    debugGetMasterDefinitions () {
      console.log('DEBUG function: Outputting master definition to console.', this.masterDefinition)
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
    },

    debugUpdateApplication () {
      console.log('DEBUG function: Updating Lazy Admin application.')
      this.$autoUpdater.checkForUpdatesAndNotify()
    },

    debugClearUpdateDate () {
      console.log('DEBUG function: Clearing last update date.')
      this.updateDate = ''
    }
  },
  created: function () {
    // Toolbar starts as hidden (false state), on 'created', animation 'animateToolBar' starts transform and displays toolbar
    this.loadToolBar = true
    // Clear potential leftover variables from previous run
    this.restartRequired = false // Remove potential leftover variable from previous update
    this.updateProgress = '' // Remove potential leftover variable from previous update
    // LazyAdminApp: Register event listener, which triggers when update is found
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

    // LazyAdminApp: Register event listener to show error message when error occcurs during update
    this.$autoUpdater.on('error', (error) => {
      // Change spinner to 'check' button
      this.updateInProgress = false
      console.log('Could not download Lazy Admin update, error message:')
      console.error(error)
      this.$q.notify({
        timeout: 2500,
        multiLine: false,
        type: 'negative',
        icon: 'error',
        message: this.$t('updateError'),
        actions: [
          { label: this.$t('dismiss'), color: 'white' }
        ]
      })
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

    // Definitions: Register event listener when master definition check is done
    this.$utils.on('master-check-done', (newMasterDefinition) => {
      // Master definition check finished, fire definitions update
      this.updateDefinitions(newMasterDefinition)
      this.definitionsUpdateInProgress = false
    })

    // Register always listening function for Shift+F11 shortcut to display debug window
    globalShortcut.register('Shift+F11', () => {
      this.showDebugWindow()
    })

    // Start application update check
    this.updateInProgress = true
    this.$autoUpdater.checkForUpdatesAndNotify()
    // Check if update was done today and if not, start definitions update check
    if (this.$utils.getDate() === this.updateDate) {
      console.log('Definitions were already updated today, automatic update skipped.')
    } else {
      this.definitionsUpdateInProgress = true
      this.updateMasterDefinition()
      this.updateDate = this.$utils.getDate()
    }
  },
  destroyed: function () {
    // Unregister listening function
    globalShortcut.unregister('Shift+F11')
  }
}
</script>

<style>
/* Have to be one higher than q-drawer--right, which is history page, which occupies whole page and would hide menu */
.q-drawer--left {
  z-index: 3001;
}
</style>
