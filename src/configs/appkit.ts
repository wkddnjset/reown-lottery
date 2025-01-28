import { type ReactNode } from 'react'

import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { CloudAuthSIWX } from '@reown/appkit-siwx'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!

export const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()].map(
    (wallet) => wallet as any,
  ),
})

const metadata = {
  name: 'reown-lottery',
  description: 'AppKit Example',
  url: 'https://reown-lottery.vercel.app', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png'],
}

// Create modal
export const modal = createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata,
  features: {
    email: true, // default to true
    analytics: true,
    socials: ['google', 'x', 'github'],
    emailShowWallets: true, // default to true
    onramp: false, // Optional - true by default
  },
  //   siwx: new CloudAuthSIWX(),
  projectId,
  themeMode: 'dark',
})

function AppKitProvider({ children }: { children: ReactNode }) {
  return children
}

export default AppKitProvider
