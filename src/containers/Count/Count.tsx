import { useEffect, useState } from 'react'

import {
  Button,
  Center,
  ChakraProps,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useAppKitAccount } from '@reown/appkit/react'
import { Keypair } from '@solana/web3.js'

import Card from './components/Card'
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
        {/* <Button
          onClick={() => initialize.mutateAsync(Keypair.generate())}
          isLoading={initialize.isPending}
        >
          Create {initialize.isPending && '...'}
        </Button>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={'10px'}>
          {accounts.data
            ?.slice(0, 10)
            .map((account) => (
              <Card
                key={account.publicKey.toBase58()}
                account={account.publicKey}
              />
            ))}
        </SimpleGrid> */}
      </VStack>
    </Center>
  )
}

export default Count
