// App.tsx
import React from 'react';
// import PixiCanvas from './components/PixiCanvas';
// import PixiCanvas from './components/PixiCanvas';
import MapCanvasIsometric from './components/PhaserCanvas';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CreateCharacter } from './components/CreateCharacter';
import CharacterEventListener from './components/WebsocketCharacter';
import HistoricalCharacterEvents from './components/Character';
import CharacterAlchemyEventListener from './components/AlchemySocket';
import TransferEventsListener from './components/AlchemySocket';
import MapCanvas2 from './components/World2';
import TimeEvents from './components/TimeEvents';

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
      <TimeEvents/>
      <HistoricalCharacterEvents/>


      
      
      <MapCanvas2/>
    </div>
  );
};

export default App;
