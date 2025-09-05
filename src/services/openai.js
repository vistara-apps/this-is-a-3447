import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key',
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

/**
 * Generate AI-powered legal scripts based on user context
 * @param {string} state - User's current state
 * @param {string} language - User's preferred language ('en' or 'es')
 * @param {string} scenario - Specific scenario (e.g., 'traffic_stop', 'street_encounter')
 * @param {string} userContext - Additional user-provided context
 * @returns {Promise<Object>} Generated script with recommendations
 */
export const generateLegalScript = async (state, language, scenario, userContext = '') => {
  try {
    const systemPrompt = `You are a legal rights advisor specializing in ${state} state law. Generate practical, legally accurate scripts for police interactions. Always emphasize constitutional rights and de-escalation. Provide responses in ${language === 'es' ? 'Spanish' : 'English'}.`

    const userPrompt = `
      Generate a personalized script for a ${scenario} scenario in ${state}.
      ${userContext ? `Additional context: ${userContext}` : ''}
      
      Please provide:
      1. Key rights to remember
      2. Recommended phrases to use
      3. Phrases to avoid
      4. De-escalation tips
      5. When to invoke specific rights
      
      Format the response as a structured guide that's easy to read under stress.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3, // Lower temperature for more consistent legal advice
    })

    const generatedContent = completion.choices[0].message.content

    // Parse and structure the response
    const structuredScript = parseGeneratedScript(generatedContent, language)

    return {
      success: true,
      script: structuredScript,
      metadata: {
        state,
        language,
        scenario,
        generatedAt: new Date().toISOString(),
        model: "gpt-4"
      }
    }

  } catch (error) {
    console.error('OpenAI API Error:', error)
    return {
      success: false,
      error: error.message,
      fallback: getFallbackScript(state, language, scenario)
    }
  }
}

/**
 * Parse the generated script into structured sections
 * @param {string} content - Raw generated content
 * @param {string} language - Language for section headers
 * @returns {Object} Structured script object
 */
const parseGeneratedScript = (content, language) => {
  const sections = {
    keyRights: [],
    recommendedPhrases: [],
    avoidPhrases: [],
    deescalationTips: [],
    whenToInvokeRights: []
  }

  // Simple parsing logic - in production, you might want more sophisticated parsing
  const lines = content.split('\n').filter(line => line.trim())
  let currentSection = null

  lines.forEach(line => {
    const trimmedLine = line.trim()
    
    if (trimmedLine.toLowerCase().includes('rights') || trimmedLine.includes('1.')) {
      currentSection = 'keyRights'
    } else if (trimmedLine.toLowerCase().includes('recommended') || trimmedLine.toLowerCase().includes('phrases to use')) {
      currentSection = 'recommendedPhrases'
    } else if (trimmedLine.toLowerCase().includes('avoid') || trimmedLine.toLowerCase().includes('not to say')) {
      currentSection = 'avoidPhrases'
    } else if (trimmedLine.toLowerCase().includes('de-escalation') || trimmedLine.toLowerCase().includes('tips')) {
      currentSection = 'deescalationTips'
    } else if (trimmedLine.toLowerCase().includes('invoke') || trimmedLine.toLowerCase().includes('when to')) {
      currentSection = 'whenToInvokeRights'
    } else if (currentSection && trimmedLine.startsWith('-') || trimmedLine.match(/^\d+\./)) {
      sections[currentSection].push(trimmedLine.replace(/^[-\d.]\s*/, ''))
    }
  })

  return {
    ...sections,
    fullText: content,
    language
  }
}

/**
 * Provide fallback script when AI generation fails
 * @param {string} state - User's state
 * @param {string} language - User's language
 * @param {string} scenario - Interaction scenario
 * @returns {Object} Fallback script
 */
const getFallbackScript = (state, language, scenario) => {
  const fallbackScripts = {
    en: {
      keyRights: [
        "You have the right to remain silent",
        "You have the right to refuse searches",
        "You have the right to ask if you're free to leave",
        "You have the right to record the interaction"
      ],
      recommendedPhrases: [
        "I am exercising my right to remain silent",
        "I do not consent to any searches",
        "Am I free to leave?",
        "I want to speak to a lawyer"
      ],
      avoidPhrases: [
        "Don't argue or resist physically",
        "Don't provide false information",
        "Don't consent to searches you're not required to allow"
      ],
      deescalationTips: [
        "Keep your hands visible",
        "Speak calmly and clearly",
        "Follow lawful orders",
        "Don't make sudden movements"
      ]
    },
    es: {
      keyRights: [
        "Tiene derecho a permanecer en silencio",
        "Tiene derecho a rechazar registros",
        "Tiene derecho a preguntar si puede irse",
        "Tiene derecho a grabar la interacción"
      ],
      recommendedPhrases: [
        "Estoy ejerciendo mi derecho a permanecer en silencio",
        "No consiento a ningún registro",
        "¿Puedo irme?",
        "Quiero hablar con un abogado"
      ],
      avoidPhrases: [
        "No discuta o resista físicamente",
        "No proporcione información falsa",
        "No consienta a registros que no está obligado a permitir"
      ],
      deescalationTips: [
        "Mantenga las manos visibles",
        "Hable con calma y claridad",
        "Siga órdenes legales",
        "No haga movimientos bruscos"
      ]
    }
  }

  return {
    ...fallbackScripts[language],
    fullText: `Fallback script for ${scenario} in ${state}`,
    language,
    isFallback: true
  }
}

/**
 * Generate scenario-specific questions for better AI script generation
 * @param {string} scenario - The interaction scenario
 * @param {string} language - User's preferred language
 * @returns {Array} Array of relevant questions
 */
export const getScenarioQuestions = (scenario, language) => {
  const questions = {
    en: {
      traffic_stop: [
        "Are you the driver or passenger?",
        "Do you have your license and registration?",
        "Are there any items in the vehicle you're concerned about?",
        "Are you traveling with others?"
      ],
      street_encounter: [
        "Are you in a public or private area?",
        "Are you alone or with others?",
        "What was the reason for the initial contact?",
        "Do you have identification with you?"
      ],
      home_visit: [
        "Do the officers have a warrant?",
        "Are you the homeowner or renter?",
        "Are there others present in the home?",
        "What is the stated reason for the visit?"
      ]
    },
    es: {
      traffic_stop: [
        "¿Es usted el conductor o pasajero?",
        "¿Tiene su licencia y registro?",
        "¿Hay algún artículo en el vehículo que le preocupe?",
        "¿Está viajando con otros?"
      ],
      street_encounter: [
        "¿Está en un área pública o privada?",
        "¿Está solo o con otros?",
        "¿Cuál fue la razón del contacto inicial?",
        "¿Tiene identificación con usted?"
      ],
      home_visit: [
        "¿Los oficiales tienen una orden judicial?",
        "¿Es usted el propietario o inquilino?",
        "¿Hay otros presentes en el hogar?",
        "¿Cuál es la razón declarada para la visita?"
      ]
    }
  }

  return questions[language][scenario] || []
}

/**
 * Rate limit check for AI script generation
 * @param {string} userId - User ID for rate limiting
 * @param {string} subscriptionStatus - User's subscription status
 * @returns {boolean} Whether the user can generate more scripts
 */
export const checkRateLimit = (userId, subscriptionStatus) => {
  // In production, this would check against a database or cache
  // For now, we'll implement basic client-side rate limiting
  
  const rateLimits = {
    free: { daily: 3, hourly: 1 },
    pro: { daily: 50, hourly: 10 }
  }

  const userLimits = rateLimits[subscriptionStatus] || rateLimits.free
  
  // This is a simplified implementation
  // In production, you'd track usage in your backend
  const today = new Date().toDateString()
  const hour = new Date().getHours()
  
  const storageKey = `ai_usage_${userId}_${today}`
  const hourlyKey = `ai_usage_${userId}_${today}_${hour}`
  
  const dailyUsage = parseInt(localStorage.getItem(storageKey) || '0')
  const hourlyUsage = parseInt(localStorage.getItem(hourlyKey) || '0')
  
  return dailyUsage < userLimits.daily && hourlyUsage < userLimits.hourly
}

/**
 * Track AI script generation usage
 * @param {string} userId - User ID
 */
export const trackUsage = (userId) => {
  const today = new Date().toDateString()
  const hour = new Date().getHours()
  
  const storageKey = `ai_usage_${userId}_${today}`
  const hourlyKey = `ai_usage_${userId}_${today}_${hour}`
  
  const dailyUsage = parseInt(localStorage.getItem(storageKey) || '0')
  const hourlyUsage = parseInt(localStorage.getItem(hourlyKey) || '0')
  
  localStorage.setItem(storageKey, (dailyUsage + 1).toString())
  localStorage.setItem(hourlyKey, (hourlyUsage + 1).toString())
}
