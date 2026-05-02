// Cart MFE bootstrap — exposed as Module Federation remote
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './index.css'

export default function mountCart(el: HTMLElement | string) {
  const app = createApp(App)
  app.use(createPinia())
  app.mount(el)
  return () => app.unmount()
}
