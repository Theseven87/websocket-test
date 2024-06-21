// import './assets/main.css'
import './index.css'
import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import router from './router.ts'
import {
  UserOutlined,
  VideoCameraOutlined,
  ExclamationCircleOutlined
  // MenuUnfoldOutlined,
  // MenuFoldOutlined
} from '@ant-design/icons-vue'
const app = createApp(App)

app.component('UserOutlined', UserOutlined)
app.component('VideoCameraOutlined', VideoCameraOutlined)
app.component('ExclamationCircleOutlined', ExclamationCircleOutlined)

app.use(Antd).use(router).mount('#app')
