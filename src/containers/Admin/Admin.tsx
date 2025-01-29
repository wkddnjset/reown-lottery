import { Button, ChakraProps, Flex, Text, VStack } from '@chakra-ui/react'

import useLottery from '@/hooks/useLottery'

interface AdminProps {
  styles?: {
    container?: ChakraProps
  }
}

function Admin({ styles }: AdminProps) {
  const { initialize, getLottery, drawWinners } = useLottery()
  const POOL_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_POOL_ADDRESS
  const DEV_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_DEV_ADDRESS
  const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_ADMIN_ADDRESS
  const { data } = getLottery

  const drawLottery = () => {
    drawWinners.mutate()
  }

  return (
    <Flex
      {...styles?.container}
      pt={'100px'}
      direction={'column'}
      align={'center'}
    >
      <Flex
        direction={'column'}
        align={'center'}
        w={'fit-content'}
        p={'30px'}
        bg={'#0008'}
        borderRadius={'12px'}
      >
        <VStack>
          <Text textStyle={'pre-heading-01'}>POOL_ADDRESS</Text>
          <Text textStyle={'pre-body-05'}>{POOL_ADDRESS}</Text>
          <Text textStyle={'pre-heading-01'}>DEV_ADDRESS</Text>
          <Text textStyle={'pre-body-05'}>{DEV_ADDRESS}</Text>
          <Text textStyle={'pre-heading-01'}>ADMIN_ADDRESS</Text>
          <Text textStyle={'pre-body-05'}>{ADMIN_ADDRESS}</Text>
        </VStack>
        {data ?
          <Button
            mt={'50px'}
            size={'lg'}
            w={'280px'}
            variant={'outline-primary'}
            cursor={'not-allowed'}
            disabled
          >
            Initialized Completed
          </Button>
        : <Button
            mt={'50px'}
            size={'lg'}
            w={'280px'}
            variant={'outline-primary'}
            onClick={() => {
              initialize.mutate()
            }}
            isLoading={initialize.isPending}
          >
            Initialize Lottery
          </Button>
        }

        <Button
          mt={'10px'}
          size={'lg'}
          w={'280px'}
          isLoading={drawWinners.isPending}
          onClick={() => drawWinners.mutate()}
        >
          Draw Lottery
        </Button>
      </Flex>
    </Flex>
  )
}

export default Admin
