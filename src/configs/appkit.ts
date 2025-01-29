import { type ReactNode, useCallback, useEffect, useMemo } from 'react'

import { useRouter } from 'next/router'

import { useToast } from '@chakra-ui/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { CloudAuthSIWX } from '@reown/appkit-siwx'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import { createAppKit, useAppKitAccount } from '@reown/appkit/react'
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
  icons: ['https://reown-lottery.vercel.app/images/512.png'],
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

const AUTH_PATHS = ['/admin', '/start', '/tickets']
function AppKitProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAppKitAccount()
  const router = useRouter()

  const toast = useToast()

  const isAdmin = useMemo(() => {
    return address && process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.includes(address)
  }, [address])

  const goHome = useCallback(() => {
    router.push('/')
    if (!toast.isActive('wallet-connect-toast')) {
      toast({
        title: 'Please connect your wallet',
        description: 'Please connect your wallet to continue',
        status: 'error',
        position: 'top',
        id: 'wallet-connect-toast',
      })
    }
  }, [router, toast])

  useEffect(() => {
    if (!isConnected && AUTH_PATHS.includes(router.pathname)) {
      goHome()
    }
    if (AUTH_PATHS.includes(router.pathname) && !isAdmin) {
      goHome()
    }
  }, [isConnected, address, router, isAdmin, goHome])
  return children
}

export default AppKitProvider
