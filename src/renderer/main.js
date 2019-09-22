import Vue from 'vue'
// import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import bus from './plugins/bus'
import googleV2 from './plugins/googleV2'
import microsoftV3 from './plugins/microsoftV3'
import { createI18n } from './i18n/setup'

Vue.use(bus)
Vue.use(googleV2)
Vue.use(microsoftV3)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
// Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
async function createApp () {
  const i18n = await createI18n(store.getters['config/uiLang'])
  new Vue({
    components: { App },
    router,
    store,
    i18n,
    template: '<App/>'
  }).$mount('#app')
}

createApp()
