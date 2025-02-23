// App.tsx
import React from 'react';
// import PixiCanvas from './components/PixiCanvas';
import PixiCanvas from './components/PixiCanvas';

/**
 * Componente principal de la aplicación.
 * Aquí se pueden incluir rutas, estado global y otros componentes.
 */
const App: React.FC = () => {
  return (
    <div className="App">
      {/* Encabezado de la aplicación */}
      <header className="App-header">
        <h1>Welcome to CTB</h1>
        <p> CryptoWebGame build in React/TypeScript/PixiJS</p>
      </header>
      <PixiCanvas />
    </div>
  );
};

export default App;
