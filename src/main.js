import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 全局css
import './assets/css/globle.css'
// 导入字体样式图标
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
//配置请求和根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http =axios


Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
