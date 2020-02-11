<template>
  <q-layout view="hhh lpr lff">

    <q-header
      elevated
      reveal
      :reveal-offset="Infinity"
      class="window-color window-color-text"
    >
      <q-bar class="q-electron-drag">
        <q-icon name="navigate_next" />
        <div class="text-no-wrap hide-title">Lazy Admin</div>

        <q-space />

        <q-btn
          dense
          flat
          icon="minimize"
          @click="minimize"
        />
        <q-btn
          dense
          flat
          icon="crop_square"
          @click="maximize"
        />
        <q-btn
          dense
          flat
          icon="close"
          @click="closeApp"
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
        <q-item-label header>{{ $t('commands') }}</q-item-label>
        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="all_inclusive" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('all') }}</q-item-label>
            <q-item-label caption>{{ $t('allDesc') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="mdi-powershell" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mountfield Base</q-item-label>
            <q-item-label caption>Sada obecných skriptů</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="mdi-azure" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mountfield Azure</q-item-label>
            <q-item-label caption>Správa Azure infrastruktury</q-item-label>
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
      left: false,
      loadToolBar: false,
      search: ''
    }
  },
  computed: {
    lazyVersion () {
      let version = require('electron').remote.app.getVersion()
      return version
    },
    animateToolBar: {
      get () {
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
    }
  },
  created: function () {
    this.loadToolBar = true
  }
}
</script>

<style lang="sass">
  .fkn-white
    color: white !important
</style>
