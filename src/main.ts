import './assets/main.css'

import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { handleRouteRedirect, routes, scrollBehavior } from './router'

export const createApp = ViteSSG(
  App,
  { routes, scrollBehavior },
  ({ router }) => {
    router.beforeEach(handleRouteRedirect)
  },
)
