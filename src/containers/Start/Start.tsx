import { useState } from 'react'

import {
  Box,
  Button,
  ChakraProps,
  Flex,
  Image,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'

interface StartProps {
  styles?: {
    container?: ChakraProps
  }
}

function Start({ styles }: StartProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [tickets, setTickets] = useState<number[][]>([])

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
        [...selectedNumbers].sort((a, b) => a - b),
      ])
      setSelectedNumbers([])
    }
  }

  const handlePurchaseTickets = () => {
    if (tickets.length > 0) {
      // 여기에 티켓 구매 API 호출 로직 추가
      console.log('구매할 티켓들:', tickets)
      setTickets([])
    }
  }

  return (
    <Box {...styles?.container} pt={'80px'}>
      <Flex direction="column" align="center" gap={4} mt={'20px'}>
        <Flex gap={'8px'} justifyContent={'center'} zIndex={10} h={'40px'}>
          {selectedNumbers.map((num) => (
            <Box
              key={num}
              bg="white"
              color="black"
              borderRadius="full"
              w={'40px'}
              h={'40px'}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {num}
            </Box>
          ))}
        </Flex>
        <Button colorScheme="green" onClick={handleQuickPick} mb={4}>
          Quick Pick
        </Button>

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
          <Button onClick={handleAddTicket} w={'100%'}>
            Add Ticket
          </Button>
        </Box>
        {tickets.length > 0 && (
          <Box w="100%" maxW="360px">
            <Text mb={2}>Selected ({tickets.length} tickets)</Text>
            {tickets.map((ticket, index) => (
              <Flex
                key={index}
                bg="gray.50"
                p={2}
                borderRadius="md"
                mb={2}
                justify="center"
                gap={2}
              >
                {ticket.map((num) => (
                  <Box
                    key={num}
                    bg="black"
                    color="white"
                    borderRadius="full"
                    w={'30px'}
                    h={'30px'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                  >
                    {num}
                  </Box>
                ))}
              </Flex>
            ))}
            <Button
              colorScheme="green"
              w="100%"
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
