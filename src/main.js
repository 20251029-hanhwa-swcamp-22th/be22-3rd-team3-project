import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'
import 'galmuri/dist/galmuri.css'

import { setRouter } from "@/api/axios.js";

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
setRouter(router)
app.use(ElementPlus)

app.mount('#app')
