// App.tsx
import React from 'react';
// import PixiCanvas from './components/PixiCanvas';
// import PixiCanvas from './components/PixiCanvas';
import MapCanvasIsometric from './components/PhaserCanvas';
import { ConnectButton } from '@rainbow-me/rainbowkit';

/**
 * Componente principal de la aplicación.
 * Aquí se pueden incluir rutas, estado global y otros componentes.
 */
const App: React.FC = () => {
  return (
    <div className="App">
      {/* Encabezado de la aplicación */}
      <header className="App-header">
        <h1>Bienvenido a Conquest The Block</h1>
        <p>Juego web desarrollado con React/TypeScript/PixiJS</p>
      </header>
      <ConnectButton />
      <MapCanvasIsometric/>
    </div>
  );
};

export default App;
