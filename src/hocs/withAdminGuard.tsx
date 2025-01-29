import { ComponentProps, ComponentType, useEffect } from 'react'

import { useRouter } from 'next/router'

import { useToast } from '@chakra-ui/react'
import { useAppKitAccount } from '@reown/appkit/react'

export default function withAdminGuard<T extends ComponentType<any>>(
  AppComponent: T,
) {
  return function WrappedAppComponent(props: ComponentProps<T>) {
    const { isConnected, address } = useAppKitAccount()
    const router = useRouter()
    const toast = useToast()

    useEffect(() => {
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
      if (
        address &&
        !process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.includes(address)
      ) {
        const currentPath = router.asPath
        if (!router.pathname.startsWith('/?returnUrl=')) {
          router.replace(`/?returnUrl=${encodeURIComponent(currentPath)}`)
          if (!toast.isActive('wallet-connect-toast')) {
            toast({
              title: 'You are not authorized to access this page',
              description: 'You are not authorized to access this page',
              status: 'error',
              position: 'top',
              id: 'wallet-connect-toast',
            })
          }
        }
      }
    }, [isConnected, router, toast, address])

    return isConnected ? <AppComponent {...props} /> : <></>
  }
}
