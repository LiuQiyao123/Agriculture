import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'element-plus/theme-chalk/dark/css-vars.css'

// Import our custom styles LAST to ensure they override everything else.
import './style.scss'

const app = createApp(App)

app.use(router)
app.mount('#app')
