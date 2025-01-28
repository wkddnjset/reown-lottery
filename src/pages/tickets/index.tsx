import { NextSeo } from 'next-seo'

import HomeLayout from '@/components/@Layout/HomeLayout'
import Tickets from '@/containers/Tickets'

function TicketsPage() {
  return (
    <>
      {/* output: 똑똑한개발자 |  */}
      {/* titleTemplate는 /configs/seo/config.ts에서 변경 가능합니다. */}
      <NextSeo title="tickets" />
      <HomeLayout content={<Tickets />} />
    </>
  )
}

export default TicketsPage
