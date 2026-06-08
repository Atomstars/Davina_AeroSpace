import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App.tsx'
import { EASE_SIGNATURE } from './lib/motion'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/*
      reducedMotion="user" — Framer automatically strips transforms/layout
      animation (keeps opacity) whenever the OS requests reduced motion.
      Default transition gives a shared signature ease to any motion element
      that doesn't specify its own.
    */}
    <MotionConfig reducedMotion="user" transition={{ ease: EASE_SIGNATURE, duration: 0.6 }}>
      <App />
    </MotionConfig>
  </React.StrictMode>,
)