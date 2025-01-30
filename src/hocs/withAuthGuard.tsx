import { ComponentProps, ComponentType, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useToast } from '@chakra-ui/react'
import { useAppKitAccount } from '@reown/appkit/react'

export default function withAuthGuard<T extends ComponentType<any>>(
  AppComponent: T,
) {
  return function WrappedAppComponent(props: ComponentProps<T>) {
    const [init, setInit] = useState(false)
    const { isConnected } = useAppKitAccount()
    const router = useRouter()
    const toast = useToast()

    useEffect(() => {
      if (!init) {
        setInit(true)
        return
      }
      if (isConnected === false) {
        const currentPath = router.asPath
        if (!router.pathname.startsWith('/?returnUrl=')) {
          router.replace(`/?returnUrl=${encodeURIComponent(currentPath)}`)
          if (!toast.isActive('wallet-connect-toast')) {
            toast({
              title: 'Please connect your wallet',
              description: 'Please connect your wallet to continue',
              status: 'error',
              position: 'top',
              id: 'wallet-connect-toast',
            })
          }
        }
      }
    }, [isConnected, router, toast, init])

    return isConnected ? <AppComponent {...props} /> : <></>
  }
}
