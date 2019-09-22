<template>
  <main role="main">
    <form>
      <div class="form-group row">
        <label
          for="ui-lang"
          class="col-sm-2 col-form-label"
        >{{ $t('lblUiLang') }}</label>
        <div class="col-sm-10">
          <select
            id="ui-lang"
            v-model="selectedUiLang"
            class="form-control"
            name="ui-lang"
          >
            <option
              v-for="language of uiLanguageOptions"
              :key="language.code"
              :value="language.code"
            >
              {{ language.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- TODO: Implement auto update -->
      <!-- <div class="form-group row align-items-center">
        <div class="col-sm-2">
          {{ $t('lblUpdates') }}
        </div>
        <div class="col-auto">
          <div class="form-check">
            <input
              id="check-for-updates-at-startup"
              v-model="selectedCheckForUpdatesAtStartup"
              class="form-check-input"
              type="checkbox"
              name="check-for-updates-at-startup"
            >
            <label
              class="form-check-label"
              for="check-for-updates-at-startup"
            >
              {{ $t('lblUpdatesDesc') }}
            </label>
          </div>
        </div>
        <div class="col-auto">
          <button
            type="button"
            class="btn btn-sm btn-info"
          >
            {{ $t('btnCheckNow') }}
          </button>
        </div>
      </div> -->
    </form>

    <hr>

    <!-- Engine Dialogs START -->
    <!-- showCreateDialog/showEditDialog -->
    <GoogleV2
      v-if="shouldShowCreateDialog(engines.googleV2.id) || shouldShowEditDialog(engines.googleV2.id)"
      :selected-engine-setup="selectedEngineSetup"
      @closeCreateDialog="closeCreateDialog"
      @closeEditDialog="closeEditDialog"
    />
    <MicrosoftV3
      v-if="shouldShowCreateDialog(engines.microsoftV3.id) || shouldShowEditDialog(engines.microsoftV3.id)"
      :selected-engine-setup="selectedEngineSetup"
      @closeCreateDialog="closeCreateDialog"
      @closeEditDialog="closeEditDialog"
    />
    <!-- Engine Dialogs END  -->

    <!-- Actions to create/edit/delete engine setups. -->
    <form class="form-inline">
      <label
        for="engine-type"
        class="mr-sm-2"
      >{{ $t('lblEngineType') }}</label>
      <select
        id="engine-type"
        v-model="selectedEngineType"
        name="engine-type"
        class="form-control mr-sm-5"
      >
        <option
          v-for="engine of engineTypes"
          :key="engine.id"
          :value="engine.id"
        >
          {{ engine.name }}
        </option>
      </select>

      <button
        type="button"
        class="btn btn-danger mr-sm-5"
        @click="deleteEngineSetup"
      >
        {{ $t('btnDelete') }}
      </button>

      <button
        type="button"
        class="btn btn-info mr-sm-2"
        @click="copyEngineSetup"
      >
        {{ $t('btnCopy') }}
      </button>

      <button
        type="button"
        class="btn btn-info mr-sm-2"
        @click="openEditDialog"
      >
        {{ $t('btnEdit') }}
      </button>

      <button
        type="button"
        class="btn btn-info mr-sm-2"
        @click="openCreateDialog"
      >
        {{ $t('btnCreate') }}
      </button>
    </form>

    <!-- List of engine setups created -->
    <ul class="list-group mt-4">
      <li
        v-for="setup of selectableEngineSetups"
        :key="setup.id"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
        :class="{active:setup.isSelected}"
        @click="selectEngineSetup(setup.id)"
      >
        {{ setup.name }}
        <span class="badge badge-info">{{ setup.type }}</span>
      </li>
    </ul>
  </main>
</template>

<script>
import engines from '../engines'
import GoogleV2 from './EngineDialogs/GoogleV2.vue'
import MicrosoftV3 from './EngineDialogs/MicrosoftV3.vue'
import langs from '../i18n/lang/langs'
import { createNamespacedHelpers } from 'vuex'

// store config module
const {
  mapGetters: configGetters,
  mapActions: configActions
} = createNamespacedHelpers('config')

export default {
  name: 'Setup',

  components: {
    GoogleV2,
    MicrosoftV3
  },

  data () {
    return {
      uiLanguageOptions: [],
      engineTypes: [],
      selectableEngineSetups: [],
      selectedEngineType: engines.googleV2.id,
      selectedEngineSetup: null,
      showCreateDialog: false,
      showEditDialog: false
    }
  },

  computed: {
    /**
     * Getters from config module
     */
    ...configGetters(['uiLang', 'checkForUpdatesAtStartup', 'engineSetups']),

    selectedUiLang: {
      get () {
        return this.uiLang
      },

      async set (value) {
        this.updateUiLang(value)
        // Dynamically switches the UI text into the selected locale
        if (!this.$i18n.messages[value]) {
          const { default: messages } = await import(`../i18n/lang/${value}.json`)
          this.$i18n.setLocaleMessage(value, messages)
        }
        this.$i18n.locale = value
        this.refreshUiLanguageOptions()
      }
    },
    selectedCheckForUpdatesAtStartup: {
      get () {
        return this.checkForUpdatesAtStartup
      },

      set (value) {
        this.updateCheckForUpdatesAtStartup(value)
      }
    },
    engines () {
      return engines
    }
  },

  created () {
    // Sort engine definitions by name
    const tmp = Object.keys(engines).map(key => engines[key])
    this.engineTypes = tmp.sort((a, b) => (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0)

    // Create a list of selectable engine setups.
    this.selectableEngineSetups.push(...this.createSelectableEngineSetups(this.engineSetups))

    this.refreshUiLanguageOptions()
  },

  methods: {
    /**
     * Actions imported from store config module.
     */
    ...configActions(['updateUiLang', 'updateCheckForUpdatesAtStartup', 'removeEngineSetup', 'cloneEngineSetup']),

    /**
     * Determines whether to show the create dialog for the engineId passed in
     */
    shouldShowCreateDialog (engineId) {
      return this.showCreateDialog && this.selectedEngineType === engineId
    },

    /**
     * Determines whether to show the edit dialog for the engineId passed in
     */
    shouldShowEditDialog (engineId) {
      return this.showEditDialog && this.selectedEngineSetup && this.selectedEngineSetup.engineId === engineId
    },

    /**
     * Selects the engine setup that matches the id passed in.
     */
    selectEngineSetup (id) {
      this.selectableEngineSetups.forEach(s => {
        if (s.id === id) {
          s.isSelected = !s.isSelected
        } else {
          s.isSelected = false
        }
      })
    },

    refreshUiLanguageOptions () {
      this.uiLanguageOptions.length = 0
      langs.forEach(x => {
        this.uiLanguageOptions.push({
          code: x,
          name: this.$t(`uiLang.${x}`)
        })
      })
    },

    /**
     * Convertes store engine setups to selectable setups by adding isSelected property.
     */
    createSelectableEngineSetups (engineSetups) {
      return engineSetups.map(x => {
        return {
          model: x,
          id: x.id,
          name: x.name,
          engineId: x.engineId,
          type: this.engineTypes.find(t => t.id === x.engineId).name,
          isSelected: false
        }
      })
    },

    /**
     * Opens the engine dialog to create an engine setup.
     */
    openCreateDialog () {
      this.selectedEngineSetup = null
      this.showCreateDialog = true
    },

    /**
     * Opens the engine dialog to edit the engine setup selected.
     */
    openEditDialog () {
      this.selectedEngineSetup = null
      this.showEditDialog = true
      const selectedOne = this.selectableEngineSetups.find(x => x.isSelected)
      if (selectedOne) {
        this.selectedEngineSetup = selectedOne.model
      }
    },

    /**
     * Event handler to close the engine dialog for create.
     * newSetup is the setup that has been created.
     */
    closeCreateDialog (newSetup) {
      console.log('closeCreateDialog', newSetup)
      this.showCreateDialog = false
      if (newSetup) {
        this.selectableEngineSetups.push(...this.createSelectableEngineSetups([newSetup]))
      }
    },

    /**
     * Event handler to close the engine dialog for edit.
     * newSetup is the setup that has been edited.
     */
    closeEditDialog (newSetup) {
      console.log('closeEditDialog', newSetup)
      this.showEditDialog = false
      this.selectedEngineSetup = null
      if (newSetup) {
        const selectableSetup = this.createSelectableEngineSetups([newSetup])[0]
        selectableSetup.isSelected = true
        const idx = this.selectableEngineSetups.findIndex(x => x.id === selectableSetup.id)
        if (idx >= 0) {
          this.selectableEngineSetups[idx] = selectableSetup
        }
      }
    },

    /**
     * Deletes the engine setup selected.
     */
    deleteEngineSetup () {
      console.log('deleteEngineSetup')
      const selectedOne = this.selectableEngineSetups.find(x => x.isSelected)
      if (selectedOne) {
        this.removeEngineSetup(selectedOne.model)
          .then(deletedSetup => {
            const idx = this.selectableEngineSetups.findIndex(x => x.id === deletedSetup.id)
            if (idx >= 0) {
              this.selectableEngineSetups.splice(idx, 1)
            }
          })
      }
    },

    /**
     * Copies the engine setup selected.
     */
    copyEngineSetup () {
      console.log('copyEngineSetup')
      const selectedOne = this.selectableEngineSetups.find(x => x.isSelected)
      if (selectedOne) {
        this.cloneEngineSetup(selectedOne.model)
          .then(copiedSetup => {
            this.selectableEngineSetups.push(...this.createSelectableEngineSetups([copiedSetup]))
          })
      }
    }
  }
}
</script>
