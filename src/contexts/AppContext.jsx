import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState('free') // 'free' | 'pro'
  const [currentState, setCurrentState] = useState('CA') // Default to California
  const [language, setLanguage] = useState('en') // 'en' | 'es'
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [offlineMode, setOfflineMode] = useState(false)

  // Detect user's location on app load
  useEffect(() => {
    detectLocation()
    checkOfflineStatus()
  }, [])

  const detectLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // In a real app, you'd use a geocoding service to get the state
            // For demo purposes, we'll simulate this
            console.log('Location detected:', position.coords)
            // Simulated state detection based on coordinates
            setCurrentState('CA') // Default fallback
          },
          (error) => {
            console.warn('Location detection failed:', error)
            setCurrentState('CA') // Fallback
          }
        )
      }
    } catch (error) {
      console.warn('Geolocation not available:', error)
    }
  }

  const checkOfflineStatus = () => {
    setOfflineMode(!navigator.onLine)
    
    const handleOnline = () => setOfflineMode(false)
    const handleOffline = () => setOfflineMode(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      setIsRecording(true)
      
      // In a real app, you'd implement actual recording logic here
      console.log('Recording started', stream)
      
      // Simulate recording duration tracking
      setTimeout(() => {
        stopRecording()
      }, 5000) // Auto-stop after 5 seconds for demo
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Camera/microphone access required for recording')
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    
    // Add recording to history
    const newRecording = {
      id: Date.now(),
      timestamp: new Date(),
      duration: '0:05', // Simulated
      location: currentState,
      status: 'saved'
    }
    
    setRecordings(prev => [newRecording, ...prev])
    console.log('Recording stopped and saved')
  }

  const upgradeToPro = () => {
    // In a real app, this would integrate with Stripe
    setSubscriptionStatus('pro')
    alert('Upgraded to Pro! (Demo mode)')
  }

  const value = {
    user,
    setUser,
    subscriptionStatus,
    setSubscriptionStatus,
    currentState,
    setCurrentState,
    language,
    setLanguage,
    isRecording,
    recordings,
    offlineMode,
    startRecording,
    stopRecording,
    upgradeToProc: upgradeToProc,
    detectLocation
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}