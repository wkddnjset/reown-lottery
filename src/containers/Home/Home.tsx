import { useRouter } from 'next/router'

import { Button, Center, Text } from '@chakra-ui/react'

import { useAppKit, useAppKitAccount } from '@/configs/appkit'

function Home() {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const router = useRouter()
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
        {isConnected && (
          <Button onClick={() => router.push('/start')}>
            Go to Game Start
          </Button>
        )}
        <Button onClick={() => router.push('/count')}>
          Go to Count Example
        </Button>
      </>
    </Center>
  )
}
export default Home
