<template>
  <div
    class="modal"
    style="display: block"
    tabindex="-1"
    role="dialog"
  >
    <div
      class="modal-dialog mw-100 w-75"
      role="document"
    >
      <div class="modal-content">
        <div class="modal-header">
          <!-- Dialog Title -->
          <h5 class="modal-title">
            {{ title }}
          </h5>
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
            @click="cancel"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- Engine-specific content -->
          <form>
            <!-- Name -->
            <div class="form-group row">
              <label
                for="name"
                class="col-sm-2 col-form-label"
              >{{ $t('lblName') }}</label>
              <div class="col-sm-10">
                <input
                  id="name"
                  v-model="name"
                  type="text"
                  class="form-control"
                  name="name"
                  :placeholder="$t('phName')"
                >
              </div>
            </div>

            <!-- API Key -->
            <div class="form-group row">
              <label
                for="api-key"
                class="col-sm-2 col-form-label"
              >{{ $t('lblApiKey') }}</label>
              <div class="col-sm-10">
                <input
                  id="api-key"
                  v-model="apiKey"
                  type="text"
                  class="form-control"
                  name="api-key"
                  :placeholder="$t('phApiKey')"
                >
              </div>
            </div>

            <!-- Source Language -->
            <div class="form-group row">
              <label
                for="src-lang"
                class="col-sm-2 col-form-label"
              >{{ $t('lblSrcLang') }}</label>
              <div :class="{'col-sm-10': !isLoading, 'col-sm-8': isLoading}">
                <select
                  id="src-lang"
                  v-model="srcLang"
                  name="src-lang"
                  class="form-control"
                >
                  <option
                    v-for="language of languages"
                    :key="language.code"
                    :value="language.code"
                  >
                    {{ language.name }}
                  </option>
                </select>
              </div>

              <div
                v-if="isLoading"
                class="col"
              >
                <div
                  class="spinner-border text-info mt-1"
                  role="status"
                >
                  <span class="sr-only">{{ $t('lblLoading') }}</span>
                </div>
              </div>
            </div>

            <!-- Target language -->
            <div class="form-group row">
              <label
                for="tgt-lang"
                class="col-sm-2 col-form-label"
              >{{ $t('lblTgtLang') }}</label>
              <div :class="{'col-sm-10': !isLoading, 'col-sm-8': isLoading}">
                <select
                  id="tgt-lang"
                  v-model="tgtLang"
                  name="tgt-lang"
                  class="form-control"
                >
                  <option
                    v-for="language of languages"
                    :key="language.code"
                    :value="language.code"
                  >
                    {{ language.name }}
                  </option>
                </select>
              </div>
              <div
                v-if="isLoading"
                class="col"
              >
                <div
                  class="spinner-border text-info mt-1"
                  role="status"
                >
                  <span class="sr-only">{{ $t('lblLoading') }}</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            @click="saveChanges"
          >
            {{ $t('btnSave') }}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            data-dismiss="modal"
            @click="cancel"
          >
            {{ $t('btnCancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*
 * GoogleV2 engine setup definition
 * ================================
 * {
 *    id: Unique id. Automatically assigned by createEngineSetup() in store/modules/config.js
 *    engineId: Engine type
 *    name: Setup name
 *    apiKey: API Key
 *    srcLang: Source language code (e.g., ja)
 *    tgtLang: Target language code (e.g., en)
 * }
 */
import { createNamespacedHelpers } from 'vuex'
import engines from '../../engines'

// config module
const {
  mapActions: configActions,
  mapGetters: configGetters
} = createNamespacedHelpers('config')

export default {
  props: {
    selectedEngineSetup: {
      type: Object,
      required: false,
      default: null
    }
  },

  data () {
    return {
      name: '',
      apiKey: '',
      srcLang: 'ja',
      tgtLang: 'en',
      languages: [],
      isLoading: false
    }
  },

  computed: {
    /**
     * Getters from config module
     */
    ...configGetters(['uiLang']),

    formValid () {
      return this.name && this.apiKey && this.srcLang && this.tgtLang
    },

    /**
     * Dialog title passed from the parent component
     */
    title () {
      return engines.googleV2.name
    },

    /**
     * Returns the name of dialog close event,
     * closeEditDialog for edit operation, closeCreateDialog for create operation
     */
    closeEventName () {
      return this.selectedEngineSetup ? 'closeEditDialog' : 'closeCreateDialog'
    }
  },

  watch: {
    /**
     * Watches apiKey and reloads the language list as it changes.
     */
    apiKey (newVal, oldVal) {
      this.loadLanguages()
    }
  },

  mounted () {
    // Add event listener to capture ESC key event for closing the dialog.
    document.addEventListener('keyup', this.cancel)

    if (this.selectedEngineSetup) {
      this.name = this.selectedEngineSetup.name
      this.apiKey = this.selectedEngineSetup.apiKey
      this.srcLang = this.selectedEngineSetup.srcLang
      this.tgtLang = this.selectedEngineSetup.tgtLang
    }
  },

  beforeDestroy () {
    document.removeEventListener('keyup', this.cancel)
  },

  methods: {
    /**
     * Actions from config module
     */
    ...configActions(['createEngineSetup', 'updateEngineSetup']),

    /**
     * Saves the field values to vuex store and closes the dialog.
     */
    saveChanges () {
      console.log('saveChanges')
      if (this.formValid) {
        if (!this.selectedEngineSetup) {
          this.createEngineSetup({
            engineId: engines.googleV2.id,
            name: this.name,
            apiKey: this.apiKey,
            srcLang: this.srcLang,
            tgtLang: this.tgtLang
          }).then(newSetup => {
            // Emit closeCreateDailog with the setup that has been added
            this.$emit(this.closeEventName, newSetup)
          })
        } else {
          this.updateEngineSetup({
            id: this.selectedEngineSetup.id,
            engineId: engines.googleV2.id,
            name: this.name,
            apiKey: this.apiKey,
            srcLang: this.srcLang,
            tgtLang: this.tgtLang
          }).then(newSetup => {
            // Emit closeEditDailog with the setup that has been updated
            this.$emit(this.closeEventName, newSetup)
          })
        }
      }
    },

    /**
     * Closes the dialog without saving.
     */
    cancel (e) {
      console.log(e.type)
      if (e.type === 'keyup') {
        if (e.keyCode === 27) {
          this.$emit(this.closeEventName)
        }
      } else {
        this.$emit(this.closeEventName)
      }
    },

    /**
     * Fetches available languages and populates the source/target language select fields
     */
    async loadLanguages () {
      this.isLoading = true
      this.languages.length = 0
      const response = await this.$googleV2.getLanguages({
        apiKey: this.apiKey,
        tgtLang: this.uiLang
      }).catch(error => {
        console.log(error)
      })
      if (response) {
        this.languages.push(...response)
      }
      this.isLoading = false
    }
  }
}
</script>
