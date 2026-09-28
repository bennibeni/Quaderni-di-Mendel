import React from 'react';
export function ErrorRecovery({ onRetry }) {
  return <main className="recovery" role="alert"><h1>Qualcosa ha interrotto la pagina</h1><p>Puoi riprovare a tornare alla pagina principale. Gli esperimenti in memoria verranno azzerati.</p><button onClick={onRetry}>Riprova dalla pagina principale</button><button onClick={() => { location.hash = '/'; location.reload(); }}>Ricarica l’app</button></main>;
}
export default class ErrorBoundary extends React.Component {
  state = { failed: false, attempt: 0 };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <ErrorRecovery onRetry={() => { location.hash = '/'; this.setState(s => ({ failed: false, attempt: s.attempt + 1 })); }} />;
    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}
