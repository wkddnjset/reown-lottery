import { NextApiRequest, NextApiResponse } from 'next'

import { AnchorProvider, BN, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'

import bs58 from 'bs58'

import { getLotteryProgram, getLotteryProgramId } from '@/anchor'

const cluster = 'devnet'
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_ADMIN_ADDRESS
const SECRET_KEY = process.env.LOTTERY_ADMIN_PRIVATE_KEY // 환경변수에 보관된 Keypair
const RPC_URL = `https://api.${cluster}.solana.com`
const RESET_LOTTERY_TIME = process.env.NEXT_PUBLIC_RESET_LOTTERY_TIME! || 1

if (!SECRET_KEY) throw new Error('LOTTERY_DEV_PRIVATE_KEY is not set')

const keypair = Keypair.fromSecretKey(bs58.decode(SECRET_KEY))
const connection = new Connection(RPC_URL, 'confirmed')
const wallet = new Wallet(keypair)
const provider = new AnchorProvider(connection, wallet, {
  commitment: 'confirmed',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const authHeader = req.headers['authorization']

    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(403).json({ error: 'Forbidden: Unauthorized' })
    }

    if (!ADMIN_ADDRESS) throw new Error('ADMIN_ADDRESS is not set')

    const programId = await getLotteryProgramId(cluster)

    const program = await getLotteryProgram(provider, programId)

    const [lotteryPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('lottery'), new PublicKey(ADMIN_ADDRESS).toBuffer()],
      programId,
    )
    // 1. 현재 lottery 상태 가져오기
    const lottery = await program.account.lottery.fetch(lotteryPDA)
    if (!lottery)
      return res.status(404).json({ error: 'No active lottery found' })

    const { drawTime } = lottery
    const now = Math.floor(Date.now() / 1000) // 현재 시간 (초)

    // 2. draw_time이 지나지 않았으면 종료
    if (now < Number(drawTime)) {
      return res.status(200).json({ message: 'No eligible lotteries to draw' })
    }

    // 4. 12시간 뒤의 draw_time 설정
    const currentDate = new Date()
    const nextHour = new Date(currentDate)
    nextHour.setHours(
      currentDate.getHours() + Number(RESET_LOTTERY_TIME),
      0,
      0,
      0,
    )
    const nextDrawTime = new BN(Math.floor(nextHour.getTime() / 1000))

    // 5. Pick Winners 실행
    console.log('Executing pickWinners...')
    const tx = await program.methods
      .pickWinners(nextDrawTime)
      .accounts({
        lottery: new PublicKey(lotteryPDA),
        user: keypair.publicKey,
      })
      .rpc()

    console.log('Pick Winners Successful:', tx)

    return res.status(200).json({ message: 'Pick Winners successful', tx })
  } catch (error: any) {
    console.error('Error picking winners:', error)
    return res.status(500).json({ error: error.message })
  }
}
