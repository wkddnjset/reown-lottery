import { NextSeo } from 'next-seo'

import HomeLayout from '@/components/@Layout/HomeLayout'
import Admin from '@/containers/Admin'

function AdminPage() {
  return (
    <>
      {/* output: 똑똑한개발자 |  */}
      {/* titleTemplate는 /configs/seo/config.ts에서 변경 가능합니다. */}
      <NextSeo title="admin" />
      <HomeLayout content={<Admin />} />
    </>
  )
}

export default AdminPage
