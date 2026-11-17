// src/components/ErrorBoundary.jsx
import { Component } from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <FaExclamationTriangle style={styles.icon} />
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              An unexpected error occurred. Please try again or reload the application.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details</summary>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div style={styles.buttonContainer}>
              <button onClick={this.handleRetry} style={styles.button}>
                <FaRedo style={styles.buttonIcon} />
                Try Again
              </button>
              <button onClick={this.handleReload} style={{ ...styles.button, ...styles.reloadButton }}>
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: 'var(--background-primary)',
    color: 'var(--text-primary)',
    fontFamily: "'Rajdhani', sans-serif",
  },
  card: {
    maxWidth: '500px',
    padding: '40px',
    backgroundColor: 'rgba(10, 25, 47, 0.8)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 100, 100, 0.3)',
    textAlign: 'center',
    boxShadow: '0 0 30px rgba(255, 100, 100, 0.1)',
  },
  icon: {
    fontSize: '48px',
    color: '#E74C3C',
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 15px 0',
    fontSize: '1.8rem',
    fontWeight: '600',
  },
  message: {
    margin: '0 0 25px 0',
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  details: {
    marginBottom: '20px',
    textAlign: 'left',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '15px',
    borderRadius: '8px',
    maxHeight: '150px',
    overflow: 'auto',
  },
  summary: {
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  errorText: {
    marginTop: '10px',
    fontSize: '0.75rem',
    color: '#E74C3C',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  buttonContainer: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: 'var(--neon-blue)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonIcon: {
    fontSize: '0.9rem',
  },
  reloadButton: {
    backgroundColor: 'var(--neon-orange)',
  },
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
