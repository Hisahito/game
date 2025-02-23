// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import './styles/index.css'; // Importa los estilos globales

// Se obtiene el elemento root desde el archivo index.html
const rootElement = document.getElementById('root');

if (rootElement) {
  // Se crea el root de React y se renderiza el componente principal <App />
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

