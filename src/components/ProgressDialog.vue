<template>
  <q-dialog
    v-model="localValue"
    transition-show="slide-up"
    transition-hide="slide-down"
    position="bottom"
    full-width
  >
    <q-card
      class="full-width"
      ref="progressCard"
    >
      <q-card-section>
        <q-markdown
          :src="progress"
          ref="progressCode"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    value: { required: true, type: Boolean },
    progress: { required: true, type: String }
  },
  computed: {
    localValue: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    scrollDown () {
      setTimeout(() => {
        try {
          this.$refs.progressCard.$el.scrollTo(0, this.$refs.progressCode.$el.clientHeight)
        } catch { }
      }, 100)
    }
  }
}
</script>
