import React, { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { Video, Square, Pause, Play, AlertCircle, Clock } from 'lucide-react'

const RecordingButton = () => {
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    cancelRecording,
    mediaPermission,
    error 
  } = useApp()
  
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Timer effect for recording duration
  useEffect(() => {
    let interval = null
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(time => time + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    
    // Reset timer when recording stops
    if (!isRecording) {
      setRecordingTime(0)
      setIsPaused(false)
    }
    
    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRecordingToggle = async () => {
    if (isRecording) {
      await stopRecording()
    } else {
      await startRecording()
    }
  }

  const handleCancel = () => {
    cancelRecording()
  }

  if (!isRecording) {
    return (
      <div className="flex flex-col items-center space-y-4">
        {/* Main Record Button */}
        <button
          onClick={handleRecordingToggle}
          className="relative w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          aria-label="Start recording"
        >
          <Video className="h-8 w-8 text-white" />
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25"></div>
        </button>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-lg font-semibold text-text-primary">
            Emergency Recording
          </p>
          <p className="text-sm text-text-secondary">
            Tap to start recording your interaction
          </p>
        </div>

        {/* Permission Status */}
        {mediaPermission === 'denied' && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Camera/microphone access required</span>
          </div>
        )}

        {/* Error Display */}
        {error && error.includes('Recording') && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-md max-w-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Recording Status */}
      <div className="flex items-center space-x-3 bg-red-100 px-4 py-2 rounded-full">
        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
        <span className="text-red-800 font-semibold">RECORDING</span>
      </div>

      {/* Timer */}
      <div className="flex items-center space-x-2 text-2xl font-mono font-bold text-text-primary">
        <Clock className="h-6 w-6" />
        <span>{formatTime(recordingTime)}</span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-4">
        {/* Stop Button */}
        <button
          onClick={handleRecordingToggle}
          className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
          aria-label="Stop recording"
        >
          <Square className="h-6 w-6 text-white fill-current" />
        </button>

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          aria-label="Cancel recording"
        >
          Cancel
        </button>
      </div>

      {/* Recording Tips */}
      <div className="text-center max-w-sm">
        <p className="text-sm text-text-secondary">
          Keep your device steady and speak clearly. Recording will be saved automatically when stopped.
        </p>
      </div>
    </div>
  )
}

export default RecordingButton
