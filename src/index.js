import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Suppress ResizeObserver errors globally
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Handle script errors and other unhandled errors
window.addEventListener('error', (e) => {
  // Suppress ResizeObserver errors
  if (e.message && e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  
  // Suppress generic script errors (often from external CDNs)
  if (e.message === 'Script error.' || e.message === '') {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  
  // Log other errors for debugging
  console.log('Caught error:', e.message, e.filename, e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && e.reason.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    e.preventDefault();
    return false;
  }
  
  // Suppress generic promise rejections
  if (e.reason && e.reason.message === 'Script error.') {
    e.preventDefault();
    return false;
  }
});

// Handle MediaPipe loading errors
window.addEventListener('error', (e) => {
  if (e.filename && e.filename.includes('mediapipe')) {
    console.log('MediaPipe loading error (suppressed):', e.message);
    e.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
