import { useMemo } from 'react'

import { useToast } from '@chakra-ui/react'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { getTestProgram, getTestProgramId } from '@/anchor'
import { useAppKitNetwork } from '@/configs/appkit'
import { useAnchorProvider } from '@/hooks/useAnchorProvider'

const NETWORK = {
  'Solana Mainnet': 'mainnet-beta',
  'Solana Testnet': 'testnet',
  'Solana Devnet': 'devnet',
}

export function useCountProgram() {
  const { connection } = useConnection()
  const { caipNetwork } = useAppKitNetwork()

  const cluster = NETWORK[caipNetwork?.name as keyof typeof NETWORK]

  const toast = useToast()
  const provider = useAnchorProvider()

  const programId = useMemo(
    () => getTestProgramId(cluster as Cluster),
    [cluster],
  )
  const program = useMemo(
    () => getTestProgram(provider, programId),
    [provider, programId],
  )

  const accounts = useQuery({
    queryKey: ['test', 'all', { cluster }],
    queryFn: () => program.account.test.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['test', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ test: keypair.publicKey, payer: provider.publicKey })
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
    getProgramAccount,
    initialize,
  }
}
