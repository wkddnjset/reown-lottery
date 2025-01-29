import { useEffect, useMemo, useState } from 'react'

import { useToast } from '@chakra-ui/react'
import { BN } from '@coral-xyz/anchor'
import { useAppKitAccount } from '@reown/appkit/react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { getLotteryProgram, getLotteryProgramId } from '@/anchor'
import { useAnchorProvider } from '@/hooks/useAnchorProvider'

const POOL_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_POOL_ADDRESS!
const DEV_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_DEV_ADDRESS!

export const useLottery = () => {
  const [lotteryAddress, setLotteryAddress] = useState<any>()
  const [ticketAddress, setTicketAddress] = useState<any>()

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
            [Buffer.from('lottery'), new PublicKey(address).toBuffer()],
            programId,
          )
          setLotteryAddress(lotteryPDA.toBase58())
        }
        if (!ticketAddress && lotteryAddress) {
          const [ticketPDA] = await PublicKey.findProgramAddress(
            [
              Buffer.from('ticket'),
              new PublicKey(lotteryAddress).toBuffer(),
              new PublicKey(address).toBuffer(),
            ],
            programId,
          )
          setTicketAddress(ticketPDA.toBase58())
        }
      }
    }
    updateState()
  }, [address, programId, lotteryAddress, ticketAddress])

  const initialize = useMutation({
    mutationKey: ['test', 'initialize', { cluster }],
    mutationFn: () => {
      const now = new Date()
      const utcHours = now.getUTCHours()

      const targetHour = utcHours >= 12 ? 24 : 12

      const target = new Date(now)
      target.setUTCHours(targetHour, 0, 0, 0)

      const nextDrawTime = Math.floor(target.getTime() / 1000) + 3600 * 12 // 12시간 후

      return program.methods
        .initializeLottery(new BN(nextDrawTime))
        .accounts({
          user: address,
          dev: DEV_ADDRESS,
          pool: POOL_ADDRESS,
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

  const purchase = useMutation({
    mutationKey: ['test', 'purchase', { cluster }],
    mutationFn: (tickets: [number, number, number, number][]) => {
      console.log('Purchase Ticket:', tickets)
      return program.methods
        .purchaseTickets(tickets)
        .accounts({
          lottery: new PublicKey(lotteryAddress),
          user: address,
          pool: POOL_ADDRESS,
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
    onError: (error) =>
      toast({
        title: 'Failed to purchase ticket',
        description: error.message,
        status: 'error',
      }),
  })

  const getTickets = useQuery({
    queryKey: ['test', 'getTickets', { cluster }],
    queryFn: () => {
      return program.account.lottery.fetch(lotteryAddress)
    },
  })

  return {
    program,
    programId,
    purchase,
    initialize,
    getTickets,
  }
}

export default useLottery
