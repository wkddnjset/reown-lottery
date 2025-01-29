import { Box, ChakraProps, Flex, Text, VStack } from '@chakra-ui/react'

import Ticket from '@/components/Ticket'
import { useLottery } from '@/hooks/useLottery'

interface TicketsProps {
  styles?: {
    container?: ChakraProps
  }
}

function Tickets({ styles }: TicketsProps) {
  const { getTickets } = useLottery()
  const { data } = getTickets
  console.log('data:', data)

  return (
    <Box {...styles?.container} pt={'100px'}>
      <Flex direction={'column'} align={'center'}>
        <Text textStyle={'pre-heading-01'}>My Tickets</Text>
        <VStack spacing={'12px'} mt={'20px'}>
          {data?.tickets.map((ticket, index) => (
            <Ticket numbers={ticket.numbers} id={index + 1} key={index} />
          ))}
        </VStack>
      </Flex>
    </Box>
  )
}

export default Tickets
