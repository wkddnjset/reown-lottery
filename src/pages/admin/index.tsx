import { NextSeo } from 'next-seo'

import HomeLayout from '@/components/@Layout/HomeLayout'
import Admin from '@/containers/Admin'

function AdminPage() {
  return (
    <>
      <NextSeo title="ADMIN" />
      <HomeLayout content={<Admin />} />
    </>
  )
}

export default AdminPage
