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
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
// import { colors } from 'quasar'
// const { systemPreferences } = require('electron').remote
// let customWindowColor = systemPreferences.getAccentColor()

// const { setBrand } = colors

// const newPrimaryColor = customWindowColor
// console.log(newPrimaryColor)
// setBrand('windowColor', '#f00')
// setBrand('primary-darkened', lighten(newPrimaryColor, -10))

export default {
  name: 'LoginLayout',

  computed: {
    windowColor () {
      let version = require('electron').remote.app.getVersion()
      return version
    }
  },
  methods: {
    // Function for electron taskbar minimize
    minimize () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize()
      }
    },

    // Function for electron taskbar maximize
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

    // Function for electron taskbar close
    closeApp () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().close()
      }
    }
  }
}
</script>

<style lang="sass">
  $window-color: $primary
</style>
