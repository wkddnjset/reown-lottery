import { useEffect, useRef } from 'react'

import { Box, Center, ChakraProps, Flex, Text, VStack } from '@chakra-ui/react'
import { useAppKitAccount } from '@reown/appkit/react'

import gsap from 'gsap'

import Ticket from '@/components/Ticket'
import { useLottery } from '@/hooks/useLottery'

import PastDraws from './components/PastDraw'

interface TicketsProps {
  styles?: {
    container?: ChakraProps
  }
}

function Tickets({ styles }: TicketsProps) {
  const { address } = useAppKitAccount()
  const { getLottery } = useLottery()
  const { data } = getLottery

  const pastDrawRef = useRef(null)
  const titleRef = useRef(null)
  const ticketRef = useRef(null)

  useEffect(() => {
    // 0.5초 지연을 위한 타임아웃 설정
    const timer = setTimeout(() => {
      const timeline = gsap.timeline({
        defaults: { duration: 0.6, ease: 'power3.out' },
      })

      const ctx = gsap.context(() => {
        timeline
          .to(pastDrawRef.current, {
            opacity: 1,
            y: 0,
          })
          .to(
            titleRef.current,
            {
              opacity: 1,
              y: 0,
            },
            '<=',
          )
          .to(
            ticketRef.current,
            {
              opacity: 1,
              y: 0,
            },
            '-=0.3',
          )
      })

      return () => {
        ctx.revert()
      }
    }, 500)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  const userTickets =
    data?.tickets.filter(
      (ticket: any) => ticket.owner.toString() === address?.toString(),
    ) || []

  return (
    <Flex {...styles?.container} pt={'100px'} w={'100%'}>
      <Flex gap={'20px'} mx={'auto'} direction={{ base: 'column', md: 'row' }}>
        <Box ref={pastDrawRef} opacity={0} transform={'translateY(30px)'}>
          <PastDraws data={data} />
        </Box>
        <Flex direction={'column'}>
          <Text
            ref={titleRef}
            textStyle={'pre-heading-01'}
            opacity={0}
            transform={'translateY(30px)'}
          >
            My Tickets
          </Text>
          <Box ref={ticketRef} opacity={0} transform={'translateY(30px)'}>
            {userTickets && userTickets?.length > 0 ?
              <VStack spacing={'12px'} mt={'20px'}>
                {userTickets?.map((ticket: any, index: number) => (
                  <Box key={index}>
                    <Ticket numbers={ticket.numbers} id={index + 1} />
                  </Box>
                ))}
              </VStack>
            : <Center
                h={'120px'}
                w={'280px'}
                bg={'#0008'}
                borderRadius={'12px'}
                mt={'20px'}
              >
                <Text textStyle={'pre-body-01'}>No tickets purchased</Text>
              </Center>
            }
          </Box>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Tickets
