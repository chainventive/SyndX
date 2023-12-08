"use client"

// Components
import Header from '@/components/header/Header'
import Syndx from '@/components/syndx/Syndx'

// Chakra
import { Flex } from '@chakra-ui/react'

export default function Home() {

  return (

    <main>

      <Flex>
        <Header/>
      </Flex>

      <Flex borderBottom='1px solid #eee'>
        <Syndx/>
      </Flex>

    </main>
    
  )
}
