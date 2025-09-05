import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key')

/**
 * Create a checkout session for Pro subscription
 * @param {string} userId - User ID
 * @param {string} priceId - Stripe price ID for the subscription
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect if payment is cancelled
 * @returns {Promise<Object>} Checkout session result
 */
export const createCheckoutSession = async (userId, priceId, successUrl, cancelUrl) => {
  try {
    // In production, this would be a call to your backend API
    // For demo purposes, we'll simulate the flow
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        priceId,
        successUrl,
        cancelUrl,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const session = await response.json()
    return { success: true, sessionId: session.id }

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Redirect to Stripe Checkout
 * @param {string} sessionId - Stripe checkout session ID
 */
export const redirectToCheckout = async (sessionId) => {
  try {
    const stripe = await stripePromise
    const { error } = await stripe.redirectToCheckout({ sessionId })

    if (error) {
      console.error('Stripe redirect error:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to redirect to checkout:', error)
    throw error
  }
}

/**
 * Create a Pro subscription checkout flow
 * @param {string} userId - User ID
 * @param {string} plan - Subscription plan ('monthly' or 'yearly')
 * @returns {Promise<void>}
 */
export const subscribeToPro = async (userId, plan = 'monthly') => {
  try {
    // Price IDs would be configured in your Stripe dashboard
    const priceIds = {
      monthly: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
      yearly: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || 'price_yearly'
    }

    const priceId = priceIds[plan]
    const successUrl = `${window.location.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${window.location.origin}/subscription-cancelled`

    const { success, sessionId, error } = await createCheckoutSession(
      userId,
      priceId,
      successUrl,
      cancelUrl
    )

    if (success) {
      await redirectToCheckout(sessionId)
    } else {
      throw new Error(error)
    }

  } catch (error) {
    console.error('Subscription error:', error)
    throw error
  }
}

/**
 * Create a customer portal session for subscription management
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<string>} Portal session URL
 */
export const createPortalSession = async (customerId) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: window.location.origin
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const session = await response.json()
    return session.url

  } catch (error) {
    console.error('Portal session error:', error)
    throw error
  }
}

/**
 * Handle successful subscription
 * @param {string} sessionId - Checkout session ID
 * @returns {Promise<Object>} Session details
 */
export const handleSubscriptionSuccess = async (sessionId) => {
  try {
    const response = await fetch(`/api/checkout-session/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to retrieve session')
    }

    const session = await response.json()
    return {
      success: true,
      customerId: session.customer,
      subscriptionId: session.subscription,
      status: session.payment_status
    }

  } catch (error) {
    console.error('Subscription success handling error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check subscription status
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Subscription status
 */
export const checkSubscriptionStatus = async (subscriptionId) => {
  try {
    const response = await fetch(`/api/subscription/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to check subscription status')
    }

    const subscription = await response.json()
    return {
      success: true,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }

  } catch (error) {
    console.error('Subscription status check error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Cancel subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await fetch(`/api/subscription/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }

    const result = await response.json()
    return { success: true, ...result }

  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get subscription pricing information
 * @returns {Object} Pricing details
 */
export const getPricingInfo = () => {
  return {
    free: {
      name: 'Free',
      price: 0,
      features: [
        'Basic rights information',
        'State-specific guides',
        'Basic recording functionality',
        'English language support',
        'Limited AI script generation (3/day)'
      ]
    },
    monthly: {
      name: 'Pro Monthly',
      price: 4.99,
      priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID,
      features: [
        'Everything in Free',
        'Unlimited AI script generation',
        'Spanish language support',
        'Enhanced recording storage',
        'Priority customer support',
        'Advanced legal templates',
        'Offline content sync'
      ]
    },
    yearly: {
      name: 'Pro Yearly',
      price: 49.99,
      priceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID,
      savings: '17% savings',
      features: [
        'Everything in Pro Monthly',
        '2 months free',
        'Priority feature requests',
        'Legal consultation discounts'
      ]
    }
  }
}

/**
 * Format price for display
 * @param {number} price - Price in dollars
 * @param {string} currency - Currency code
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

/**
 * Demo mode subscription upgrade (for development/testing)
 * @param {string} userId - User ID
 * @param {Function} onSuccess - Success callback
 * @returns {Promise<void>}
 */
export const demoUpgrade = async (userId, onSuccess) => {
  // Simulate payment processing
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Demo subscription upgrade successful')
      onSuccess('pro')
      resolve({ success: true, demo: true })
    }, 2000)
  })
}
