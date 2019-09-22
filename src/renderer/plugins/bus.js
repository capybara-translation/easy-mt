// Event bus plugin
const bus = {
  install: function (Vue, options) {
    Vue.prototype.$bus = new Vue()
  }
}
export default bus
