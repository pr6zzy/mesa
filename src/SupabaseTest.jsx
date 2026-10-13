
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing connection...')

  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase.auth.getSession()

        if (error) {
          setStatus('Connection error: ' + error.message)
        } else {
          setStatus('Supabase client connected successfully!')
        }
      } catch (err) {
        setStatus('Error: ' + err.message)
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: 24, color: 'white', background: '#120202' }}>
      <h1>Mesa — Supabase Test</h1>
      <p>{status}</p>
    </div>
  )
}
