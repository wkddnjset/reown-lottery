import { useEffect, useState } from 'react'

import { Text, VStack } from '@chakra-ui/react'

import useLottery from '@/hooks/useLottery'

function Countdown() {
  const [timeLeft, setTimeLeft] = useState('00:00:00')
  const { getLottery } = useLottery()

  const { data } = getLottery

  const drawTime = data?.drawTime || 0

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()

      const targetTime = drawTime ? new Date(Number(drawTime) * 1000) : null

      if (!targetTime) {
        return '00:00:00'
      }
      return calculateTimeDiff(targetTime, now)
    }

    const calculateTimeDiff = (target: Date, now: Date) => {
      let diff = target.getTime() - now.getTime()

      if (diff < 0) return '00:00:00'

      const hours = Math.floor(diff / (1000 * 60 * 60))
      diff -= hours * 1000 * 60 * 60
      const minutes = Math.floor(diff / (1000 * 60))
      diff -= minutes * 1000 * 60
      const seconds = Math.floor(diff / 1000)

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [drawTime])

  return (
    <VStack spacing={'0px'}>
      {drawTime === 0 ?
        <Text textStyle={'pre-display-02'} lineHeight={'1'}>
          00:00:00
        </Text>
      : <Text textStyle={'pre-display-02'} lineHeight={'1'}>
          {timeLeft}
        </Text>
      }
      <Text textStyle={'pre-body-04'} color={'content.5'}>
        Until Next Winner
      </Text>
    </VStack>
  )
}
export default Countdown
