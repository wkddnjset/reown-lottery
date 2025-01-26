import { Button, Center, Text } from '@chakra-ui/react'

import { useAppKit } from '@/configs/appkit'

function Home() {
  const { open } = useAppKit()
  return (
    <Center h={'100%'} borderRadius={'8px'} flexDir={'column'} gap={'20px'}>
      <Text
        color={'primary.3'}
        textStyle={'pre-heading-01'}
        textAlign={'center'}
      >
        TOKTOKHAN.DEV
      </Text>
      <Text color={'content.1'} textStyle={'pre-heading-02'}>
        Next page template
      </Text>
      <>
        <Button onClick={() => open()}>Open Connect Modal</Button>
        <Button onClick={() => open({ view: 'Networks' })}>
          Open Network Modal
        </Button>
      </>
    </Center>
  )
}
export default Home
