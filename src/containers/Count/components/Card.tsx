import { useMemo } from 'react'

import {
  Button,
  Center,
  HStack,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { PublicKey } from '@solana/web3.js'

import { useCountProgramAccount } from '../hooks/useCountProgramAccount'

function Card({ account }: { account: PublicKey }) {
  const {
    accountQuery,
    incrementMutation,
    setMutation,
    decrementMutation,
    closeMutation,
  } = useCountProgramAccount({
    account,
  })

  const count = useMemo(
    () => accountQuery.data?.count ?? 0,
    [accountQuery.data?.count],
  )

  if (accountQuery.isLoading) return <Skeleton w="250px" h="214px" />
  return (
    <Center
      flexDirection="column"
      p={'20px'}
      border="1px solid"
      borderColor="gray.500"
      borderRadius="md"
      w="250px"
    >
      <VStack spacing={'12px'}>
        <Text
          textStyle={'pre-heading-01'}
          onClick={() => accountQuery.refetch()}
        >
          {count}
        </Text>
        <HStack spacing={'6px'}>
          <Button
            size={'sm'}
            onClick={() => incrementMutation.mutate()}
            px={'10px'}
          >
            Increment
          </Button>
          <Button
            size={'sm'}
            onClick={() => decrementMutation.mutate()}
            px={'10px'}
          >
            Decrement
          </Button>
          <Button
            size={'sm'}
            onClick={() => setMutation.mutate(10)}
            px={'10px'}
          >
            Set
          </Button>
        </HStack>
        <Text>
          {account.toBase58().slice(0, 4)}...{account.toBase58().slice(-4)}
        </Text>
        <Button size={'sm'} onClick={() => closeMutation.mutate()}>
          Close
        </Button>
      </VStack>
    </Center>
  )
}

export default Card
