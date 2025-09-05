import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import RightsGuide from './RightsGuide'
import RecordingHistory from './RecordingHistory'
import SubscriptionUpgrade from './SubscriptionUpgrade'
import AIScriptGenerator from './AIScriptGenerator'
import { MapPin, Languages, History, Zap, Download } from 'lucide-react'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('rights')
  const { currentState, language, setLanguage, subscriptionStatus, offlineMode } = useApp()

  const tabs = [
    { id: 'rights', label: 'Your Rights', icon: MapPin },
    { id: 'ai', label: 'AI Scripts', icon: Zap },
    { id: 'history', label: 'History', icon: History },
    { id: 'upgrade', label: 'Upgrade', icon: Download }
  ]

  return (
    <div className="space-y-6">
      {/* Location & Language Bar */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <span className="text-sm text-text-secondary">Current location</span>
              <p className="font-semibold text-text-primary">{currentState}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Languages className="h-5 w-5 text-primary" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            
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
          {activeTab === 'ai' && <AIScriptGenerator />}
          {activeTab === 'history' && <RecordingHistory />}
          {activeTab === 'upgrade' && <SubscriptionUpgrade />}
        </div>
      </div>
    </div>
  )
}

export default Dashboard