import { v4 as uuidv4 } from 'uuid'
import { uploadRecording, saveRecordedInteraction } from './supabase'
import { getCurrentLocation } from './geolocation'

/**
 * Recording service for handling audio/video recording functionality
 */

class RecordingService {
  constructor() {
    this.mediaRecorder = null
    this.stream = null
    this.recordedChunks = []
    this.isRecording = false
    this.recordingStartTime = null
    this.recordingId = null
  }

  /**
   * Start recording audio/video
   * @param {Object} options - Recording options
   * @returns {Promise<Object>} Recording start result
   */
  async startRecording(options = {}) {
    try {
      const defaultOptions = {
        video: true,
        audio: true,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        audioBitsPerSecond: 128000   // 128 kbps
      }

      const recordingOptions = { ...defaultOptions, ...options }

      // Request media permissions
      const constraints = {
        video: recordingOptions.video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: recordingOptions.audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Initialize MediaRecorder
      const mimeType = this.getSupportedMimeType()
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        videoBitsPerSecond: recordingOptions.videoBitsPerSecond,
        audioBitsPerSecond: recordingOptions.audioBitsPerSecond
      })

      // Set up event handlers
      this.setupRecorderEventHandlers()

      // Generate recording ID
      this.recordingId = uuidv4()
      this.recordingStartTime = new Date()
      this.recordedChunks = []

      // Start recording
      this.mediaRecorder.start(1000) // Collect data every second
      this.isRecording = true

      // Get location data for the recording
      let locationData = null
      try {
        const location = await getCurrentLocation()
        locationData = location.success ? location : null
      } catch (error) {
        console.warn('Could not get location for recording:', error)
      }

      return {
        success: true,
        recordingId: this.recordingId,
        startTime: this.recordingStartTime,
        mimeType,
        location: locationData,
        message: 'Recording started successfully'
      }

    } catch (error) {
      console.error('Failed to start recording:', error)
      return {
        success: false,
        error: error.message,
        code: error.name
      }
    }
  }

  /**
   * Stop recording
   * @returns {Promise<Object>} Recording stop result with file data
   */
  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.isRecording || !this.mediaRecorder) {
        resolve({
          success: false,
          error: 'No active recording to stop'
        })
        return
      }

      // Set up one-time event handler for when recording stops
      this.mediaRecorder.addEventListener('stop', async () => {
        try {
          const recordingEndTime = new Date()
          const duration = Math.floor((recordingEndTime - this.recordingStartTime) / 1000)

          // Create blob from recorded chunks
          const mimeType = this.mediaRecorder.mimeType
          const blob = new Blob(this.recordedChunks, { type: mimeType })

          // Generate filename
          const extension = this.getFileExtension(mimeType)
          const fileName = `recording_${this.recordingId}_${Date.now()}.${extension}`

          // Create file object
          const file = new File([blob], fileName, { type: mimeType })

          // Stop all tracks
          this.stopAllTracks()

          const result = {
            success: true,
            recordingId: this.recordingId,
            file,
            blob,
            fileName,
            mimeType,
            duration,
            size: blob.size,
            startTime: this.recordingStartTime,
            endTime: recordingEndTime,
            url: URL.createObjectURL(blob)
          }

          // Reset recording state
          this.resetRecordingState()

          resolve(result)

        } catch (error) {
          console.error('Error processing recording:', error)
          resolve({
            success: false,
            error: error.message
          })
        }
      }, { once: true })

      // Stop the recording
      this.mediaRecorder.stop()
      this.isRecording = false
    })
  }

  /**
   * Pause recording
   * @returns {Object} Pause result
   */
  pauseRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      return {
        success: false,
        error: 'No active recording to pause'
      }
    }

    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
      return {
        success: true,
        message: 'Recording paused'
      }
    }

    return {
      success: false,
      error: 'Recording is not in a pausable state'
    }
  }

  /**
   * Resume recording
   * @returns {Object} Resume result
   */
  resumeRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      return {
        success: false,
        error: 'No active recording to resume'
      }
    }

    if (this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
      return {
        success: true,
        message: 'Recording resumed'
      }
    }

    return {
      success: false,
      error: 'Recording is not in a resumable state'
    }
  }

  /**
   * Cancel recording
   * @returns {Object} Cancel result
   */
  cancelRecording() {
    if (!this.isRecording) {
      return {
        success: false,
        error: 'No active recording to cancel'
      }
    }

    try {
      this.stopAllTracks()
      this.resetRecordingState()

      return {
        success: true,
        message: 'Recording cancelled'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get recording status
   * @returns {Object} Current recording status
   */
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      recordingId: this.recordingId,
      startTime: this.recordingStartTime,
      duration: this.recordingStartTime ? 
        Math.floor((new Date() - this.recordingStartTime) / 1000) : 0,
      state: this.mediaRecorder?.state || 'inactive'
    }
  }

  /**
   * Save recording to cloud storage and database
   * @param {Object} recordingData - Recording data from stopRecording
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Save result
   */
  async saveRecording(recordingData, userId) {
    try {
      if (!recordingData.success || !recordingData.file) {
        throw new Error('Invalid recording data')
      }

      // Upload file to cloud storage
      const { data: uploadData, error: uploadError } = await uploadRecording(
        recordingData.file,
        recordingData.fileName
      )

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get location data
      let locationData = null
      try {
        const location = await getCurrentLocation()
        locationData = location.success ? {
          state: location.state,
          coordinates: location.coordinates,
          timestamp: location.timestamp
        } : null
      } catch (error) {
        console.warn('Could not get location for saving:', error)
      }

      // Save recording metadata to database
      const { data: dbData, error: dbError } = await saveRecordedInteraction(
        userId,
        recordingData.duration,
        uploadData.path, // URL to the uploaded file
        locationData
      )

      if (dbError) {
        throw new Error(`Database save failed: ${dbError.message}`)
      }

      return {
        success: true,
        recordingId: recordingData.recordingId,
        uploadPath: uploadData.path,
        databaseId: dbData[0].interaction_id,
        message: 'Recording saved successfully'
      }

    } catch (error) {
      console.error('Failed to save recording:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Set up MediaRecorder event handlers
   */
  setupRecorderEventHandlers() {
    this.mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data)
      }
    })

    this.mediaRecorder.addEventListener('error', (event) => {
      console.error('MediaRecorder error:', event.error)
      this.stopAllTracks()
      this.resetRecordingState()
    })
  }

  /**
   * Stop all media tracks
   */
  stopAllTracks() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
      })
      this.stream = null
    }
  }

  /**
   * Reset recording state
   */
  resetRecordingState() {
    this.mediaRecorder = null
    this.recordedChunks = []
    this.isRecording = false
    this.recordingStartTime = null
    this.recordingId = null
  }

  /**
   * Get supported MIME type for recording
   * @returns {string} Supported MIME type
   */
  getSupportedMimeType() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'video/webm' // Fallback
  }

  /**
   * Get file extension from MIME type
   * @param {string} mimeType - MIME type
   * @returns {string} File extension
   */
  getFileExtension(mimeType) {
    const extensions = {
      'video/webm': 'webm',
      'video/mp4': 'mp4',
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/wav': 'wav'
    }

    return extensions[mimeType] || 'webm'
  }

  /**
   * Check if recording is supported
   * @returns {Object} Support status
   */
  static checkRecordingSupport() {
    const support = {
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      mediaRecorder: !!window.MediaRecorder,
      supported: false,
      message: ''
    }

    if (!support.mediaDevices) {
      support.message = 'MediaDevices API not supported'
    } else if (!support.getUserMedia) {
      support.message = 'getUserMedia not supported'
    } else if (!support.mediaRecorder) {
      support.message = 'MediaRecorder API not supported'
    } else {
      support.supported = true
      support.message = 'Recording fully supported'
    }

    return support
  }

  /**
   * Request media permissions
   * @param {Object} constraints - Media constraints
   * @returns {Promise<Object>} Permission result
   */
  static async requestMediaPermissions(constraints = { video: true, audio: true }) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Stop the stream immediately as we just wanted to check permissions
      stream.getTracks().forEach(track => track.stop())

      return {
        success: true,
        permissions: {
          video: constraints.video,
          audio: constraints.audio
        },
        message: 'Media permissions granted'
      }

    } catch (error) {
      let errorMessage = 'Permission denied'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone access denied by user'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is already in use'
      }

      return {
        success: false,
        error: errorMessage,
        code: error.name
      }
    }
  }
}

// Create singleton instance
const recordingService = new RecordingService()

export default recordingService

// Export individual methods for convenience
export const {
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  cancelRecording,
  getRecordingStatus,
  saveRecording
} = recordingService

export const checkRecordingSupport = RecordingService.checkRecordingSupport
export const requestMediaPermissions = RecordingService.requestMediaPermissions
