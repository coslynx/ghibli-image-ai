import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure App.tsx exists and exports a default component
import './styles/global.css'; // Ensure global.css exists

// Find the root element where the React application will be mounted
const rootElement = document.getElementById('root');

// Critical check: Ensure the root element exists before proceeding
if (!rootElement) {
  console.error(
    "Critical Error: Root element with ID 'root' not found in the DOM. Cannot mount React application."
  );
  // Throwing an error stops script execution decisively if the root is missing
  throw new Error(
    "Root element '#root' not found. Check your index.html file."
  );
}

// Create a React root instance attached to the DOM element
// This uses the concurrent rendering API introduced in React 18+
const reactRoot = ReactDOM.createRoot(rootElement);

// Render the main application component within StrictMode
// StrictMode activates additional checks and warnings for potential problems in the application during development
reactRoot.render(
  <StrictMode>
    <App />
  </StrictMode>
);