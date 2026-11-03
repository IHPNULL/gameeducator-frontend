import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify.js'
import router from './router/index.js'
import './styles/retro-workstation.css'

createApp(App).use(vuetify).use(router).mount('#app')
