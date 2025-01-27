import {
  Button,
  Center,
  ChakraProps,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Keypair, PublicKey } from '@solana/web3.js'

import { useAppKitAccount } from '@/configs/appkit'

import Card from './components/Card'
import { useCountProgram } from './hooks/useCountProgram'

interface CountProps {
  styles?: {
    container?: ChakraProps
  }
}

function Count({ styles }: CountProps) {
  const { initialize, accounts } = useCountProgram()
  const { address } = useAppKitAccount()

  const createKeypairFromAddress = () => {
    if (!address) return null
    const addressBytes = new PublicKey(address).toBytes()
    return Keypair.fromSeed(addressBytes.slice(0, 32))
  }

  const keypair = createKeypairFromAddress()

  return (
    <Center {...styles?.container} flexDirection="column">
      <VStack spacing={'12px'}>
        <Text textStyle={'pre-heading-01'}>Counter</Text>
        <Text>
          {address?.slice(0, 4)}...{address?.slice(-4)}
        </Text>
        <Button
          onClick={() => initialize.mutateAsync(keypair as Keypair)}
          isLoading={initialize.isPending}
        >
          Create {initialize.isPending && '...'}
        </Button>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={'10px'}>
          {accounts.data?.map((account) => (
            <Card
              key={account.publicKey.toBase58()}
              account={account.publicKey}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Center>
  )
}

export default Count
