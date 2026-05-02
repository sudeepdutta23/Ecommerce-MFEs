import React from 'react'
import ReactDOM from 'react-dom/client'
import { ProductsApp } from './bootstrap.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProductsApp />
  </React.StrictMode>,
)
