import { useEffect, useState } from 'react'

import { Text, VStack } from '@chakra-ui/react'

function Countdown() {
  const [timeLeft, setTimeLeft] = useState('00:00:00')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const utcHours = now.getUTCHours()

      // 다음 목표 시간 계산 (0시 또는 12시)
      const targetHour = utcHours >= 12 ? 24 : 12

      const target = new Date(now)
      target.setUTCHours(targetHour, 0, 0, 0)

      let diff = target.getTime() - now.getTime()

      // 시, 분, 초 계산
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
  }, [])
  return (
    <VStack spacing={'0px'}>
      <Text textStyle={'pre-display-02'} lineHeight={'1'}>
        {timeLeft}
      </Text>
      <Text textStyle={'pre-body-04'} color={'content.5'}>
        Until Next Winner
      </Text>
    </VStack>
  )
}
export default Countdown
