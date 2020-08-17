<template>
  <q-layout view="hHh lpR fFf">

    <q-header
      class="window-color text-white"
      elevated
    >
      <window-titlebar
        @minimize="minimize"
        @maximize="maximize"
        @close-app="closeApp"
      ></window-titlebar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>

export default {
  name: 'LoginLayout',

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
