import { Component } from 'react';

/**
 * Error boundary to catch and display React errors gracefully
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.state = { hasError: true, error, errorInfo };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F3F4F6',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '600px',
          }}>
            <h1 style={{ color: '#DC2626', marginBottom: '16px' }}>
              ⚠️ Bir Hata Oluştu
            </h1>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>
              Uygulama yüklenirken bir sorun oluştu. Lütfen tarayıcı konsolunu (F12) kontrol edin.
            </p>
            {this.state.error && (
              <details style={{
                background: '#FEF2F2',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#DC2626' }}>
                  Hata Detayları
                </summary>
                <pre style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  overflow: 'auto',
                  color: '#991B1B',
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

