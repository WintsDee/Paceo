import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './mobile.css'
import { Capacitor } from '@capacitor/core'

// Configuration pour les plateformes mobiles
if (Capacitor.isNativePlatform()) {
  // Configuration spécifique aux plateformes mobiles
  document.body.classList.add('mobile-platform')
  
  // Prévenir le zoom sur les inputs
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)