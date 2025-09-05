import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Zap, Lock, MessageSquare, Loader } from 'lucide-react'

const AIScriptGenerator = () => {
  const { subscriptionStatus, language, currentState } = useApp()
  const [scenario, setScenario] = useState('')
  const [generatedScript, setGeneratedScript] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [usageCount, setUsageCount] = useState(2) // Free tier: 3 uses per month

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
    if (subscriptionStatus === 'free' && usageCount <= 0) {
      alert(language === 'es' 
        ? 'Has agotado tus usos gratuitos. Actualiza a Pro para acceso ilimitado.' 
        : 'You have used all free generations. Upgrade to Pro for unlimited access.'
      )
      return
    }

    setIsGenerating(true)
    
    try {
      // Simulate AI generation (replace with actual OpenAI API call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockScript = language === 'es' ? `
Para una ${scenario} en ${currentState}:

1. Mantenga la calma y las manos visibles
2. Diga: "Estoy ejerciendo mi derecho a permanecer en silencio"
3. Si le preguntan sobre registros: "No consiento a ningún registro"
4. Pregunte: "¿Estoy libre de irme?"
5. Si es arrestado: "Quiero hablar con un abogado"

Recuerde: Siempre manténgase respetuoso y no resista físicamente.
      ` : `
For a ${scenario} in ${currentState}:

1. Stay calm and keep hands visible
2. Say: "I am exercising my right to remain silent"
3. If asked about searches: "I do not consent to any searches"
4. Ask: "Am I free to leave?"
5. If arrested: "I want to speak to a lawyer"

Remember: Always remain respectful and do not physically resist.
      `
      
      setGeneratedScript(mockScript.trim())
      
      if (subscriptionStatus === 'free') {
        setUsageCount(prev => prev - 1)
      }
      
    } catch (error) {
      console.error('Script generation failed:', error)
      alert(language === 'es' 
        ? 'Error al generar script. Inténtelo de nuevo.' 
        : 'Failed to generate script. Please try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  if (subscriptionStatus === 'free') {
    return (
      <div className="space-y-6">
        {/* Usage Counter */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">
                {language === 'es' ? 'Generaciones Restantes' : 'Generations Remaining'}
              </p>
              <p className="text-sm text-blue-700">
                {usageCount} / 3 {language === 'es' ? 'este mes' : 'this month'}
              </p>
            </div>
          </div>
        </div>

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

        {/* Generate Button */}
        <button
          onClick={generateScript}
          disabled={!scenario || isGenerating || usageCount <= 0}
          className={`w-full btn-primary flex items-center justify-center space-x-2 ${
            (!scenario || isGenerating || usageCount <= 0) 
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
              : (language === 'es' ? 'Generar Script' : 'Generate Script')
            }
          </span>
        </button>

        {/* Generated Script */}
        {generatedScript && (
          <div className="card-elevated">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              <span>
                {language === 'es' ? 'Script Generado' : 'Generated Script'}
              </span>
            </h3>
            <div className="bg-gray-50 rounded-md p-4">
              <pre className="whitespace-pre-wrap text-sm text-text-primary font-mono">
                {generatedScript}
              </pre>
            </div>
          </div>
        )}

        {/* Upgrade Prompt */}
        {usageCount <= 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <h4 className="font-medium text-yellow-900">
                  {language === 'es' ? 'Pocos usos restantes' : 'Low on generations'}
                </h4>
                <p className="text-sm text-yellow-800 mt-1">
                  {language === 'es' 
                    ? 'Actualice a Pro para acceso ilimitado a scripts generados por IA.'
                    : 'Upgrade to Pro for unlimited AI-generated scripts.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Pro version with unlimited access
  return (
    <div className="space-y-6">
      <div className="bg-accent text-white rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Zap className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">
              {language === 'es' ? 'Acceso Pro Ilimitado' : 'Unlimited Pro Access'}
            </h3>
            <p className="text-sm opacity-90">
              {language === 'es' 
                ? 'Genere scripts ilimitados con IA avanzada'
                : 'Generate unlimited scripts with advanced AI'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced scenario selection for Pro users */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          {language === 'es' ? 'Describa su situación:' : 'Describe your situation:'}
        </label>
        <textarea
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder={language === 'es' 
            ? 'Ej: Me pararon por exceso de velocidad en la autopista...'
            : 'Ex: I was pulled over for speeding on the highway...'
          }
          className="w-full p-4 border border-gray-300 rounded-lg resize-none"
          rows={4}
        />
      </div>

      <button
        onClick={generateScript}
        disabled={!scenario || isGenerating}
        className={`w-full btn-primary flex items-center justify-center space-x-2 ${
          (!scenario || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isGenerating ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <Zap className="h-5 w-5" />
        )}
        <span>
          {isGenerating 
            ? (language === 'es' ? 'Generando Script Personalizado...' : 'Generating Custom Script...') 
            : (language === 'es' ? 'Generar Script Personalizado' : 'Generate Custom Script')
          }
        </span>
      </button>

      {generatedScript && (
        <div className="card-elevated">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            <span>
              {language === 'es' ? 'Script Personalizado' : 'Custom Script'}
            </span>
          </h3>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="whitespace-pre-wrap text-sm text-text-primary font-mono">
              {generatedScript}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIScriptGenerator