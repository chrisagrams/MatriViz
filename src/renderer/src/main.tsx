import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/index.css'
import App from './App'
import { Toaster } from '@renderer/components/ui/toaster'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div id="drag-region" className="w-full h-8 -webkit-app-region-drag"></div>
    <App />
    <Toaster />
  </React.StrictMode>
)
