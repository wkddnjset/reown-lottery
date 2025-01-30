import { useEffect, useMemo, useState } from 'react'

import {
  Box,
  Button,
  Center,
  Flex,
  IconButton,
  Image,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useAppKitAccount } from '@reown/appkit/react'

import { BsTwitterX } from 'react-icons/bs'
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from 'react-icons/md'

import { useLottery } from '@/hooks/useLottery'

function PastDraws({ data }: { data: any }) {
  const [round, setRound] = useState(0)
  const { address } = useAppKitAccount()
  const { claimPrize } = useLottery()
  const toast = useToast()

  const rounds = useMemo(() => {
    try {
      return [
        ...data.pastRounds,
        { roundId: data?.currentRound, winner: [], winningNumbers: [] },
      ]
    } catch (error) {
      return []
    }
  }, [data])

  useEffect(() => {
    setRound(rounds.length - 1)
  }, [rounds])

  if (rounds.length === 0) return null
  const currentRound = rounds[round]
  return (
    <Box
      bg={'#0008'}
      borderRadius={'12px'}
      pt={'12px'}
      pb={'20px'}
      px={'20px'}
      w={'400px'}
      h={'fit-content'}
    >
      <Flex justify={'space-between'} align={'center'}>
        <Text textStyle={'pre-heading-01'}>
          Round #{currentRound.roundId.toString()}
        </Text>
        <Flex gap={'10px'}>
          <IconButton
            aria-label="Previous"
            icon={<MdOutlineArrowBackIos fontSize={'14px'} />}
            variant="outline-primary"
            size="sm"
            onClick={() => setRound(round - 1)}
            isDisabled={round === 0}
          />
          <IconButton
            aria-label="Next"
            icon={<MdOutlineArrowForwardIos fontSize={'14px'} />}
            variant="outline-primary"
            size="sm"
            isDisabled={round === rounds.length - 1}
            onClick={() => setRound(round + 1)}
          />
        </Flex>
      </Flex>
      <Text textStyle={'pre-body-04'} color={'content.5'}>
        Winning Numbers
      </Text>
      <Flex gap={'10px'} mt={'10px'}>
        {currentRound.winningNumbers.length > 0 ?
          currentRound.winningNumbers.map((number: any, index: any) => (
            <Center
              key={index}
              border={'1px solid'}
              borderColor={'content.5'}
              borderRadius={'full'}
              w={'40px'}
              h={'40px'}
            >
              <Text>{number}</Text>
            </Center>
          ))
        : [...Array(4)].map((_, index) => (
            <Center
              key={index}
              border={'1px solid'}
              borderColor={'content.5'}
              borderRadius={'full'}
              w={'40px'}
              h={'40px'}
            >
              <Text>?</Text>
            </Center>
          ))
        }
      </Flex>
      <VStack mt={'10px'}>
        {currentRound.winner.map((winner: any, index: any) => {
          console.log(winner)
          console.log('winner.claimed', winner.claimed)
          return (
            <Flex
              key={index}
              align={'center'}
              gap={'10px'}
              w={'full'}
              justify={'space-between'}
            >
              <Flex gap={'10px'}>
                <Center>
                  <Image
                    src={`/images/prize_${winner.rank.toString()}.png`}
                    alt="prize"
                    w={'30px'}
                    h={'30px'}
                  />
                </Center>
                <Box>
                  <Text textStyle={'pre-heading-03'}>
                    {winner.user.toString().slice(0, 4)}...
                    {winner.user.toString().slice(-4)}
                  </Text>
                  <Text textStyle={'pre-body-04'}>
                    Prize: {Number(winner.prize) / 10 ** 9} SOL
                  </Text>
                </Box>
              </Flex>
              {winner.user.toString() === address ?
                <Flex gap={'6px'}>
                  <IconButton
                    aria-label="ShareX"
                    icon={<BsTwitterX fontSize={'14px'} />}
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: 'Share to Twitter',
                        description: 'Under Development',
                        status: 'info',
                      })
                    }}
                  />
                  <Button
                    variant={'outline-primary'}
                    size={'sm'}
                    isLoading={claimPrize.isPending}
                    isDisabled={winner.claimed}
                    onClick={() =>
                      claimPrize.mutate({
                        roundId: currentRound.roundId,
                        rank: winner.rank,
                      })
                    }
                  >
                    Claim
                  </Button>
                </Flex>
              : null}
            </Flex>
          )
        })}
      </VStack>
    </Box>
  )
}

export default PastDraws
