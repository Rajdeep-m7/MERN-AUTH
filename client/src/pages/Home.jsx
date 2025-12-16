import React from 'react'
import Nabvar from '../components/nabvar'
import Header from '../components/Header'

function Home() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
        <Nabvar />
        <Header />
    </div>
  )
}

export default Home