import React, { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { generateLegalScript, checkRateLimit, trackUsage, getScenarioQuestions } from '../services/openai'
import { Zap, Lock, MessageSquare, Loader, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const AIScriptGenerator = () => {
  const { subscriptionStatus, language, currentState, user } = useApp()
  const [scenario, setScenario] = useState('')
  const [userContext, setUserContext] = useState('')
  const [generatedScript, setGeneratedScript] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [error, setError] = useState('')
  const [scenarioQuestions, setScenarioQuestions] = useState([])

  // Load usage count on component mount
  useEffect(() => {
    if (user?.id) {
      const today = new Date().toDateString()
      const storageKey = `ai_usage_${user.id}_${today}`
      const dailyUsage = parseInt(localStorage.getItem(storageKey) || '0')
      setUsageCount(dailyUsage)
    }
  }, [user?.id])

  // Update scenario questions when scenario changes
  useEffect(() => {
    if (scenario) {
      const questions = getScenarioQuestions(scenario.replace(' ', '_'), language)
      setScenarioQuestions(questions)
    } else {
      setScenarioQuestions([])
    }
  }, [scenario, language])

  const scenarios = [
    { 
      id: 'traffic-stop', 
      label: language === 'es' ? 'Parada de Tráfico' : 'Traffic Stop',
      value: 'traffic stop'
    },
    { 
      id: 'pedestrian-stop', 
      label: language === 'es' ? 'Parada Peatonal' : 'Pedestrian Stop',
      value: 'pedestrian stop'
    },
    { 
      id: 'home-visit', 
      label: language === 'es' ? 'Visita Domiciliaria' : 'Home Visit',
      value: 'home visit'
    },
    { 
      id: 'checkpoint', 
      label: language === 'es' ? 'Punto de Control' : 'Checkpoint',
      value: 'checkpoint'
    }
  ]

  const generateScript = async () => {
    if (!scenario) {
      setError(language === 'es' ? 'Por favor selecciona un escenario' : 'Please select a scenario')
      return
    }

    if (!user?.id) {
      setError(language === 'es' ? 'Error de usuario' : 'User error')
      return
    }

    // Check rate limits
    if (!checkRateLimit(user.id, subscriptionStatus)) {
      const maxDaily = subscriptionStatus === 'pro' ? 50 : 3
      setError(language === 'es' 
        ? `Has alcanzado el límite diario de ${maxDaily} generaciones. ${subscriptionStatus === 'free' ? 'Actualiza a Pro para más acceso.' : 'Inténtalo mañana.'}` 
        : `You've reached the daily limit of ${maxDaily} generations. ${subscriptionStatus === 'free' ? 'Upgrade to Pro for more access.' : 'Try again tomorrow.'}`
      )
      return
    }

    setIsGenerating(true)
    setError('')
    
    try {
      // Generate script using OpenAI service
      const result = await generateLegalScript(
        currentState,
        language,
        scenario.replace(' ', '_'),
        userContext
      )
      
      if (result.success) {
        setGeneratedScript(result.script)
        
        // Track usage
        trackUsage(user.id)
        setUsageCount(prev => prev + 1)
        
      } else {
        // Use fallback script if AI generation fails
        if (result.fallback) {
          setGeneratedScript(result.fallback)
          setError(language === 'es' 
            ? 'Usando script de respaldo (IA no disponible)' 
            : 'Using fallback script (AI unavailable)'
          )
        } else {
          throw new Error(result.error)
        }
      }
      
    } catch (error) {
      console.error('Script generation failed:', error)
      setError(language === 'es' 
        ? `Error al generar script: ${error.message}` 
        : `Failed to generate script: ${error.message}`
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const getRemainingUsage = () => {
    const maxDaily = subscriptionStatus === 'pro' ? 50 : 3
    return Math.max(0, maxDaily - usageCount)
  }

  const renderScriptSection = (title, items, icon, colorClass) => {
    if (!items || items.length === 0) return null

    return (
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          {icon}
          <h4 className={`font-semibold ${colorClass}`}>{title}</h4>
        </div>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${colorClass.replace('text-', 'bg-')}`}></div>
              <span className="text-text-primary">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usage Counter */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">
                {language === 'es' ? 'Generaciones de IA' : 'AI Generations'}
              </p>
              <p className="text-sm text-blue-700">
                {getRemainingUsage()} {language === 'es' ? 'restantes hoy' : 'remaining today'}
                {subscriptionStatus === 'free' && (
                  <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded">
                    {language === 'es' ? 'Gratis' : 'Free'}
                  </span>
                )}
              </p>
            </div>
          </div>
          {subscriptionStatus === 'pro' && (
            <div className="flex items-center space-x-2 text-accent">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                {language === 'es' ? 'Ilimitado' : 'Unlimited'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Scenario Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          {language === 'es' ? 'Seleccione un escenario:' : 'Select a scenario:'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenario(s.value)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                scenario === s.value
                  ? 'border-primary bg-blue-50 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">{s.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Questions */}
      {scenarioQuestions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            {language === 'es' ? 'Contexto adicional (opcional):' : 'Additional context (optional):'}
          </label>
          <div className="space-y-2 mb-3">
            <p className="text-sm text-text-secondary">
              {language === 'es' ? 'Considere estas preguntas:' : 'Consider these questions:'}
            </p>
            <ul className="text-sm text-text-secondary space-y-1">
              {scenarioQuestions.map((question, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>
          <textarea
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder={language === 'es' 
              ? 'Proporcione detalles específicos sobre su situación...' 
              : 'Provide specific details about your situation...'
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            rows={3}
          />
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateScript}
        disabled={!scenario || isGenerating || getRemainingUsage() <= 0}
        className={`w-full btn-primary flex items-center justify-center space-x-2 ${
          (!scenario || isGenerating || getRemainingUsage() <= 0) 
            ? 'opacity-50 cursor-not-allowed' 
            : ''
        }`}
      >
        {isGenerating ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <Zap className="h-5 w-5" />
        )}
        <span>
          {isGenerating 
            ? (language === 'es' ? 'Generando...' : 'Generating...') 
            : (language === 'es' ? 'Generar Script con IA' : 'Generate AI Script')
          }
        </span>
      </button>

      {/* Generated Script */}
      {generatedScript && (
        <div className="card-elevated">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            <span>
              {language === 'es' ? 'Script Generado por IA' : 'AI-Generated Script'}
            </span>
            {generatedScript.isFallback && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                {language === 'es' ? 'Respaldo' : 'Fallback'}
              </span>
            )}
          </h3>
          
          <div className="space-y-4">
            {renderScriptSection(
              language === 'es' ? 'Derechos Clave' : 'Key Rights',
              generatedScript.keyRights,
              <CheckCircle className="h-4 w-4" />,
              'text-green-600'
            )}
            
            {renderScriptSection(
              language === 'es' ? 'Frases Recomendadas' : 'Recommended Phrases',
              generatedScript.recommendedPhrases,
              <MessageSquare className="h-4 w-4" />,
              'text-blue-600'
            )}
            
            {renderScriptSection(
              language === 'es' ? 'Frases a Evitar' : 'Phrases to Avoid',
              generatedScript.avoidPhrases,
              <XCircle className="h-4 w-4" />,
              'text-red-600'
            )}
            
            {renderScriptSection(
              language === 'es' ? 'Consejos de Desescalada' : 'De-escalation Tips',
              generatedScript.deescalationTips,
              <AlertCircle className="h-4 w-4" />,
              'text-orange-600'
            )}

            {/* Full Text Fallback */}
            {generatedScript.fullText && !generatedScript.keyRights && (
              <div className="bg-gray-50 rounded-md p-4">
                <pre className="whitespace-pre-wrap text-sm text-text-primary">
                  {generatedScript.fullText}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Prompt for Free Users */}
      {subscriptionStatus === 'free' && getRemainingUsage() <= 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-yellow-600 mt-1" />
            <div>
              <h4 className="font-medium text-yellow-900">
                {language === 'es' ? 'Pocas generaciones restantes' : 'Low on generations'}
              </h4>
              <p className="text-sm text-yellow-800 mt-1">
                {language === 'es' 
                  ? 'Actualice a Pro para acceso ilimitado a scripts generados por IA, soporte multiidioma y más funciones.'
                  : 'Upgrade to Pro for unlimited AI-generated scripts, multilingual support, and more features.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIScriptGenerator
