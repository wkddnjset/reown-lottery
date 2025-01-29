import React from 'react'

import { NextSeo } from 'next-seo'

import HomeLayout from '@/components/@Layout/HomeLayout'
import Home from '@/containers/Home'

function HomePage() {
  return (
    <>
      <NextSeo title="LANDING" />
      <HomeLayout content={<Home />} />
    </>
  )
}

export default HomePage
