import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { ChevronDown, ChevronRight, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

const RightsGuide = () => {
  const { currentState, language } = useApp()
  const [expandedSection, setExpandedSection] = useState('basic-rights')

  const rightsData = {
    'basic-rights': {
      title: language === 'es' ? 'Derechos Básicos' : 'Basic Rights',
      icon: Shield,
      color: 'text-accent',
      content: language === 'es' ? [
        'Tiene derecho a permanecer en silencio',
        'Tiene derecho a un abogado',
        'No tiene que consentir registros',
        'Puede grabar la interacción',
        'Puede preguntar si está libre de irse'
      ] : [
        'You have the right to remain silent',
        'You have the right to an attorney',
        'You do not have to consent to searches',
        'You may record the interaction',
        'You can ask if you are free to leave'
      ]
    },
    'what-to-say': {
      title: language === 'es' ? 'Qué Decir' : 'What to Say',
      icon: CheckCircle,
      color: 'text-green-600',
      content: language === 'es' ? [
        '"Estoy ejerciendo mi derecho a permanecer en silencio"',
        '"No consiento a ningún registro"',
        '"¿Estoy libre de irme?"',
        '"Quiero hablar con un abogado"',
        '"Estoy grabando esta interacción"'
      ] : [
        '"I am exercising my right to remain silent"',
        '"I do not consent to any searches"',
        '"Am I free to leave?"',
        '"I want to speak to a lawyer"',
        '"I am recording this interaction"'
      ]
    },
    'what-not-to-say': {
      title: language === 'es' ? 'Qué NO Decir' : 'What NOT to Say',
      icon: AlertTriangle,
      color: 'text-red-600',
      content: language === 'es' ? [
        'No admita ningún delito',
        'No argumente o resista',
        'No mienta a los oficiales',
        'No haga movimientos bruscos',
        'No toque al oficial'
      ] : [
        'Do not admit to any crimes',
        'Do not argue or resist',
        'Do not lie to officers',
        'Do not make sudden movements',
        'Do not touch the officer'
      ]
    }
  }

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {language === 'es' ? `Guía de Derechos - ${currentState}` : `Rights Guide - ${currentState}`}
        </h2>
        <p className="text-text-secondary">
          {language === 'es' 
            ? 'Información específica para su ubicación actual' 
            : 'State-specific information for your current location'
          }
        </p>
      </div>

      {Object.entries(rightsData).map(([sectionId, section]) => {
        const Icon = section.icon
        const isExpanded = expandedSection === sectionId
        
        return (
          <div key={sectionId} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(sectionId)}
              className="w-full px-6 py-4 bg-surface hover:bg-gray-50 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-6 w-6 ${section.color}`} />
                <h3 className="text-lg font-semibold text-text-primary text-left">
                  {section.title}
                </h3>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-text-secondary" />
              ) : (
                <ChevronRight className="h-5 w-5 text-text-secondary" />
              )}
            </button>
            
            {isExpanded && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <ul className="space-y-3">
                  {section.content.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${section.color.replace('text-', 'bg-')}`} />
                      <span className="text-text-primary leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}

      {/* Emergency Contact Info */}
      <div className="card-elevated mt-6 bg-blue-50 border border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              {language === 'es' ? 'Información Importante' : 'Important Information'}
            </h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              {language === 'es' 
                ? 'Esta información es específica para ' + currentState + '. Las leyes pueden variar entre estados. Siempre mantenga la calma y coopere de manera segura.'
                : 'This information is specific to ' + currentState + '. Laws may vary between states. Always remain calm and cooperate safely.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightsGuide