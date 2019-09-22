<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <form class="form-inline">
          <button
            id="sidebarCollapse"
            type="button"
            class="btn btn-info mr-sm-5"
          >
            <i class="material-icons md-24">toc</i>
          </button>
          <select
            id="engine-setups"
            v-model="selectedEngineSetupId"
            class="form-control mr-sm-3"
            name="engine-setups"
          >
            <option
              v-for="setup of engineSetups"
              :key="setup.id"
              :value="setup.id"
            >
              {{ setup.name }}
            </option>
          </select>

          <button
            type="button"
            class="btn btn-primary btn-lg mr-sm-2"
            @click="translate"
          >
            <span
              v-if="isLoading"
              class="spinner-border"
              role="status"
              aria-hidden="true"
            />
            {{ $t('btnTranslate') }}
          </button>
          <button
            type="button"
            class="btn btn-info btn-lg"
            @click="clear"
          >
            {{ $t('btnClear') }}
          </button>
        </form>
      </div>
    </nav>
    <main role="main">
      <form>
        <div class="form-group">
          <textarea
            v-model="srcText"
            class="form-control"
            rows="10"
            :placeholder="$t('phSrcText')"
          />
        </div>
      </form>

      <form class="form-inline mb-sm-2">
        <select
          v-model="selectedCopyTarget"
          class="form-control mr-sm-2"
        >
          <option
            v-for="target of copyTargets"
            :key="target.id"
            :value="target.id"
          >
            {{ target.label }}
          </option>
        </select>
        <button
          type="button"
          class="btn btn-info btn-lg"
          @click="copyResults"
        >
          {{ $t('btnCopy') }}
        </button>
      </form>

      <table class="table">
        <thead>
          <th scope="col">
            {{ $t('thSrc') }}
          </th>
          <th scope="col">
            {{ $t('thTgt') }}
          </th>
        </thead>
        <tr
          v-for="(pair, index) of translationPairs"
          :key="index"
        >
          <td>{{ pair.srcText }}</td>
          <td>{{ pair.tgtText }}</td>
        </tr>
      </table>
    </main>
  </div>
</template>

<script>
import engines from '../engines'
import * as utils from '../utils'
import { createNamespacedHelpers } from 'vuex'
import { clipboard } from 'electron'

// jquery and related libraries
import $ from 'jquery'
import jm from 'jquery-mousewheel'
import mcsp from 'malihu-custom-scrollbar-plugin'
jm($)
mcsp($)
// ===

const {
  mapGetters: configGetters
} = createNamespacedHelpers('config')

export default {
  name: 'Home',

  data () {
    return {
      selectedEngineSetupId: null,
      srcText: '',
      translationPairs: [],
      copyTargets: [
        {
          id: 'both',
          label: this.$t('optBoth')
        },
        {
          id: 'source',
          label: this.$t('optSrc')
        },
        {
          id: 'target',
          label: this.$t('optTgt')
        }
      ],
      selectedCopyTarget: 'both',
      isLoading: false
    }
  },

  computed: {
    /**
     * Getters from config module
     */
    ...configGetters(['engineSetups'])
  },

  created () {
    if (this.engineSetups) {
      this.selectedEngineSetupId = this.engineSetups[0].id
    } else {
      this.selectedEngineSetupId = null
    }
  },

  mounted () {
    this.jqueryEvents()
  },

  methods: {
    /**
     * Sets up jquery events to show/hide the sidebar
     */
    jqueryEvents () {
      $('#sidebar').mCustomScrollbar({
        theme: 'minimal'
      })

      $('#sidebarCollapse').on('click', function () {
        // open or close navbar
        $('#sidebar, #content').toggleClass('active')
        // close dropdowns
        $('.collapse.in').toggleClass('in')
        // and also adjust aria-expanded attributes we use for the open/closed arrows
        // in our CSS
        $('a[aria-expanded=true]').attr('aria-expanded', 'false')
      })
    },

    /**
     * Copies sources and/or targets to clipboard.
     */
    copyResults () {
      let text
      if (this.selectedCopyTarget === 'both') {
        text = this.translationPairs.map(x => {
          return `${x.srcText}\t${x.tgtText}`
        }).join('\n')
      } else if (this.selectedCopyTarget === 'source') {
        text = this.translationPairs.map(x => {
          return x.srcText
        }).join('\n')
      } else {
        text = this.translationPairs.map(x => {
          return x.tgtText
        }).join('\n')
      }
      clipboard.writeText(text)
    },

    /**
     * Translates the source text using the selected engine setup.
     */
    async translate () {
      if (!this.selectedEngineSetupId) {
        return
      }
      const setup = this.engineSetups.find(x => x.id === this.selectedEngineSetupId)
      if (!setup) {
        return
      }

      this.isLoading = true
      const srcStrings = utils.breakIntoSentences(this.srcText, setup.srcLang)
      this.translationPairs.length = 0
      let response
      if (setup.engineId === engines.googleV2.id) {
        response = await this.$googleV2.translate({
          apiKey: setup.apiKey,
          srcStrings: srcStrings,
          srcLang: setup.srcLang,
          tgtLang: setup.tgtLang,
          format: 'text'
        }).catch(error => {
          console.log(error)
        })
      } else {
        response = await this.$microsoftV3.translate({
          apiKey: setup.apiKey,
          srcStrings: srcStrings,
          srcLang: setup.srcLang,
          tgtLang: setup.tgtLang,
          format: 'plain',
          category: 'general'
        }).catch(error => {
          console.log(error)
        })
      }
      if (response.length) {
        this.translationPairs.push(...response)
      }
      this.isLoading = false
    },

    /**
     * Clears the source text and translation results.
     */
    clear () {
      this.srcText = ''
      this.translationPairs.length = 0
    }
  }
}
</script>
