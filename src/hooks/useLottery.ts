import { useEffect, useMemo, useState } from 'react'

import { useToast } from '@chakra-ui/react'
import { BN } from '@coral-xyz/anchor'
import { useAppKitAccount } from '@reown/appkit/react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { getLotteryProgram, getLotteryProgramId } from '@/anchor'
import { useAnchorProvider } from '@/hooks/useAnchorProvider'

// const POOL_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_POOL_ADDRESS!
const DEV_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_DEV_ADDRESS!
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_ADMIN_ADDRESS!
const RESET_LOTTERY_TIME = process.env.NEXT_PUBLIC_RESET_LOTTERY_TIME! || 1

export const useLottery = () => {
  const [lotteryAddress, setLotteryAddress] = useState<any>()
  const [poolAddress, setPoolAddress] = useState<any>()

  const toast = useToast()
  const { address } = useAppKitAccount()

  const { provider, cluster } = useAnchorProvider()
  const programId = useMemo(
    () => getLotteryProgramId(cluster as Cluster),
    [cluster],
  )
  const program = useMemo(
    () => getLotteryProgram(provider, programId),
    [provider, programId],
  )

  useEffect(() => {
    const updateState = async () => {
      if (address) {
        if (!lotteryAddress) {
          const [lotteryPDA] = await PublicKey.findProgramAddress(
            [Buffer.from('lottery'), new PublicKey(ADMIN_ADDRESS).toBuffer()],
            programId,
          )
          setLotteryAddress(lotteryPDA.toBase58())
        }
        if (!poolAddress) {
          const [poolPDA] = await PublicKey.findProgramAddress(
            [Buffer.from('lottery_pool')],
            programId,
          )
          setPoolAddress(poolPDA.toBase58())
        }
      }
    }
    updateState()
  }, [address, programId, lotteryAddress, poolAddress])

  const initialize = useMutation({
    mutationKey: ['test', 'initialize', { cluster }],
    mutationFn: () => {
      const currentDate = new Date()
      const nextHour = new Date(currentDate)
      nextHour.setHours(
        currentDate.getHours() + Number(RESET_LOTTERY_TIME),
        0,
        0,
        0,
      )
      const nextDrawTime = new BN(Math.floor(nextHour.getTime() / 1000))

      return program.methods
        .initializeLottery(new BN(nextDrawTime))
        .accounts({
          user: address,
          dev: DEV_ADDRESS,
          pool: poolAddress,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      toast({
        title: 'Transaction successful',
        description: signature,
        status: 'success',
      })
    },
    onError: (error) => {
      console.log(error.message)
      toast({
        title: 'Failed to initialize account',
        description: error.message,
        status: 'error',
      })
    },
  })

  const purchaseTickets = useMutation({
    mutationKey: ['test', 'purchase', { cluster }],
    mutationFn: async (tickets: [number, number, number, number][]) => {
      console.log('Purchase Ticket:', tickets)
      if (!address) return

      return program.methods
        .purchaseTickets(tickets)
        .accounts({
          lottery: lotteryAddress,
          dev: DEV_ADDRESS,
          pool: poolAddress,
          user: new PublicKey(address),
        })
        .rpc()
    },
    onError: (error) =>
      toast({
        title: 'Failed to purchase ticket',
        description: error.message,
        status: 'error',
      }),
    onSuccess: (signature) => {
      toast({
        title: 'Transaction successful',
        description: `tx: ${signature}`,
        status: 'success',
      })
    },
  })

  const pickWinners = useMutation({
    mutationKey: ['test', 'pickWinners', { cluster }],
    mutationFn: async () => {
      console.log('Pick Winners')
      if (!address) return

      const currentDate = new Date()
      const nextHour = new Date(currentDate)
      nextHour.setHours(
        currentDate.getHours() + Number(RESET_LOTTERY_TIME),
        0,
        0,
        0,
      )
      const nextDrawTime = new BN(Math.floor(nextHour.getTime() / 1000))

      console.log('nextDrawTime', nextDrawTime)
      return program.methods
        .pickWinners(new BN(nextDrawTime))
        .accounts({
          lottery: lotteryAddress,
          user: new PublicKey(address),
        })
        .rpc()
    },
    onError: (error) =>
      toast({
        title: 'Failed to draw winners',
        description: error.message,
        status: 'error',
      }),
    onSuccess: (signature) => {
      toast({
        title: 'Draw Winners successful',
        description: `tx: ${signature}`,
        status: 'success',
      })
    },
  })

  const claimPrize = useMutation({
    mutationKey: ['test', 'claim', { cluster }],
    mutationFn: async ({
      roundId,
      rank,
    }: {
      roundId: number
      rank: number
    }) => {
      if (!address) return
      return program.methods
        .claimPrize(new BN(roundId), rank)
        .accounts({
          lottery: lotteryAddress,
          pool: poolAddress,
          user: new PublicKey(address),
        })
        .rpc()
    },
  })

  const getLottery = useQuery({
    queryKey: ['test', 'getLottery', { cluster }],
    queryFn: () => {
      return program.account.lottery.fetch(lotteryAddress)
    },
  })

  return {
    program,
    programId,
    purchaseTickets,
    initialize,
    getLottery,
    pickWinners,
    claimPrize,
    poolAddress,
  }
}

export default useLottery
