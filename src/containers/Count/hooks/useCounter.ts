import { useMemo } from 'react'

import { useToast } from '@chakra-ui/react'
import { AnchorProvider, BN, Wallet } from '@coral-xyz/anchor'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import type { Provider } from '@reown/appkit-adapter-solana/react'
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from '@reown/appkit/react'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import {
  Cluster,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'

import { getCountProgram, getCountProgramId } from '@/anchor'

const NETWORK = {
  'Solana Mainnet': 'mainnet-beta',
  'Solana Testnet': 'testnet',
  'Solana Devnet': 'devnet',
}

export const useCounter = () => {
  const { isConnected, address } = useAppKitAccount()
  const wallet = useAnchorWallet()
  const { connection } = useAppKitConnection()
  const { caipNetwork } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<Provider>('solana')

  const cluster = NETWORK[caipNetwork?.name as keyof typeof NETWORK]

  //   const program = getCountProgram(provider, programId)

  const program = useMemo(() => {
    if (connection) {
      const programId = getCountProgramId(cluster as Cluster)
      //   const programId = new PublicKey(
      //     'coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF',
      //   )
      const provider = new AnchorProvider(connection, walletProvider, {
        commitment: 'processed',
      })
      return getCountProgram(provider, programId)
    }
  }, [connection, walletProvider, cluster])

  const initialize = async () => {
    if (!connection || !program) return

    const wallet = new PublicKey(address as string) // User wallet
    const newAccountKp = Keypair.generate()

    // Send transaction
    const data = new BN(42)
    const txHash = await program.methods
      .initialize(data)
      .accounts({
        counter: newAccountKp.publicKey,
        authority: wallet,
        system_program: SystemProgram.programId,
      })
      .signers([newAccountKp])
      .rpc()
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`)

    // Confirm transaction
    await connection.confirmTransaction(txHash)
  }

  const getCount = async () => {
    if (!program) return
    let count = 0
    console.log('programId', program.programId.toBase58())
    const counterPDA = await PublicKey.findProgramAddress(
      [Buffer.from('counter')],
      program.programId,
    )
    console.log('counterPDA', counterPDA[0].toBase58())

    try {
      const counterAccount = await program.account.counter.fetch(counterPDA[0])
      console.log('counterAccount', counterAccount)
      count = counterAccount.count.toNumber()
    } catch (err) {
      console.error('Failed to fetch count:', err)
    }
    return count
  }

  const incrementCount = async () => {
    if (!program) return

    const counterPDA = await PublicKey.findProgramAddress(
      [Buffer.from('counter')],
      program.programId,
    )

    try {
      await program.methods
        .increment()
        .accounts({
          counter: counterPDA[0],
        })
        .rpc()
      getCount() // Refresh count after increment
    } catch (err) {
      console.error('Failed to increment count:', err)
    }
  }

  const getBalance = async () => {
    if (!address) return
    const wallet = new PublicKey(address as string)
    const balance = await connection?.getBalance(wallet) // get the amount in LAMPORTS

    // console.log(`${balance / LAMPORTS_PER_SOL} SOL`)
    return balance
  }

  return { getCount, getBalance, incrementCount, initialize }
}

export default useCounter
