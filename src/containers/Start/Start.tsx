import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import { useToast } from '@chakra-ui/react'
import {
  Badge,
  Box,
  Button,
  Center,
  ChakraProps,
  Flex,
  IconButton,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'

import gsap from 'gsap'
import { FaRegTrashCan } from 'react-icons/fa6'

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

  const { purchaseTickets } = useLottery()
  const router = useRouter()
  const toast = useToast()

  const ticketRef = useRef(null)
  const calendarRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    // 0.5초 지연을 위한 타임아웃 설정
    const timer = setTimeout(() => {
      const timeline = gsap.timeline({
        defaults: { duration: 0.6, ease: 'power3.out' },
      })

      const ctx = gsap.context(() => {
        timeline
          .to(ticketRef.current, {
            opacity: 1,
            y: 0,
          })
          .to(
            btnRef.current,
            {
              opacity: 1,
              y: 0,
            },
            '-=0.3',
          )
          .to(
            calendarRef.current,
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

  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers((prev) => prev.filter((n) => n !== num))
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers((prev) => [...prev, num])
    } else {
      setSelectedNumbers([num])
    }
  }

  const handleDeleteTicket = (index: number) => {
    setTickets((prev) => prev.filter((_, i) => i !== index))
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
      const newTicket = [...selectedNumbers].sort((a, b) => a - b) as [
        number,
        number,
        number,
        number,
      ]

      // 이미 존재하는 티켓인지 확인
      const isDuplicate = tickets.some((ticket) =>
        ticket.every((num, index) => num === newTicket[index]),
      )

      if (isDuplicate) {
        toast({
          title: 'Duplicate Ticket',
          description:
            'A ticket with the same number combination already exists.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      setTickets((prev) => [...prev, newTicket])
      setSelectedNumbers([])
    }
  }

  const handlePurchaseTickets = async () => {
    if (tickets.length > 0) {
      // 여기에 티켓 구매 API 호출 로직 추가
      console.log('구매할 티켓들:', tickets)
      await purchaseTickets.mutateAsync(tickets, {
        onSuccess: () => {
          setTickets([])
        },
      })
    }
  }
  return (
    <Box {...styles?.container} py={'80px'}>
      <Flex direction="column" align="center" gap={'12px'} mt={'20px'}>
        <Box ref={ticketRef} opacity={0} transform={'translateY(30px)'}>
          <Ticket numbers={selectedNumbers} />
        </Box>
        <Box ref={btnRef} opacity={0} transform={'translateY(30px)'}>
          <Button
            maxW="300px"
            w="100%"
            variant={'outline-primary'}
            onClick={() => router.push('/tickets')}
          >
            My Tickets
          </Button>
        </Box>

        <Box
          bg={'gray.50'}
          borderRadius={'12px'}
          p={'12px'}
          ref={calendarRef}
          opacity={0}
          transform={'translateY(30px)'}
        >
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
            <Badge size={'lg'} mb={'10px'}>
              <Text># Selected ({tickets.length} tickets)</Text>
            </Badge>
            <VStack alignItems={'center'} spacing={'8px'}>
              {tickets.map((ticket, index) => (
                <Flex key={index} gap={'10px'}>
                  <Ticket numbers={ticket} key={index} id={index + 1} />
                  <Center>
                    <IconButton
                      aria-label="delete"
                      size={'sm'}
                      variant={'solid-delete'}
                      icon={<FaRegTrashCan />}
                      onClick={() => handleDeleteTicket(index)}
                    />
                  </Center>
                </Flex>
              ))}
            </VStack>
            <Button
              mt={'20px'}
              w="100%"
              isLoading={purchaseTickets.isPending}
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
