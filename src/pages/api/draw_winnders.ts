//@delete:file
import type { NextApiRequest, NextApiResponse } from 'next'

export default function drawWinners(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ name: 'John Doe' })
}
