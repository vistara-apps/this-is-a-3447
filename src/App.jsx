import React from 'react'
import { AppProvider } from './contexts/AppContext'
import AppShell from './components/AppShell'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <AppProvider>
      <AppShell>
        <Dashboard />
      </AppShell>
    </AppProvider>
  )
}

export default App