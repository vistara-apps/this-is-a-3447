import React from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Download, MapPin, Clock, Video } from 'lucide-react'

const RecordingHistory = () => {
  const { recordings, language } = useApp()

  if (recordings.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          {language === 'es' ? 'Sin grabaciones' : 'No recordings yet'}
        </h3>
        <p className="text-text-secondary">
          {language === 'es' 
            ? 'Tus grabaciones de emergencia aparecerán aquí'
            : 'Your emergency recordings will appear here'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text-primary">
          {language === 'es' ? 'Historial de Grabaciones' : 'Recording History'}
        </h3>
        <span className="text-sm text-text-secondary">
          {recordings.length} {language === 'es' ? 'grabaciones' : 'recordings'}
        </span>
      </div>

      <div className="space-y-3">
        {recordings.map((recording) => (
          <div key={recording.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="font-medium text-text-primary">
                    {language === 'es' ? 'Grabación de Emergencia' : 'Emergency Recording'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    recording.status === 'saved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {recording.status === 'saved' 
                      ? (language === 'es' ? 'Guardado' : 'Saved')
                      : (language === 'es' ? 'Procesando' : 'Processing')
                    }
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{recording.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{recording.location}</span>
                  </div>
                  <span>{recording.timestamp.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-primary hover:bg-blue-50 rounded-md transition-colors">
                  <Play className="h-5 w-5" />
                </button>
                <button className="p-2 text-text-secondary hover:bg-gray-50 rounded-md transition-colors">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Storage Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-blue-900 mb-2">
          {language === 'es' ? 'Información de Almacenamiento' : 'Storage Information'}
        </h4>
        <p className="text-sm text-blue-800 leading-relaxed">
          {language === 'es' 
            ? 'Las grabaciones se almacenan de forma segura y se pueden compartir con contactos de emergencia. Los usuarios Pro obtienen almacenamiento ilimitado.'
            : 'Recordings are stored securely and can be shared with emergency contacts. Pro users get unlimited storage.'
          }
        </p>
      </div>
    </div>
  )
}

export default RecordingHistory