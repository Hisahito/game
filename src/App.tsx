// App.tsx
import React from 'react';
// import PixiCanvas from './components/PixiCanvas';
// import PixiCanvas from './components/PixiCanvas';
import MapCanvasIsometric from './components/PhaserCanvas';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CreateCharacter } from './components/CreateCharacter';
import CharacterEventListener from './components/WebsocketCharacter';
import HistoricalCharacterEvents from './components/Character';

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
        <p>Juego web desarrollado con React/TypeScript/Phaser</p>
      </header>
      <ConnectButton />
      <CreateCharacter/>
      <CharacterEventListener/>
      <HistoricalCharacterEvents/>
      <MapCanvasIsometric/>
    </div>
  );
};

export default App;
