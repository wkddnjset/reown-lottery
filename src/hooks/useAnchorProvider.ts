import { AnchorProvider } from '@coral-xyz/anchor'
import { AnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

import {
  useAppKitAccount,
  useAppKitConnection,
  useAppKitProvider,
  useWalletInfo,
} from '@/configs/appkit'

export function useAnchorProvider() {
  const { connection } = useAppKitConnection()
  const wallet = useWallet()
  const { address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<any>('solana')

  //    autoConnect: boolean;
  //     wallets: Wallet[];
  //     wallet: Wallet | null;
  //     publicKey: PublicKey | null;
  //     connecting: boolean;
  //     connected: boolean;
  //     disconnecting: boolean;

  //     select(walletName: WalletName | null): void;
  //     connect(): Promise<void>;
  //     disconnect(): Promise<void>;

  //     sendTransaction: WalletAdapterProps['sendTransaction'];
  //     signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined;
  //     signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined;
  //     signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined;
  //     signIn: SignInMessageSignerWalletAdapterProps['signIn'] | undefined;

  //   const walletAnchor: AnchorWallet = {
  //     publicKey: new PublicKey(address as string),
  //     signTransaction: walletProvider?.signTransaction,
  //     signAllTransactions: walletProvider?.signAllTransactions,
  //   }

  return new AnchorProvider(connection!, walletProvider as AnchorWallet, {
    commitment: 'confirmed',
  })
}
