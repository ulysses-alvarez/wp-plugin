import { useState, useEffect } from 'react'
import './App.css'

// Declarar el tipo para los datos de WordPress
declare global {
  interface Window {
    wpPropertyDashboard?: {
      apiUrl: string
      wpApiUrl: string
      nonce: string
      siteUrl: string
      currentUser: {
        id: number
        name: string
        email: string
        role: string
        roleLabel: string
        capabilities: Record<string, boolean>
      }
      config: {
        perPage: number
        view: string
      }
      i18n: {
        dateFormat: string
        timeFormat: string
        locale: string
        currency: string
      }
    }
  }
}

function App() {
  const [wpData, setWpData] = useState<typeof window.wpPropertyDashboard | null>(null)
  const [apiTest, setApiTest] = useState<{loading: boolean, data: any, error: string | null}>({
    loading: false,
    data: null,
    error: null
  })

  useEffect(() => {
    // Obtener datos de WordPress
    if (window.wpPropertyDashboard) {
      setWpData(window.wpPropertyDashboard)
      console.log('WordPress Data:', window.wpPropertyDashboard)
    } else {
      console.error('wpPropertyDashboard no está definido. Verifica que el shortcode esté cargando los scripts correctamente.')
    }
  }, [])

  const testAPI = async () => {
    if (!wpData) return

    setApiTest({ loading: true, data: null, error: null })

    try {
      const response = await fetch(`${wpData.apiUrl}/properties?per_page=5`, {
        headers: {
          'X-WP-Nonce': wpData.nonce,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setApiTest({ loading: false, data, error: null })
      console.log('API Response:', data)
    } catch (error) {
      setApiTest({
        loading: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
      console.error('API Error:', error)
    }
  }

  if (!wpData) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
        <h2 style={{ color: '#856404', margin: '0 0 10px 0' }}>⚠️ Advertencia</h2>
        <p style={{ color: '#856404', margin: 0 }}>
          Los datos de WordPress no están disponibles. Verifica que estés usando el shortcode <code>[property_dashboard]</code>
        </p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#216121', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
          ✅ Property Dashboard - Componente de Prueba
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Verificación de integración WordPress ↔ React
        </p>
      </div>

      {/* Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* React Status */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#216121', fontSize: '18px' }}>
            ✅ React Montado
          </h3>
          <p style={{ margin: 0, color: '#666' }}>
            La aplicación React se ha montado correctamente en el div del shortcode.
          </p>
        </div>

        {/* WordPress Data Status */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#216121', fontSize: '18px' }}>
            ✅ Datos de WordPress
          </h3>
          <p style={{ margin: 0, color: '#666' }}>
            <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>
              window.wpPropertyDashboard
            </code> está disponible
          </p>
        </div>

        {/* Nonce Status */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#216121', fontSize: '18px' }}>
            ✅ Nonce Activo
          </h3>
          <p style={{ margin: 0, color: '#666', wordBreak: 'break-all', fontSize: '12px' }}>
            {wpData.nonce.substring(0, 20)}...
          </p>
        </div>
      </div>

      {/* User Info */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '20px' }}>
          👤 Información del Usuario Actual
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', fontSize: '14px' }}>
          <strong>Nombre:</strong>
          <span>{wpData.currentUser.name}</span>

          <strong>Email:</strong>
          <span>{wpData.currentUser.email}</span>

          <strong>Rol:</strong>
          <span>{wpData.currentUser.roleLabel} ({wpData.currentUser.role})</span>

          <strong>ID:</strong>
          <span>{wpData.currentUser.id}</span>
        </div>
      </div>

      {/* Capabilities */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '20px' }}>
          🔐 Permisos (Capabilities)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px', fontSize: '13px' }}>
          {Object.entries(wpData.currentUser.capabilities).map(([cap, hasPermission]) => (
            <div key={cap} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: hasPermission ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px',
              border: `1px solid ${hasPermission ? '#c8e6c9' : '#ffcdd2'}`
            }}>
              <span style={{ marginRight: '8px' }}>{hasPermission ? '✅' : '❌'}</span>
              <code style={{ fontSize: '12px' }}>{cap}</code>
            </div>
          ))}
        </div>
      </div>

      {/* API Configuration */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '20px' }}>
          🌐 Configuración de API
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', fontSize: '14px' }}>
          <strong>API URL:</strong>
          <code style={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', wordBreak: 'break-all' }}>
            {wpData.apiUrl}
          </code>

          <strong>Site URL:</strong>
          <code style={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', wordBreak: 'break-all' }}>
            {wpData.siteUrl}
          </code>

          <strong>Locale:</strong>
          <span>{wpData.i18n.locale}</span>

          <strong>Currency:</strong>
          <span>{wpData.i18n.currency}</span>
        </div>
      </div>

      {/* API Test */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '20px' }}>
          🧪 Prueba de REST API
        </h2>
        <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
          Haz clic en el botón para probar la conexión con la REST API de propiedades:
        </p>

        <button
          onClick={testAPI}
          disabled={apiTest.loading}
          style={{
            backgroundColor: '#216121',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: apiTest.loading ? 'not-allowed' : 'pointer',
            opacity: apiTest.loading ? 0.6 : 1,
            fontWeight: '500'
          }}
        >
          {apiTest.loading ? '⏳ Consultando API...' : '🚀 Probar API'}
        </button>

        {apiTest.error && (
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#ffebee', border: '1px solid #ef5350', borderRadius: '4px' }}>
            <strong style={{ color: '#c62828' }}>❌ Error:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#c62828' }}>{apiTest.error}</p>
          </div>
        )}

        {apiTest.data && (
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e8f5e9', border: '1px solid #66bb6a', borderRadius: '4px' }}>
            <strong style={{ color: '#2e7d32' }}>✅ Respuesta exitosa:</strong>
            <pre style={{
              margin: '10px 0 0 0',
              padding: '10px',
              backgroundColor: 'white',
              border: '1px solid #c8e6c9',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              maxHeight: '300px'
            }}>
              {JSON.stringify(apiTest.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          🎉 <strong>Todo está funcionando correctamente!</strong>
        </p>
        <p style={{ margin: '10px 0 0 0', color: '#999', fontSize: '13px' }}>
          Ahora puedes proceder con la implementación completa del dashboard
        </p>
      </div>
    </div>
  )
}

export default App
