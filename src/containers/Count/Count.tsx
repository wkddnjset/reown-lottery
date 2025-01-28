import { useEffect, useState } from 'react'

import { Button, Center, ChakraProps, Text, VStack } from '@chakra-ui/react'
import { useAppKitAccount } from '@reown/appkit/react'

// import { useCountProgram } from './hooks/useCountProgram'
import { useCounter } from './hooks/useCounter'

interface CountProps {
  styles?: {
    container?: ChakraProps
  }
}

function Count({ styles }: CountProps) {
  const { getCount, getBalance, incrementCount, initialize } = useCounter()
  // const { initialize, accounts } = useCountProgram()
  const { address } = useAppKitAccount()
  const [count, setCount] = useState<number>()

  useEffect(() => {
    const fetchCount = async () => {
      const result = await getCount()
      const balance = await getBalance()
      setCount(result)
      console.log('count', result)
      console.log('balance', balance)
    }
    fetchCount()
  }, [getCount, getBalance])

  console.log('count', count)

  return (
    <Center {...styles?.container} flexDirection="column">
      <VStack spacing={'12px'}>
        <Text textStyle={'pre-heading-01'}>Counter</Text>
        <Text>
          {address?.slice(0, 4)}...{address?.slice(-4)}
        </Text>
        <Button onClick={incrementCount}>Increment</Button>
        <Button onClick={initialize}>Initialize</Button>
      </VStack>
    </Center>
  )
}

export default Count
