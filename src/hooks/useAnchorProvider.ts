import { AnchorProvider } from '@coral-xyz/anchor'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { useAppKitProvider } from '@reown/appkit/react'
import { AnchorWallet } from '@solana/wallet-adapter-react'

export function useAnchorProvider() {
  const { connection } = useAppKitConnection()
  const { walletProvider } = useAppKitProvider<any>('solana')

  console.log('walletProvider', walletProvider)
  return new AnchorProvider(connection!, walletProvider as AnchorWallet, {
    commitment: 'confirmed',
  })
}
