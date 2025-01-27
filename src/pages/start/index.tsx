import { NextSeo } from 'next-seo'

import HomeLayout from '@/components/@Layout/HomeLayout'
import Start from '@/containers/Start'
import withAuthGuard from '@/hocs/withAuthGuard'

function StartPage() {
  return (
    <>
      {/* output: 똑똑한개발자 |  */}
      {/* titleTemplate는 /configs/seo/config.ts에서 변경 가능합니다. */}
      <NextSeo title="start" />
      <HomeLayout content={<Start />} />
    </>
  )
}

export default withAuthGuard(StartPage)
