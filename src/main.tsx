// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider,http } from 'wagmi';
import { mainnet , arbitrumNova,bscTestnet} from 'wagmi/chains'
  import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
  import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css';

// import './styles/index.css'; // Importa los estilos globales

// Se obtiene el elemento root desde el archivo index.html
const rootElement = document.getElementById('root');

const queryClient = new QueryClient()

const config = getDefaultConfig({

  appName: 'RainbowKit demo',

  projectId: 'Conquest',

  chains: [mainnet,arbitrumNova,bscTestnet],

  transports: {

    [mainnet.id]: http(),
    [arbitrumNova.id]: http(),
    [bscTestnet.id]: http(),

  },

})



if (rootElement) {
  // Se crea el root de React y se renderiza el componente principal <App />
  ReactDOM.createRoot(rootElement).render(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
    </RainbowKitProvider>
    </QueryClientProvider>
    </WagmiProvider>
  );
}

