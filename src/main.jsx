import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SupabaseTest from './SupabaseTest.jsx'

const isSupabaseTest = window.location.search.includes('supabase-test')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isSupabaseTest ? <SupabaseTest /> : <App />}
  </React.StrictMode>,
)
