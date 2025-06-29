import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.less';

const root = ReactDOM.createRoot(
  document.getElementById('root') // No "as HTMLElement"
);

root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);