import { useMemo } from 'react'

import { useRouter } from 'next/router'

import { Link } from '@chakra-ui/next-js'
import {
  Box,
  Button,
  Container,
  ContainerProps,
  Flex,
  HStack,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useAppKitAccount } from '@reown/appkit/react'

import ClientOnly from '@/components/ClientOnly'
import { ROUTES } from '@/generated/path/routes'

const HomeHeader = ({ ...props }: ContainerProps) => {
  const router = useRouter()
  const { address } = useAppKitAccount()
  const isAdmin = useMemo(() => {
    return address && process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.includes(address)
  }, [address])

  return (
    <Container
      display={'flex'}
      w={'100%'}
      alignItems={'center'}
      justifyContent="space-between"
      borderBottom={'1px solid'}
      borderColor={'content.1'}
      backdropFilter={'blur(10px)'}
      // pr={'5px'}
      {...props}
    >
      <Link variant={'unstyled'} href={ROUTES.MAIN}>
        <Flex alignItems={'center'} gap={'8px'}>
          <Text
            color={'content.7'}
            textStyle={'pre-heading-02'}
          >{`12'Lottery`}</Text>
          <Flex
            bg={'red.100'}
            gap={'4px'}
            px={'6px'}
            py={'3px'}
            borderRadius={'full'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Box bg={'red.500'} boxSize={'6px'} borderRadius={'full'} />
            <Text textStyle={'pre-caption-01'} color={'red.500'}>
              DEVNET only
            </Text>
          </Flex>
        </Flex>
      </Link>
      <HStack spacing="16px">
        {isAdmin && (
          <Button
            onClick={() => {
              router.push('/admin')
            }}
          >
            <Text>Admin</Text>
          </Button>
        )}
        <ClientOnly fallback={<Spinner size={'sm'} />}>
          <appkit-button />
        </ClientOnly>
      </HStack>
    </Container>
  )
}

export default HomeHeader
