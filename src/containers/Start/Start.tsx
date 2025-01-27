import { Box, ChakraProps, Button, Flex, Image, Text } from '@chakra-ui/react'

interface StartProps {
  styles?: {
    container?: ChakraProps
  }
}

function Start({ styles }: StartProps) {
  return (
    <Box {...styles?.container}>
      <Text>Start</Text>
    </Box>
  )
}

export default Start
