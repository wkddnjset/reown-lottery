import { useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Image,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import gsap from 'gsap'
import { MdOutlineFileCopy } from 'react-icons/md'

import { useLottery } from '@/hooks/useLottery'

import Countdown from './components/Countdown'
import usePool from './hooks/usePool'

function Home() {
  const [balance, setBalance] = useState(0)
  const { open } = useAppKit()
  const toast = useToast()
  const { isConnected } = useAppKitAccount()
  const { getBalance } = usePool()
  const { getLottery, poolAddress } = useLottery()
  const { data: lottery } = getLottery

  const router = useRouter()

  const countdownRef = useRef(null)
  const ticketRef = useRef(null)
  const buttonsRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const timeline = gsap.timeline({
        defaults: { duration: 0.6, ease: 'power3.out' },
      })

      const ctx = gsap.context(() => {
        timeline
          .to(countdownRef.current, {
            opacity: 1,
            y: 0,
          })
          .to(
            ticketRef.current,
            {
              opacity: 1,
              y: 0,
            },
            '-=0.3',
          )
          .to(
            buttonsRef.current,
            {
              opacity: 1,
              y: 0,
            },
            '-=0.3',
          )
        gsap.to(ticketRef.current, {
          y: 20,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        })
      })

      return () => {
        ctx.revert()
      }
    }, 500)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getBalance()
      setBalance(balance ?? 0)
    }
    fetchBalance()
  }, [getBalance])

  const totalReward = useMemo(() => {
    const pastRounds = lottery?.pastRounds
    if (pastRounds && pastRounds.length > 0) {
      return (
        pastRounds.reduce(
          (acc, curr) =>
            acc +
            curr.winner.reduce(
              (prizeAcc, winner) =>
                winner.claimed ? prizeAcc : prizeAcc + Number(winner.prize),
              0,
            ),
          0,
        ) / 1_000_000_000
      )
    }
    return 0
  }, [lottery?.pastRounds])

  console.log('balance', balance)
  0.0285 - 0.0071

  return (
    <Center
      h={'100%'}
      borderRadius={'8px'}
      flexDir={'column'}
      gap={'20px'}
      overflow={'hidden'}
    >
      <Box
        mt={{ base: '100px', sm: '140px', md: '180px' }}
        ref={countdownRef}
        opacity={0}
        transform={'translateY(30px)'}
      >
        <Countdown />
        <Flex
          gap={'4px'}
          mt={'15px'}
          alignItems={'center'}
          justifyContent={'center'}
          cursor={'pointer'}
          onClick={() => {
            navigator.clipboard.writeText(poolAddress)
            toast({
              title: 'Copied to clipboard',
              description: poolAddress,
              status: 'success',
              duration: 2000,
            })
          }}
        >
          <Text textStyle={'pre-caption-01'}>
            REWARD POOL :{' '}
            {poolAddress?.slice(0, 6) + '...' + poolAddress?.slice(-6)}
          </Text>{' '}
          <MdOutlineFileCopy />
        </Flex>
      </Box>

      <Center
        border={'1px solid'}
        borderColor={'content.3'}
        borderRadius={'12px'}
        p={'12px'}
        my={'auto'}
        backdropFilter={'blur(10px)'}
        ref={ticketRef}
        opacity={0}
        transform={'translateY(30px) rotate(-6deg)'}
      >
        <HStack h={'100%'} spacing={'0px'}>
          <VStack
            bgGradient={'linear(to-t, #000000, #222222)'}
            p={'10px'}
            px={'24px'}
            borderLeftRadius={'12px'}
          >
            <Text textStyle={'pre-body-06'} color={'content.6'}>
              Total Reward
            </Text>
            <Text textStyle={'pre-display-02'} lineHeight={'1'}>
              {balance > 0 ?
                Number(balance - totalReward).toFixed(4)
              : `0.0000`}
            </Text>
            <Text textStyle={'pre-caption-01'} color={'content.5'} mt={'5px'}>
              SOL
            </Text>
          </VStack>
          <Flex
            backgroundImage={'images/ticket_line.png'}
            backgroundSize={'cover'}
            backgroundPosition={'center'}
            w={'30px'}
            h={'100%'}
          />
          <Center
            borderRightRadius={'12px'}
            bgGradient={'linear(to-t, #000000, #222222)'}
            h={'100%'}
            w={'100px'}
            px={'20px'}
          >
            <Image src={'/images/solana.png'} alt={'solana'} boxSize={'60px'} />
          </Center>
        </HStack>
      </Center>
      <VStack
        mt={'auto'}
        mb={{ base: '20px', sm: '60px' }}
        spacing={'10px'}
        ref={buttonsRef}
        opacity={0}
        transform={'translateY(30px)'}
      >
        <Button
          onClick={() => open({ view: 'Networks' })}
          size={'lg'}
          w={'280px'}
        >
          Change Network
        </Button>
        {isConnected && (
          <Button
            onClick={() => router.push('/tickets')}
            size={'lg'}
            w={'280px'}
            variant={'outline-primary'}
          >
            My Tickets
          </Button>
        )}
        <Button onClick={() => router.push('/start')} size={'lg'} w={'280px'}>
          Buy Ticket
        </Button>
      </VStack>
    </Center>
  )
}
export default Home
