import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

export default function mountAuth(el: HTMLElement | string) {
  const container = typeof el === 'string' ? document.querySelector(el) : el
  if (!container) {
    throw new Error('Auth MFE mount point not found')
  }

  const app = createApp(App)
  app.mount(container)

  return () => {
    app.unmount()
  }
}
