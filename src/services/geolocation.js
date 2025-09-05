/**
 * Geolocation service for detecting user's state and managing location-based features
 */

// US State boundaries (simplified mapping for demo - in production, use a proper geocoding service)
const STATE_BOUNDARIES = {
  'CA': { name: 'California', lat: [32.5, 42.0], lng: [-124.4, -114.1] },
  'NY': { name: 'New York', lat: [40.5, 45.0], lng: [-79.8, -71.9] },
  'TX': { name: 'Texas', lat: [25.8, 36.5], lng: [-106.6, -93.5] },
  'FL': { name: 'Florida', lat: [24.4, 31.0], lng: [-87.6, -80.0] },
  'IL': { name: 'Illinois', lat: [37.0, 42.5], lng: [-91.5, -87.0] },
  'PA': { name: 'Pennsylvania', lat: [39.7, 42.3], lng: [-80.5, -74.7] },
  'OH': { name: 'Ohio', lat: [38.4, 41.9], lng: [-84.8, -80.5] },
  'GA': { name: 'Georgia', lat: [30.4, 35.0], lng: [-85.6, -80.8] },
  'NC': { name: 'North Carolina', lat: [33.8, 36.6], lng: [-84.3, -75.5] },
  'MI': { name: 'Michigan', lat: [41.7, 48.2], lng: [-90.4, -82.4] }
}

/**
 * Get user's current location using browser geolocation API
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} Location data with coordinates and state
 */
export const getCurrentLocation = (options = {}) => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // 5 minutes
  }

  const geoOptions = { ...defaultOptions, ...options }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const state = await getStateFromCoordinates(latitude, longitude)
          
          resolve({
            success: true,
            coordinates: {
              latitude,
              longitude,
              accuracy: position.coords.accuracy
            },
            state,
            timestamp: new Date().toISOString()
          })
        } catch (error) {
          resolve({
            success: true,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            },
            state: 'CA', // Fallback state
            timestamp: new Date().toISOString(),
            warning: 'Could not determine state, using fallback'
          })
        }
      },
      (error) => {
        let errorMessage = 'Unknown geolocation error'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }

        reject({
          success: false,
          error: errorMessage,
          code: error.code,
          fallback: {
            state: 'CA', // Default fallback
            coordinates: null
          }
        })
      },
      geoOptions
    )
  })
}

/**
 * Get state from coordinates using reverse geocoding
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<string>} State abbreviation
 */
export const getStateFromCoordinates = async (latitude, longitude) => {
  try {
    // First, try simple boundary checking (for demo purposes)
    const state = getStateFromBoundaries(latitude, longitude)
    if (state) {
      return state
    }

    // In production, you would use a proper geocoding service like:
    // - Google Maps Geocoding API
    // - Mapbox Geocoding API
    // - OpenStreetMap Nominatim
    
    // For demo, we'll simulate an API call
    const mockGeocodingResponse = await simulateGeocodingAPI(latitude, longitude)
    return mockGeocodingResponse.state || 'CA'

  } catch (error) {
    console.warn('Geocoding failed:', error)
    return 'CA' // Fallback to California
  }
}

/**
 * Simple boundary checking for major states (demo implementation)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string|null} State abbreviation or null
 */
const getStateFromBoundaries = (lat, lng) => {
  for (const [stateCode, bounds] of Object.entries(STATE_BOUNDARIES)) {
    if (lat >= bounds.lat[0] && lat <= bounds.lat[1] &&
        lng >= bounds.lng[0] && lng <= bounds.lng[1]) {
      return stateCode
    }
  }
  return null
}

/**
 * Simulate geocoding API response (for demo purposes)
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Mock geocoding response
 */
const simulateGeocodingAPI = async (latitude, longitude) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock response based on rough coordinate ranges
  if (latitude >= 32.5 && latitude <= 42.0 && longitude >= -124.4 && longitude <= -114.1) {
    return { state: 'CA', city: 'Los Angeles', country: 'US' }
  } else if (latitude >= 40.5 && latitude <= 45.0 && longitude >= -79.8 && longitude <= -71.9) {
    return { state: 'NY', city: 'New York', country: 'US' }
  } else if (latitude >= 25.8 && latitude <= 36.5 && longitude >= -106.6 && longitude <= -93.5) {
    return { state: 'TX', city: 'Houston', country: 'US' }
  }
  
  return { state: 'CA', city: 'Unknown', country: 'US' }
}

/**
 * Watch user's location for changes
 * @param {Function} callback - Callback function to handle location updates
 * @param {Object} options - Watch options
 * @returns {number} Watch ID for clearing the watch
 */
export const watchLocation = (callback, options = {}) => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000 // 1 minute
  }

  const watchOptions = { ...defaultOptions, ...options }

  if (!navigator.geolocation) {
    callback({
      success: false,
      error: 'Geolocation not supported'
    })
    return null
  }

  return navigator.geolocation.watchPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords
        const state = await getStateFromCoordinates(latitude, longitude)
        
        callback({
          success: true,
          coordinates: {
            latitude,
            longitude,
            accuracy: position.coords.accuracy
          },
          state,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        callback({
          success: false,
          error: error.message,
          fallback: { state: 'CA' }
        })
      }
    },
    (error) => {
      callback({
        success: false,
        error: `Geolocation error: ${error.message}`,
        code: error.code
      })
    },
    watchOptions
  )
}

/**
 * Clear location watch
 * @param {number} watchId - Watch ID returned by watchLocation
 */
export const clearLocationWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * Check if geolocation is available and permissions are granted
 * @returns {Promise<Object>} Permission status
 */
export const checkLocationPermission = async () => {
  try {
    if (!navigator.geolocation) {
      return {
        available: false,
        permission: 'not-supported',
        message: 'Geolocation is not supported by this browser'
      }
    }

    // Check permission status if available
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return {
        available: true,
        permission: permission.state,
        message: `Geolocation permission: ${permission.state}`
      }
    }

    // Fallback for browsers without permissions API
    return {
      available: true,
      permission: 'unknown',
      message: 'Geolocation available, permission status unknown'
    }

  } catch (error) {
    return {
      available: false,
      permission: 'error',
      message: `Error checking geolocation: ${error.message}`
    }
  }
}

/**
 * Request location permission
 * @returns {Promise<Object>} Permission request result
 */
export const requestLocationPermission = async () => {
  try {
    const location = await getCurrentLocation({ timeout: 5000 })
    return {
      granted: true,
      location,
      message: 'Location permission granted'
    }
  } catch (error) {
    return {
      granted: false,
      error: error.error || error.message,
      message: 'Location permission denied or failed'
    }
  }
}

/**
 * Get state-specific legal information
 * @param {string} stateCode - State abbreviation
 * @returns {Object} State-specific legal info
 */
export const getStateLegalInfo = (stateCode) => {
  const stateLegalData = {
    'CA': {
      name: 'California',
      stopAndIdentify: false,
      recordingLegal: true,
      searchConsent: 'required',
      specialNotes: [
        'California is not a "stop and identify" state',
        'Recording police is explicitly protected',
        'Vehicle searches require probable cause or consent'
      ]
    },
    'NY': {
      name: 'New York',
      stopAndIdentify: false,
      recordingLegal: true,
      searchConsent: 'required',
      specialNotes: [
        'No duty to identify unless arrested',
        'Recording in public is generally legal',
        'Stop and frisk requires reasonable suspicion'
      ]
    },
    'TX': {
      name: 'Texas',
      stopAndIdentify: true,
      recordingLegal: true,
      searchConsent: 'required',
      specialNotes: [
        'Must identify if lawfully arrested or detained',
        'Recording police is legal in public',
        'Vehicle searches need warrant, consent, or exigent circumstances'
      ]
    },
    'FL': {
      name: 'Florida',
      stopAndIdentify: false,
      recordingLegal: true,
      searchConsent: 'required',
      specialNotes: [
        'No stop and identify law',
        'Recording police is protected speech',
        'Consent searches must be voluntary'
      ]
    }
  }

  return stateLegalData[stateCode] || {
    name: 'Unknown State',
    stopAndIdentify: false,
    recordingLegal: true,
    searchConsent: 'required',
    specialNotes: [
      'Consult local laws for specific requirements',
      'Recording in public is generally protected',
      'You have the right to remain silent'
    ]
  }
}

/**
 * Get emergency contacts based on location
 * @param {string} stateCode - State abbreviation
 * @returns {Object} Emergency contact information
 */
export const getEmergencyContacts = (stateCode) => {
  const emergencyContacts = {
    'CA': {
      legalAid: '1-800-520-2356',
      civilRights: '1-800-884-1684',
      localACLU: '(213) 977-9500'
    },
    'NY': {
      legalAid: '1-800-342-3661',
      civilRights: '1-800-884-1684',
      localACLU: '(212) 549-2500'
    },
    'TX': {
      legalAid: '1-800-504-7030',
      civilRights: '1-800-884-1684',
      localACLU: '(713) 942-8146'
    }
  }

  return emergencyContacts[stateCode] || {
    legalAid: '1-800-504-7030',
    civilRights: '1-800-884-1684',
    localACLU: '1-800-775-3776'
  }
}

/**
 * Store location data for offline use
 * @param {Object} locationData - Location data to store
 */
export const storeLocationOffline = (locationData) => {
  try {
    localStorage.setItem('rightsradar_location', JSON.stringify({
      ...locationData,
      storedAt: new Date().toISOString()
    }))
  } catch (error) {
    console.warn('Failed to store location offline:', error)
  }
}

/**
 * Get stored location data
 * @returns {Object|null} Stored location data or null
 */
export const getStoredLocation = () => {
  try {
    const stored = localStorage.getItem('rightsradar_location')
    if (stored) {
      const data = JSON.parse(stored)
      // Check if data is less than 24 hours old
      const storedTime = new Date(data.storedAt)
      const now = new Date()
      const hoursDiff = (now - storedTime) / (1000 * 60 * 60)
      
      if (hoursDiff < 24) {
        return data
      }
    }
    return null
  } catch (error) {
    console.warn('Failed to retrieve stored location:', error)
    return null
  }
}
