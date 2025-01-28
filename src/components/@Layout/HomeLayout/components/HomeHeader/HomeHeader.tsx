import { Link } from '@chakra-ui/next-js'
import {
  Button,
  Container,
  ContainerProps,
  HStack,
  Spinner,
  Text,
} from '@chakra-ui/react'

import { LogoIcon } from 'generated/icons/MyIcons'

import ClientOnly from '@/components/ClientOnly'
import { ROUTES } from '@/generated/path/routes'
import { useAuth } from '@/hooks/useAuth'
import { useLocalStorage } from '@/stores/local/state'

const HomeHeader = ({ ...props }: ContainerProps) => {
  const { isLogin } = useAuth()
  const resetToken = useLocalStorage((store) => store.reset)

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
        <Text
          color={'content.7'}
          textStyle={'pre-heading-02'}
        >{`12'Lottery`}</Text>
      </Link>
      <HStack spacing="16px">
        <ClientOnly fallback={<Spinner size={'sm'} />}>
          <appkit-button />
        </ClientOnly>
      </HStack>
    </Container>
  )
}

export default HomeHeader
