import Vue from 'vue'
import App from './App.vue'

//fontawesome
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faLocationCrosshairs, faSearch } from '@fortawesome/free-solid-svg-icons'
/* add icons to the library */
library.add(faLocationCrosshairs, faSearch)
/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon)
//

//axios
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)
//

//google map related
import * as VueGoogleMaps from 'vue2-google-maps'
Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyB9R-_5fp3z2zBoNF3S0mkhE__-nJ2O3qM',
    libraries: 'places',
  },
  installComponents: true,
})
Vue.component('google-map', VueGoogleMaps.Map);
Vue.component('google-map-marker', VueGoogleMaps.Marker);
//

//Bootstrap-vue
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
//

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')