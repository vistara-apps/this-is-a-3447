import React from 'react'
import { useApp } from '../contexts/AppContext'
import { Shield, Wifi, WifiOff } from 'lucide-react'

const AppShell = ({ children }) => {
  const { offlineMode, subscriptionStatus } = useApp()

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-text-primary">RightsRadar</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Offline Indicator */}
              {offlineMode && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span>Offline</span>
                </div>
              )}
              
              {/* Subscription Status */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                subscriptionStatus === 'pro' 
                  ? 'bg-accent text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {subscriptionStatus === 'pro' ? 'PRO' : 'FREE'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      {/* Emergency Recording Button - Always Accessible */}
      <div className="fixed bottom-6 right-6 z-50">
        <EmergencyButton />
      </div>
    </div>
  )
}

const EmergencyButton = () => {
  const { isRecording, startRecording, stopRecording } = useApp()

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 ${
        isRecording 
          ? 'bg-red-600 animate-pulse-red' 
          : 'bg-red-500 hover:bg-red-600'
      }`}
      aria-label={isRecording ? 'Stop recording' : 'Start emergency recording'}
    >
      {isRecording ? (
        <div className="w-4 h-4 bg-white rounded-sm"></div>
      ) : (
        <div className="w-6 h-6 bg-white rounded-full"></div>
      )}
    </button>
  )
}

export default AppShell