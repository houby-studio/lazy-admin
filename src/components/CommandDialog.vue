<template>
  <q-dialog
    v-model="localValue"
    :full-width="commandDialogMaximized"
    :full-height="commandDialogMaximized"
    @hide="$emit('hide')"
    transition-show="scale"
    transition-hide="scale"
    no-backdrop-dismiss
  >
    <q-card class="full-width">
      <q-form
        @submit="$emit('submit')"
        @reset="resetForm"
        autofocus
      >
        <q-card-section>
          <div class="row">
            <div class="col">
              <div class="text-h6 float-left">
                <q-icon :name="currentCommandMaster.icon ? currentCommandMaster.icon : 'mdi-powershell'"></q-icon> {{ currentCommandMaster.commandName }} {{ currentWorkflowIndex +1 }}/{{ currentCommandMaster.workflow ? currentCommandMaster.workflow.length + 1 : 1 }}
              </div>
            </div>
            <div class="col">
              <q-card-actions
                align="right"
                class="text-primary q-pa-none"
              >
                <q-btn
                  :ripple="false"
                  :icon="commandDialogMaximized ? 'fas fa-compress-alt' : 'fas fa-expand-alt'"
                  @click="commandDialogMaximized = !commandDialogMaximized"
                  tabindex="-1"
                  flat
                />
              </q-card-actions>
            </div>
          </div>

        </q-card-section>
        <q-card-section class="q-pt-none">
          <!-- Login buttons -->
          <div
            v-if="currentCommandMaster.login"
            class="q-mb-sm"
          >
            <q-btn
              v-for="object in currentCommandMaster.login"
              :key="object.name"
              :label="$t(loggedInServices[object.name] ? 'loginDone' : 'loginRequired', { name: object.name })"
              :icon="loggedInServices[object.name] ? 'mdi-account-check' : 'mdi-login-variant'"
              :color="loggedInServices[object.name] ? 'green' : 'red'"
              @click="showLoginCommand(object)"
              class="full-width q-my-sm"
              no-wrap
              no-caps
            />
          </div>
          <!-- Workflows only - Previous command parameters -->
          <q-expansion-item
            v-if="currentCommand.passedParameters ? currentCommand.passedParameters.length > 0 : false"
            :default-opened="resultsSelected[currentWorkflowIndex].length > 1"
            :caption="$t('workflowReadOnly')"
            :label="$t('workflowParameters')"
            :dense="denseInput"
            icon="mdi-cogs"
            expand-separator
          >
            <q-input
              v-for="param in currentCommand.passedParameters"
              v-model="returnParams[returnParamsPaginate + '__' + param.parameter]"
              :label="param.parameter"
              :key="param.parameter"
              :dense="denseInput"
              type="text"
              hide-bottom-space
              standout
              readonly
            ></q-input>
          </q-expansion-item>
          <q-separator
            v-if="currentCommand.passedParameters ? currentCommand.passedParameters.length > 0 : false"
            spaced
          ></q-separator>
          <!-- Command parameters -->
          <div
            v-for="(param, index) in currentCommand.parameters"
            :key="param.parameter"
            class="q-mb-sm"
          >
            <component
              v-model="returnParams[returnParamsPaginate + '__' + param.parameter]"
              :tabindex="index + 1"
              :is="paramType[param.type][0]"
              :toggle-indeterminate="paramType[param.type][1]"
              :false-value="paramType[param.type][1] ? 'false' : false"
              :label="param.parameter"
              :label-color="param.required ? 'primary' : ''"
              :rules="param.required ? [ val => val && val.length > 0 || $t('requiredField') ] : [] "
              :type="paramType[param.type][1]"
              :dense="denseInput"
              :options="param.options"
              :multiple="paramType[param.type][1]"
              @keydown.enter.prevent
              bottom-slots
              filled
              clearable
              lazy-rules
            >
              <!-- Template showing parameter informatin button -->
              <template v-slot:append>
                <q-btn
                  @click.capture.stop="showParameterHelp(param)"
                  padding="none"
                  class="btn-param-info"
                  icon="info"
                  dense
                  round
                  flat
                ></q-btn>
              </template>
              <!-- Template showing parameter information button -->
              <template v-slot:counter>
                <p>{{ param.required ? $t('requiredParam') : $t('optionalParam') }} | {{ param.type }}</p>
              </template>
            </component>
            <!-- Hint for components which lack native hint slot -->
            <span
              v-if="param.type === 'Boolean' || param.type === 'Switch'"
              class="hint-opacity text-caption float-right"
            >
              <q-btn
                @click="showParameterHelp(param)"
                padding="none"
                class="btn-param-info"
                size="sm"
                icon="info"
                dense
                round
                flat
              ></q-btn>
              {{ param.required ? $t('requiredParam') : $t('optionalParam') }} | {{ param.type }}
            </span>
          </div>
        </q-card-section>
        <!-- Actions for command dialog -->
        <q-card-actions
          align="right"
          class="text-primary"
        >
          <!-- Show pagination if there is more than one selected result from previous command -->
          <q-pagination
            v-if="resultsSelected[currentWorkflowIndex -1 ] ? resultsSelected[currentWorkflowIndex-1].length > 1 : false"
            v-model="returnParamsPaginate"
            :max="resultsSelected[currentWorkflowIndex-1].length"
            :input="true"
          >
          </q-pagination>
          <q-btn
            v-close-popup
            :label="$t('cancel')"
            tabindex="1000"
            flat
          />
          <q-btn
            :label="$t('reset')"
            type="reset"
            tabindex="999"
            flat
          />
          <q-btn
            :label="$t('launch')"
            :autofocus="currentCommand.parameters ? currentCommand.parameters.length === 0 : false"
            type="submit"
            tabindex="998"
            flat
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    value: { required: true, type: Boolean },
    currentCommand: { required: true, type: Object },
    currentCommandMaster: { required: true, type: Object },
    currentWorkflowIndex: { required: true, type: Number },
    resultsSelected: { required: true, type: Array },
    returnParams: { required: true, type: Object }
  },
  data () {
    return {
      returnParamsPaginate: 1, // In multiple selection workflows allows parameters for each selection
      paramType: { // Table translating PowerShell variable types to Quasar components names and options
        'String': ['q-input', 'text'],
        'Number': ['q-input', 'number'],
        'ScriptBlock': ['q-input', 'textarea'],
        'Switch': ['q-toggle', false],
        'Boolean': ['q-toggle', true],
        'Select': ['q-select', false],
        'MultiSelect': ['q-select', true]
      }
    }
  },
  computed: {
    ...mapGetters('lazystore', ['getCommandMaximized', 'getDenseInput', 'getLoggedinServices']),
    commandDialogMaximized: {
      get () {
        return this.getCommandMaximized
      },
      set (val) {
        this.$store.dispatch('lazystore/setCommandMaximized', val)
      }
    },
    denseInput: function () {
      return this.getDenseInput
    },
    loggedInServices: {
      get () {
        return this.getLoggedinServices
      },
      set (val) {
        this.$store.dispatch('lazystore/setLoggedinServices', val)
      }
    },
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
    resetForm () {
      // Always assume one set of parameters passed, unless there is more than one resultsSelected
      let parametersSetsNum = 1
      if (this.resultsSelected[this.currentWorkflowIndex].length > 1) {
        parametersSetsNum = this.resultsSelected[this.currentWorkflowIndex].length
      }
      // Loop through parameterSets and get parameters for each one to resultsCommand
      for (let paramSetIndex = 1; paramSetIndex <= parametersSetsNum; paramSetIndex++) {
        for (let i = 0; i < this.currentCommand.parameters.length; i++) {
          this.returnParams[paramSetIndex + '__' + this.currentCommand.parameters[i].parameter] = ''
        }
      }
    },
    showLoginCommand (object) {
      this.$q.dialog({
        title: object.name,
        message: object.description,
        color: 'primary',
        ok: this.$t('login'),
        cancel: true
      }).onOk(() => {
        // Should open external window with login object
        this.$pwsh.shell.addCommand(object.commandBlock)
        this.$pwsh.shell.invoke().then(o => {
          // Set service as logged in
          // TODO: Move logic to vuex, actions, add clear on powershell restart and application restart
          let temp = {}
          temp[object.name] = true
          this.loggedInServices = Object.assign({}, this.loggedInServices, temp)
          console.log(`Login command for ${object.name} executed succesfully.`)
          this.$q.notify({
            timeout: 2000,
            icon: 'info',
            multiLine: false,
            message: this.$t('loginSuccesful'),
            actions: [
              { label: this.$t('dismiss'), color: 'primary' }
            ]
          })
        }).catch(e => {
          console.error(`Attempt to login to ${object.name} failed with error: ${e}`)
          this.$q.notify({
            timeout: 5000,
            multiLine: false,
            type: 'negative',
            icon: 'error',
            message: this.$t('failedToLogin'),
            actions: [
              { label: this.$t('dismiss'), color: 'white' }
            ]
          })
        })
      })
    },
    showParameterHelp (param) {
      this.$q.dialog({
        title: param.parameter,
        message: `
        ${this.$t('requiredParam')}: ${param.required ? this.$t('yes') : this.$t('no')}<br>
        ${this.$t('type')}: ${param.type}<br>
        ${this.$t('help')}: ${param.hint ? param.hint[this.language] || param.hint['default'] : this.$t('none')}<br>
        ${this.$t('format')}:<br>
        <code class="text-no-wrap">${param.format ? param.format : this.$t('none')}</code>
        `,
        html: true,
        color: 'primary'
      })
    }
  }
}
</script>
