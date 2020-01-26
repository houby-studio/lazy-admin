<template>
  <q-layout view="hHh lpR fFf">

    <q-header
      elevated
      class="bg-primary text-white"
    >
      <q-bar class="q-electron-drag">
        <q-icon name="navigate_next" />
        <div>Lazy Admin</div>

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

      <q-toolbar>
        <q-btn
          dense
          flat
          round
          icon="menu"
          @click="left = !left"
        />

        <q-toolbar-title>
          PowerShell
        </q-toolbar-title>

        <div>Logged in as{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="left"
      side="left"
      overlay
      elevated
    >
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
export default {
  name: 'MyLayout',

  data () {
    return {
      left: false
    }
  },
  computed: {
    lazyVersion () {
      let version = require('electron').remote.app.getVersion()
      return version
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
  }
}
</script>
