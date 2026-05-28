import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;

    if (error) {
      return (
        <main className="error-page">
          <h1>Terjadi masalah saat membuka halaman.</h1>
          <p>{error.message}</p>
          <a href="/">Kembali ke Beranda</a>
        </main>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
