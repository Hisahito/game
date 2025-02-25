import { 
    createConfig, 
    webSocket
  } from '@wagmi/core'
  import { mainnet, sepolia , bscTestnet} from '@wagmi/core/chains'
  
  export const config = createConfig({
    chains: [bscTestnet],
    transports: {
      [bscTestnet.id]: webSocket('wss://bnb-testnet.g.alchemy.com/v2/QPfxbvXMQB4R4OVfa8u1qVp49_cNVHhh'), 
    },
  })