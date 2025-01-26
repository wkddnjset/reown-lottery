import { FC } from 'react'

import type { AppProps } from 'next/app'

import { ChakraProvider } from '@chakra-ui/react'
import { createAppKit } from '@reown/appkit'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/configs/react-query'
import theme from '@/configs/theme'
import fonts from '@/configs/theme/foundations/typography/fonts'
import { GlobalStoreProvider } from '@/stores/global/state'

const coveredTheme = {
  ...theme,
  fonts,
}

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()].map(
    (wallet) => wallet as any,
  ),
})

// 2. Create a metadata object - optional
const metadata = {
  name: 'reown-lottery',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png'],
}

createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
})

function withAppProvider(AppComponent: FC<AppProps>) {
  return function WrappedAppComponent(props: AppProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <ChakraProvider resetCSS theme={coveredTheme}>
          <GlobalStoreProvider>
            <AppComponent {...props} />
          </GlobalStoreProvider>
        </ChakraProvider>
      </QueryClientProvider>
    )
  }
}

export default withAppProvider
