import Vue from 'vue'
import TestApp from './TestApp.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(TestApp),
}).$mount('#app')
