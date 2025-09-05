import React from 'react'
import { useApp } from '../contexts/AppContext'
import { Crown, Check, Zap, Globe, Cloud, Lock } from 'lucide-react'

const SubscriptionUpgrade = () => {
  const { subscriptionStatus, upgradeToProc, language } = useApp()

  const features = {
    free: [
      {
        icon: Check,
        text: language === 'es' ? 'Guías básicas de derechos' : 'Basic rights guides',
        included: true
      },
      {
        icon: Check,
        text: language === 'es' ? 'Grabación de emergencia' : 'Emergency recording',
        included: true
      },
      {
        icon: Check,
        text: language === 'es' ? 'Acceso sin conexión limitado' : 'Limited offline access',
        included: true
      },
      {
        icon: Lock,
        text: language === 'es' ? '3 scripts de IA por mes' : '3 AI scripts per month',
        included: false
      },
      {
        icon: Lock,
        text: language === 'es' ? 'Soporte multiidioma completo' : 'Full multilingual support',
        included: false
      },
      {
        icon: Lock,
        text: language === 'es' ? 'Almacenamiento ilimitado' : 'Unlimited storage',
        included: false
      }
    ],
    pro: [
      {
        icon: Check,
        text: language === 'es' ? 'Todo de la versión gratuita' : 'Everything in free tier',
        included: true
      },
      {
        icon: Zap,
        text: language === 'es' ? 'Scripts de IA ilimitados' : 'Unlimited AI scripts',
        included: true
      },
      {
        icon: Globe,
        text: language === 'es' ? 'Soporte completo en español' : 'Full Spanish support',
        included: true
      },
      {
        icon: Cloud,
        text: language === 'es' ? 'Almacenamiento ilimitado en la nube' : 'Unlimited cloud storage',
        included: true
      },
      {
        icon: Check,
        text: language === 'es' ? 'Actualizaciones de contenido prioritarias' : 'Priority content updates',
        included: true
      },
      {
        icon: Check,
        text: language === 'es' ? 'Soporte premium' : 'Premium support',
        included: true
      }
    ]
  }

  if (subscriptionStatus === 'pro') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {language === 'es' ? '¡Eres Usuario Pro!' : 'You\'re a Pro User!'}
          </h2>
          <p className="text-text-secondary">
            {language === 'es' 
              ? 'Disfruta de todas las funciones premium de RightsRadar'
              : 'Enjoy all premium features of RightsRadar'
            }
          </p>
        </div>

        <div className="card-elevated bg-gradient-to-br from-accent to-green-600 text-white">
          <h3 className="font-semibold mb-4">
            {language === 'es' ? 'Funciones Pro Activas' : 'Active Pro Features'}
          </h3>
          <div className="space-y-3">
            {features.pro.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span>{feature.text}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            {language === 'es' ? 'Gestionar Suscripción' : 'Manage Subscription'}
          </h4>
          <p className="text-sm text-blue-800 mb-3">
            {language === 'es' 
              ? 'Tu suscripción Pro se renueva automáticamente. Puedes cancelar en cualquier momento.'
              : 'Your Pro subscription renews automatically. You can cancel anytime.'
            }
          </p>
          <button className="btn-secondary text-sm">
            {language === 'es' ? 'Ver Facturación' : 'View Billing'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {language === 'es' ? 'Actualizar a Pro' : 'Upgrade to Pro'}
        </h2>
        <p className="text-text-secondary">
          {language === 'es' 
            ? 'Desbloquea funciones avanzadas para una protección completa'
            : 'Unlock advanced features for comprehensive protection'
          }
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Tier */}
        <div className="card border-2 border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {language === 'es' ? 'Gratuito' : 'Free'}
            </h3>
            <div className="text-3xl font-bold text-text-primary">
              $0
              <span className="text-sm font-normal text-text-secondary">
                /{language === 'es' ? 'mes' : 'month'}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {features.free.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${
                    feature.included ? 'text-accent' : 'text-gray-400'
                  }`} />
                  <span className={
                    feature.included ? 'text-text-primary' : 'text-text-secondary'
                  }>
                    {feature.text}
                  </span>
                </div>
              )
            })}
          </div>

          <button disabled className="w-full btn-secondary opacity-50 cursor-not-allowed">
            {language === 'es' ? 'Plan Actual' : 'Current Plan'}
          </button>
        </div>

        {/* Pro Tier */}
        <div className="card border-2 border-primary bg-blue-50">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-3">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              RightsRadar Pro
            </h3>
            <div className="text-3xl font-bold text-primary">
              $4.99
              <span className="text-sm font-normal text-text-secondary">
                /{language === 'es' ? 'mes' : 'month'}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {language === 'es' ? 'o $49.99/año (ahorra 17%)' : 'or $49.99/year (save 17%)'}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {features.pro.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-text-primary">{feature.text}</span>
                </div>
              )
            })}
          </div>

          <button onClick={upgradeToProc} className="w-full btn-primary">
            {language === 'es' ? 'Actualizar a Pro' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <h3 className="font-semibold text-text-primary mb-4">
          {language === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
        </h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-text-primary mb-1">
              {language === 'es' ? '¿Puedo cancelar en cualquier momento?' : 'Can I cancel anytime?'}
            </h4>
            <p className="text-text-secondary">
              {language === 'es' 
                ? 'Sí, puedes cancelar tu suscripción en cualquier momento sin penalización.'
                : 'Yes, you can cancel your subscription anytime without penalty.'
              }
            </p>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-1">
              {language === 'es' ? '¿Qué sucede con mis grabaciones si cancelo?' : 'What happens to my recordings if I cancel?'}
            </h4>
            <p className="text-text-secondary">
              {language === 'es' 
                ? 'Conservas acceso a todas las grabaciones existentes, pero el almacenamiento se limita a 1GB.'
                : 'You keep access to all existing recordings, but storage is limited to 1GB.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionUpgrade