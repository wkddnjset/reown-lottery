import { PublicKey } from '@solana/web3.js'

import { useAnchorProvider } from '@/hooks/useAnchorProvider'
import useLottery from '@/hooks/useLottery'

const usePool = () => {
  const { poolAddress } = useLottery()
  const { connection } = useAnchorProvider()

  const getBalance = async () => {
    try {
      const publicKey = new PublicKey(poolAddress)
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
