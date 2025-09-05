import React, { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentLocation, getStoredLocation, storeLocationOffline } from '../services/geolocation'
import recordingService from '../services/recording'
import { demoUpgrade } from '../services/stripe'
import { createUser, getUserById, updateUserSubscription } from '../services/supabase'

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
  const [locationPermission, setLocationPermission] = useState('unknown')
  const [mediaPermission, setMediaPermission] = useState('unknown')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize app on load
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setLoading(true)
      
      // Initialize or get existing user
      await initializeUser()
      
      // Detect location
      await detectLocation()
      
      // Check offline status
      checkOfflineStatus()
      
      // Load saved recordings from localStorage for demo
      loadSavedRecordings()
      
    } catch (error) {
      console.error('App initialization failed:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const initializeUser = async () => {
    try {
      // Check if user exists in localStorage (demo mode)
      let userId = localStorage.getItem('rightsradar_user_id')
      
      if (!userId) {
        // Create new user
        userId = uuidv4()
        localStorage.setItem('rightsradar_user_id', userId)
        
        // In production, create user in database
        const { data, error } = await createUser('demo', language)
        if (error) {
          console.warn('Failed to create user in database:', error)
        }
      }
      
      // Set user data
      setUser({
        id: userId,
        authProvider: 'demo',
        createdAt: new Date().toISOString()
      })
      
      // Load user preferences
      const savedLanguage = localStorage.getItem('rightsradar_language')
      if (savedLanguage) {
        setLanguage(savedLanguage)
      }
      
      const savedSubscription = localStorage.getItem('rightsradar_subscription')
      if (savedSubscription) {
        setSubscriptionStatus(savedSubscription)
      }
      
    } catch (error) {
      console.error('User initialization failed:', error)
    }
  }

  const detectLocation = async () => {
    try {
      // First, try to get stored location
      const storedLocation = getStoredLocation()
      if (storedLocation && storedLocation.state) {
        setCurrentState(storedLocation.state)
        setLocationPermission('granted')
        return
      }

      // Try to get current location
      const location = await getCurrentLocation()
      if (location.success) {
        setCurrentState(location.state)
        setLocationPermission('granted')
        
        // Store location for offline use
        storeLocationOffline(location)
      } else {
        throw new Error(location.error)
      }
      
    } catch (error) {
      console.warn('Location detection failed:', error)
      setLocationPermission('denied')
      setCurrentState('CA') // Fallback to California
      
      // Try to use stored location as fallback
      const storedLocation = getStoredLocation()
      if (storedLocation && storedLocation.state) {
        setCurrentState(storedLocation.state)
      }
    }
  }

  const loadSavedRecordings = () => {
    try {
      const saved = localStorage.getItem('rightsradar_recordings')
      if (saved) {
        const parsedRecordings = JSON.parse(saved)
        setRecordings(parsedRecordings)
      }
    } catch (error) {
      console.warn('Failed to load saved recordings:', error)
    }
  }

  const saveRecordingsToStorage = (newRecordings) => {
    try {
      localStorage.setItem('rightsradar_recordings', JSON.stringify(newRecordings))
    } catch (error) {
      console.warn('Failed to save recordings to storage:', error)
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
      setError(null)
      
      // Start recording using the recording service
      const result = await recordingService.startRecording()
      
      if (result.success) {
        setIsRecording(true)
        setMediaPermission('granted')
        console.log('Recording started:', result)
      } else {
        throw new Error(result.error)
      }
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      setError(`Recording failed: ${error.message}`)
      setMediaPermission('denied')
      
      // Show user-friendly error message
      if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
        alert('Camera/microphone access is required for recording. Please allow access and try again.')
      } else {
        alert(`Recording failed: ${error.message}`)
      }
    }
  }

  const stopRecording = async () => {
    try {
      setError(null)
      
      // Stop recording using the recording service
      const result = await recordingService.stopRecording()
      
      if (result.success) {
        setIsRecording(false)
        
        // Create recording entry
        const newRecording = {
          id: result.recordingId,
          timestamp: result.startTime,
          endTime: result.endTime,
          duration: formatDuration(result.duration),
          location: currentState,
          status: 'saved',
          size: result.size,
          url: result.url,
          fileName: result.fileName
        }
        
        // Add to recordings list
        const updatedRecordings = [newRecording, ...recordings]
        setRecordings(updatedRecordings)
        saveRecordingsToStorage(updatedRecordings)
        
        console.log('Recording stopped and saved:', result)
        
        // In production, you would save to cloud storage here
        // await recordingService.saveRecording(result, user.id)
        
      } else {
        throw new Error(result.error)
      }
      
    } catch (error) {
      console.error('Failed to stop recording:', error)
      setError(`Failed to save recording: ${error.message}`)
      setIsRecording(false)
    }
  }

  const cancelRecording = () => {
    try {
      const result = recordingService.cancelRecording()
      if (result.success) {
        setIsRecording(false)
        console.log('Recording cancelled')
      }
    } catch (error) {
      console.error('Failed to cancel recording:', error)
      setIsRecording(false)
    }
  }

  const upgradeToPro = async () => {
    try {
      setError(null)
      
      // Use demo upgrade for development
      await demoUpgrade(user?.id, (newStatus) => {
        setSubscriptionStatus(newStatus)
        localStorage.setItem('rightsradar_subscription', newStatus)
      })
      
      console.log('Upgraded to Pro (demo mode)')
      
    } catch (error) {
      console.error('Upgrade failed:', error)
      setError(`Upgrade failed: ${error.message}`)
    }
  }

  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('rightsradar_language', newLanguage)
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const value = {
    // User data
    user,
    setUser,
    subscriptionStatus,
    setSubscriptionStatus,
    
    // Location data
    currentState,
    setCurrentState,
    locationPermission,
    
    // Language settings
    language,
    setLanguage: updateLanguage,
    
    // Recording functionality
    isRecording,
    recordings,
    mediaPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    
    // App state
    offlineMode,
    loading,
    error,
    setError,
    
    // Actions
    upgradeToPro,
    detectLocation,
    initializeApp
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
