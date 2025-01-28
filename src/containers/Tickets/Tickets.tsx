import { Box, ChakraProps, Button, Flex, Image, Text } from '@chakra-ui/react'

interface TicketsProps {
  styles?: {
    container?: ChakraProps
  }
}

function Tickets({ styles }: TicketsProps) {
  return (
    <Box {...styles?.container}>
      <Text>Tickets</Text>
    </Box>
  )
}

export default Tickets
