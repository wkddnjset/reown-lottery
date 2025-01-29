import { Box, Center, Flex, IconButton, Text } from '@chakra-ui/react'
import { BN } from '@coral-xyz/anchor'

import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from 'react-icons/md'

function PastDraws({ data }: { data: any }) {
  return (
    <Box
      bg={'#0008'}
      borderRadius={'12px'}
      pt={'12px'}
      pb={'20px'}
      px={'20px'}
      w={'400px'}
      h={'160px'}
    >
      <Flex justify={'space-between'} align={'center'}>
        <Text textStyle={'pre-heading-01'}>
          Round #{new BN(data?.currentRound).toString()}
        </Text>
        <Flex gap={'10px'}>
          <IconButton
            aria-label="Previous"
            icon={<MdOutlineArrowBackIos fontSize={'14px'} />}
            variant="outline-primary"
            size="sm"
          />
          <IconButton
            aria-label="Next"
            icon={<MdOutlineArrowForwardIos fontSize={'14px'} />}
            variant="outline-primary"
            size="sm"
          />
        </Flex>
      </Flex>
      <Text textStyle={'pre-body-04'} color={'content.5'}>
        Winning Numbers
      </Text>
      <Flex gap={'10px'} mt={'10px'}>
        {[...Array(4)].map((_, index) => (
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
        ))}
      </Flex>
    </Box>
  )
}

export default PastDraws
