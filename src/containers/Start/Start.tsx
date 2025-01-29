import { useState } from 'react'

import {
  Box,
  Button,
  ChakraProps,
  Flex,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'

import Ticket from '@/components/Ticket'
import useLottery from '@/hooks/useLottery'

interface StartProps {
  styles?: {
    container?: ChakraProps
  }
}

function Start({ styles }: StartProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [tickets, setTickets] = useState<[number, number, number, number][]>([])

  const { purchase } = useLottery()

  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers((prev) => prev.filter((n) => n !== num))
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers((prev) => [...prev, num])
    } else {
      setSelectedNumbers([num])
    }
  }

  const handleQuickPick = () => {
    const numbers: number[] = []
    while (numbers.length < 4) {
      const randomNum = Math.floor(Math.random() * 30) + 1
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum)
      }
    }
    setSelectedNumbers(numbers)
  }
  const handleAddTicket = () => {
    if (selectedNumbers.length === 4) {
      setTickets((prev) => [
        ...prev,
        [...selectedNumbers].sort((a, b) => a - b) as [
          number,
          number,
          number,
          number,
        ],
      ])
      setSelectedNumbers([])
    }
  }

  const handlePurchaseTickets = async () => {
    if (tickets.length > 0) {
      // 여기에 티켓 구매 API 호출 로직 추가
      console.log('구매할 티켓들:', tickets)
      await purchase.mutateAsync(tickets)
      // setTickets([])
    }
  }

  return (
    <Box {...styles?.container} pt={'80px'}>
      <Flex direction="column" align="center" gap={4} mt={'20px'}>
        <Ticket numbers={selectedNumbers} />
        <Box bg={'gray.50'} borderRadius={'12px'} p={'12px'}>
          <SimpleGrid columns={6} spacing={2} mb={4}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
              <Button
                key={num}
                onClick={() => handleNumberClick(num)}
                bg={selectedNumbers.includes(num) ? 'brand.500' : 'white'}
                color={selectedNumbers.includes(num) ? 'white' : 'gray.500'}
                w={'40px'}
                h={'40px'}
                borderRadius={'full'}
                border={'1px solid'}
                borderColor={'gray.200'}
              >
                {num}
              </Button>
            ))}
          </SimpleGrid>
          <VStack>
            <Button
              w={'100%'}
              variant={'outline-primary'}
              onClick={handleQuickPick}
            >
              Quick Pick
            </Button>
            <Button onClick={handleAddTicket} w={'100%'}>
              Add Ticket
            </Button>
          </VStack>
        </Box>
        {tickets.length > 0 && (
          <Box w="100%" maxW="360px">
            <Text mb={2}>Selected ({tickets.length} tickets)</Text>
            <VStack alignItems={'center'} spacing={'8px'}>
              {tickets.map((ticket, index) => (
                <Ticket numbers={ticket} key={index} id={index + 1} />
              ))}
            </VStack>
            <Button
              mt={'20px'}
              colorScheme="green"
              w="100%"
              isLoading={purchase.isPending}
              onClick={handlePurchaseTickets}
            >
              Buy Tickets
            </Button>
          </Box>
        )}
      </Flex>
    </Box>
  )
}

export default Start
