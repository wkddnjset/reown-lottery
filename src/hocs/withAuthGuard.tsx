import { ComponentProps, ComponentType, useEffect } from 'react'

import { useRouter } from 'next/router'

import { useAppKitAccount } from '@/configs/appkit'

export default function withAuthGuard<T extends ComponentType<any>>(
  AppComponent: T,
) {
  return function WrappedAppComponent(props: ComponentProps<T>) {
    const { isConnected } = useAppKitAccount()
    console.log('isConnected', isConnected)
    const router = useRouter()

    useEffect(() => {
      if (isConnected === false)
        router.replace(`/?returnUrl=${encodeURIComponent(router.asPath)}`)
    }, [isConnected, router])

    return isConnected ? <AppComponent {...props} /> : <></>
  }
}
