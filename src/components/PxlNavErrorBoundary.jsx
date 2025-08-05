import React from 'react';

export class PxlNavErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PxlNav Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return React.createElement(FallbackComponent, { 
          error: this.state.error, 
          resetError: this.resetError 
        });
      }
      
      return React.createElement('div', {
        style: { padding: '20px', border: '1px solid red', borderRadius: '4px' }
      }, [
        React.createElement('h2', { key: 'title' }, 'PxlNav Error'),
        React.createElement('p', { key: 'description' }, 'Something went wrong with the pxlNav integration:'),
        React.createElement('pre', {
          key: 'error',
          style: { background: '#f5f5f5', padding: '10px', overflow: 'auto' }
        }, this.state.error.message),
        React.createElement('button', {
          key: 'retry',
          onClick: this.resetError
        }, 'Try Again')
      ]);
    }

    return this.props.children;
  }
}
