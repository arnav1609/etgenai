import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import { cognitoConfig } from './authConfig'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...cognitoConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
