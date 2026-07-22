import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import TesterGate from './components/TesterGate.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TesterGate>
      <App />
    </TesterGate>
  </React.StrictMode>
);
