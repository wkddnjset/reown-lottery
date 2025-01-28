import { useMemo } from 'react'

import { useToast } from '@chakra-ui/react'
import { AnchorProvider } from '@coral-xyz/anchor'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'
import { Cluster, Keypair } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { getTestProgram, getTestProgramId } from '@/anchor'

const NETWORK = {
  'Solana Mainnet': 'mainnet-beta',
  'Solana Testnet': 'testnet',
  'Solana Devnet': 'devnet',
}

export function useCountProgram() {
  const { connection } = useAppKitConnection()

  const { caipNetwork } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<any>('solana')

  const cluster = NETWORK[caipNetwork?.name as keyof typeof NETWORK]

  const toast = useToast()
  const provider = useMemo(
    () =>
      new AnchorProvider(connection!, walletProvider, {
        commitment: 'confirmed',
      }),
    [connection, walletProvider],
  )
  // const provider = useAnchorProvider()

  const programId = useMemo(
    () => getTestProgramId(cluster as Cluster),
    [cluster],
  )
  const program = useMemo(
    () => getTestProgram(provider, programId),
    [provider, programId],
  )

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection?.getParsedAccountInfo(programId),
  })

  const accounts = useQuery({
    queryKey: ['test', 'all', { cluster }],
    queryFn: () => program.account.test.all(),
  })

  const initialize = useMutation({
    mutationKey: ['test', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ test: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      toast({
        title: 'Transaction sent',
        description: `tx/${signature}`,
        status: 'success',
      })
      return accounts.refetch()
    },
    onError: () =>
      toast({ title: 'Failed to initialize account', status: 'error' }),
  })

  return {
    program,
    programId,
    accounts,
    initialize,
    getProgramAccount,
  }
}
