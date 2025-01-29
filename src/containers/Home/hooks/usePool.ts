import { PublicKey } from '@solana/web3.js'

import { useAnchorProvider } from '@/hooks/useAnchorProvider'

const POOL_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_POOL_ADDRESS!

const usePool = () => {
  const { connection } = useAnchorProvider()

  const getBalance = async () => {
    try {
      const publicKey = new PublicKey(POOL_ADDRESS)
      const balance = await connection.getBalance(publicKey)
      const solBalance = balance / 1_000_000_000
      return solBalance
    } catch (error) {
      return null
    }
  }

  return { getBalance }
}

export default usePool
