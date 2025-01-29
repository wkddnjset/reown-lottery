import { NextSeo } from 'next-seo'

import HomeLayout from '@/components/@Layout/HomeLayout'
import Tickets from '@/containers/Tickets'

function TicketsPage() {
  return (
    <>
      <NextSeo title="MY TICKETS" />
      <HomeLayout content={<Tickets />} />
    </>
  )
}

export default TicketsPage
