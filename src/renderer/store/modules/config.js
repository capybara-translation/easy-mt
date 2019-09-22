import {uuid} from '../../utils'
export default {
  namespaced: true,
  state () {
    return {
      // Selected source language
      srcLang: 'ja',
      // Selected target language
      tgtLang: 'en',
      // Selected UI language
      uiLang: 'ja',
      // True to check for updates when the app is started
      checkForUpdatesAtStartup: false,
      // Engine setups
      engineSetups: []
    }
  },
  getters: {
    srcLang: state => state.srcLang,
    tgtLang: state => state.tgtLang,
    uiLang: state => state.uiLang,
    checkForUpdatesAtStartup: state => state.checkForUpdatesAtStartup,
    engineSetups: state => state.engineSetups
  },
  mutations: {
    setSrcLang (state, value) {
      state.srcLang = value
    },
    setTgtLang (state, value) {
      state.tgtLang = value
    },
    setUiLang (state, value) {
      state.uiLang = value
    },
    setCheckForUpdatesAtStartup (state, value) {
      state.checkForUpdatesAtStartup = value
    },
    addEngineSetup (state, value) {
      state.engineSetups.push(value)
    },
    deleteEngineSetup (state, value) {
      const idx = state.engineSetups.findIndex(x => x.id === value.id)
      if (idx >= 0) {
        state.engineSetups.splice(idx, 1)
      }
    },
    editEngineSetup (state, value) {
      const idx = state.engineSetups.findIndex(x => x.id === value.id)
      if (idx >= 0) {
        state.engineSetups[idx] = value
      }
    }
  },
  actions: {
    updateSrcLang ({commit}, lang) {
      commit('setSrcLang', lang)
    },
    updateTgtLang ({commit}, lang) {
      commit('setTgtLang', lang)
    },
    updateUiLang ({commit}, lang) {
      commit('setUiLang', lang)
    },
    updateCheckForUpdatesAtStartup ({commit}, value) {
      commit('setCheckForUpdatesAtStartup', value)
    },
    createEngineSetup ({commit, state}, engineSetup) {
      return new Promise((resolve) => {
        engineSetup.id = uuid()
        commit('addEngineSetup', engineSetup)
        resolve(engineSetup)
      })
    },
    removeEngineSetup ({commit}, engineSetup) {
      return new Promise((resolve) => {
        commit('deleteEngineSetup', engineSetup)
        resolve(engineSetup)
      })
    },
    updateEngineSetup ({commit}, engineSetup) {
      return new Promise((resolve) => {
        commit('editEngineSetup', engineSetup)
        resolve(engineSetup)
      })
    },
    cloneEngineSetup ({commit, state}, engineSetup) {
      return new Promise((resolve) => {
        let copiedSetup = Object.assign({}, engineSetup)
        copiedSetup.id = uuid()
        commit('addEngineSetup', copiedSetup)
        resolve(copiedSetup)
      })
    }
  }
}
