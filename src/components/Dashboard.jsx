import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import RightsGuide from './RightsGuide'
import RecordingHistory from './RecordingHistory'
import SubscriptionUpgrade from './SubscriptionUpgrade'
import AIScriptGenerator from './AIScriptGenerator'
import RecordingButton from './RecordingButton'
import { MapPin, Languages, History, Zap, Download, Loader2 } from 'lucide-react'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('rights')
  const { 
    currentState, 
    language, 
    setLanguage, 
    subscriptionStatus, 
    offlineMode, 
    loading, 
    error,
    locationPermission 
  } = useApp()

  // Show loading state during app initialization
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-secondary">Initializing RightsRadar...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'rights', label: 'Your Rights', icon: MapPin },
    { id: 'record', label: 'Record', icon: Zap },
    { id: 'ai', label: 'AI Scripts', icon: Zap },
    { id: 'history', label: 'History', icon: History },
    { id: 'upgrade', label: 'Upgrade', icon: Download }
  ]

  return (
    <div className="space-y-6">
      {/* Global Error Display */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center space-x-2 text-red-800">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Location & Language Bar */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <MapPin className={`h-5 w-5 ${locationPermission === 'granted' ? 'text-primary' : 'text-gray-400'}`} />
            <div>
              <span className="text-sm text-text-secondary">Current location</span>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-text-primary">{currentState}</p>
                {locationPermission === 'denied' && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    Location access denied
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Languages className="h-5 w-5 text-primary" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            
            {subscriptionStatus === 'pro' && (
              <div className="flex items-center space-x-2 text-sm text-accent bg-accent/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>Pro</span>
              </div>
            )}
            
            {offlineMode && (
              <div className="flex items-center space-x-2 text-sm text-accent">
                <Download className="h-4 w-4" />
                <span>Offline ready</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'rights' && <RightsGuide />}
          {activeTab === 'record' && <RecordingButton />}
          {activeTab === 'ai' && <AIScriptGenerator />}
          {activeTab === 'history' && <RecordingHistory />}
          {activeTab === 'upgrade' && <SubscriptionUpgrade />}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
