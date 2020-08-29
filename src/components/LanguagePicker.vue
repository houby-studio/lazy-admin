<template>
  <q-select
    v-model="language"
    :options="langOptions"
    :label="$t('language')"
    borderless
    emit-value
    map-options
    style="min-width: 150px"
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('lazystore', ['getLanguage', 'getCustomLanguage', 'getUpdateDate']),
    langOptions: {
      get () {
        return this.$i18n.availableLocales.map(e => { return { value: e, label: this.$i18n.messages[e].languageName } })
      }
    },
    language: {
      get () {
        return this.getLanguage
      },
      set (val) {
        this.$store.dispatch('lazystore/setLanguage', val)
      }
    },
    customLanguage: {
      get () {
        return this.getCustomLanguage
      },
      set (val) {
        this.$store.dispatch('lazystore/setCustomLanguage', val)
      }
    },
    updateDate: function () {
      return this.getUpdateDate
    }
  },
  watch: {
    language (language) {
      // When language is changed in store, update locale
      this.$i18n.locale = language
    }
  },
  methods: {
    setLang () {
      let language = Object.keys(this.customLanguage)[0]
      this.$i18n.setLocaleMessage(language, this.customLanguage[language])
    },
    processCustomLang () {
      // Check if update was done today and if not, fetch possible additional language
      if (this.$utils.getDate() === this.updateDate) {
        // Update already done today, use vuex cache
        this.setLang()
      } else {
        this.fetchLanguageFromUrl((err, result) => {
          if (err) {
            console.warn('Failed to update custom language.', err)
          }
          this.setLang()
        })
      }
    },
    fetchLanguageFromUrl (done) {
      this.$utils.getRegLanguage((err, result) => {
        if (err) {
          // Custom language registry may not exist on most systems, we do not want to throw error.
          return done(null, 'Did not find custom language entry in registry, loading cached translation.')
        }
        this.$utils.downloadUrl(result, (err, definition) => {
          if (err) {
            return done(Error('Failed to download custom language translation file, loading cached translation.'))
          }
          // Save downloaded language to vuex, so it is accessible even when update fails
          this.customLanguage = definition.data
          return (null, 'Succesfully fetched latest translation file.')
        })
      })
    }
  },
  created: function () {
    this.processCustomLang()
  }
}
</script>
