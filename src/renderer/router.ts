import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'
import routerConfig from './pages/layout/routerConfig.json'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: () => '/ws'
  },
  {
    path: '/info',
    name: 'Info',
    component: () => import('./pages/info/index.vue')
  }
]
const createRouterData = () => {
  routerConfig.forEach((item) => {
    routes.push({
      path: `/${item.id}`,
      name: item.label,
      component: () => import(`./pages/${item.component}/index.vue`)
    })
  })
}

createRouterData()
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
