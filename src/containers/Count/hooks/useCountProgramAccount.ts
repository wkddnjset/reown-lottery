import { useToast } from '@chakra-ui/react'
import { PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useAppKitNetwork } from '@/configs/appkit'

import { useCountProgram } from './useCountProgram'

const NETWORK = {
  'Solana Mainnet': 'mainnet-beta',
  'Solana Testnet': 'testnet',
  'Solana Devnet': 'devnet',
}

export function useCountProgramAccount({ account }: { account: PublicKey }) {
  const { caipNetwork } = useAppKitNetwork()
  const toast = useToast()

  const cluster = NETWORK[caipNetwork?.name as keyof typeof NETWORK]

  const transactionToast = (signature: string) => {
    toast({
      title: 'Transaction sent',
      description: `tx/${signature}`,
      status: 'success',
    })
  }
  const { program, accounts } = useCountProgram()

  const accountQuery = useQuery({
    queryKey: ['test', 'fetch', { cluster, account }],
    queryFn: () => program.account.test.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['test', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ test: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx as string)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['test', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ test: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx as string)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['test', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ test: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx as string)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['test', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ test: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx as string)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
