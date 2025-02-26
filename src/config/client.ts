import { createPublicClient, http ,webSocket} from 'viem'
import { mainnet,bscTestnet } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http('https://arbnova-mainnet.g.alchemy.com/v2/QPfxbvXMQB4R4OVfa8u1qVp49_cNVHhh')
})