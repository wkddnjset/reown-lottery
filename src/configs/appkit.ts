import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { CloudAuthSIWX } from '@reown/appkit-siwx'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useAppKitEvents,
  useAppKitNetwork,
  useAppKitProvider,
  useAppKitState,
  useAppKitTheme,
  useDisconnect,
  useWalletInfo,
} from '@reown/appkit/react'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!

// const networks = [solana, solanaTestnet, solanaDevnet]

// Setup solana adapter
const solanaAdapter = new SolanaAdapter({
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
const modal = createAppKit({
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
  themeMode: 'light',
})

export {
  modal,
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork,
  useDisconnect,
  useAppKitProvider,
  useAppKitConnection,
}
