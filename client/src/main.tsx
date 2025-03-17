import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import AdminPanel from './AdminPanel.tsx'
// import AdminLogin from './AdminLogin.tsx'
// import PrivateRoute from './PrivateRoute.tsx'
// import { AuthProvider } from './AuthContext.tsx'
import './index.css'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      {/* Removed AuthProvider to bypass authentication */}
      <Routes>
        <Route path="/" element={<App />} />
        {/* Removed login and private route, direct access to AdminPanel */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
