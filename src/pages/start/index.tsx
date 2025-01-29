import { NextSeo } from 'next-seo'

import HomeLayout from '@/components/@Layout/HomeLayout'
import Start from '@/containers/Start'
import withAuthGuard from '@/hocs/withAuthGuard'

function StartPage() {
  return (
    <>
      <NextSeo title="BUY TICKET" />
      <HomeLayout content={<Start />} />
    </>
  )
}

export default withAuthGuard(StartPage)
