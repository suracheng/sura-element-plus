import { createApp } from 'vue'

import { CIcon } from '@c-plus/components'
import "@c-plus/theme-chalk/src/index.scss"
import App from './app.vue'

const app = createApp(App)

app.use(CIcon)
app.mount("#app")
