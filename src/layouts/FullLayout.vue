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
          v-for="menuEntry in definitionsMenu"
          :key="menuEntry.name"
          to="/scripts"
          active-class="text-white"
          @click="filterMenu(menuEntry.name)"
        >
          <q-item-section avatar>
            <q-icon :name="menuEntry.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ menuEntry.displayName ? menuEntry.displayName[language] || menuEntry.displayName['default'] : '' }}</q-item-label>
            <q-item-label caption>{{ menuEntry.description ? menuEntry.description[language] || menuEntry.description['default'] : '' }}</q-item-label>
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

      </q-list>
    </q-drawer>

    <q-page-container>
      <keep-alive>
        <router-view />
      </keep-alive>
    </q-page-container>

  </q-layout>
</template>

<script>
export default {
  name: 'FullLayout',

  data () {
    return {
      left: false, // Controls visibility of side menu
      loadToolBar: false // Toolbar starts as hidden (false state), on 'created', animation 'animateToolBar' starts transform and displays toolbar
    }
  },
  computed: {
    lazyVersion () {
      let version = require('electron').remote.app.getVersion()
      return version
    },
    animateToolBar: {
      get () {
        // Toolbar starts as hidden (false state), on 'created', animation 'animateToolBar' starts transform and displays toolbar
        return this.loadToolBar ? 'animated slideInDown' : 'hidden'
      }
    },
    searchText: {
      get () {
        return this.$store.state.lazystore.search
      },
      set (val) {
        this.$store.commit('lazystore/updateSearch', val)
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
    definitions: {
      get () {
        return this.$store.state.lazystore.definitions
      }
    },
    definitionsMenu: {
      get () {
        return this.$store.state.lazystore.definitionsMenu
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
      this.$store.commit('lazystore/updateScriptsFilter', Object.keys(this.$store.state.lazystore.definitions))
      this.$store.commit('lazystore/updateScriptsArray')
    },

    filterMenu (name) {
      this.$store.commit('lazystore/updateScriptsFilter', name)
      this.$store.commit('lazystore/updateScriptsArray')
    },

    async displayMenu () {
      if (Object.keys(this.$store.state.lazystore.definitions).length === 0) {
        setTimeout(() => {
          this.displayMenu()
        }, 1000)
      } else {
        this.$store.commit('lazystore/updateDefinitionsMenu')
      }
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
    setTimeout(() => this.$defUpdater.checkForUpdates(this), 5000)
    // When master definition update was successful, start updating modules
    this.$defUpdater.on('update-check-done', (updateStatus) => {
      console.log(this.definitions)
      setTimeout(() => this.$defUpdater.updateDefinitionsAndModules(this, updateStatus), 5000)
      this.definitionsUpdateInProgress = false
    })
    // When master definition update errored, notify error
    this.$defUpdater.on('update-check-error', () => {
      this.$q.notify({
        type: 'negative',
        icon: 'error',
        timeout: 5000,
        message: this.$t('definitionsError'),
        actions: [
          { label: this.$t('dismiss'), color: 'white' }
        ]
      })
      this.definitionsUpdateInProgress = false
    })
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

    // Create menu entries
    this.displayMenu()
  },
  watch: {
    definitions: function () {
      setTimeout(() => this.displayMenu(), 500)
    }
  }
}
</script>
