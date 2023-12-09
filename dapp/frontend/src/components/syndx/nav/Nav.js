'use client'

// Chakra
import { Flex, Spacer, Box, Heading, Link, VStack, Badge, Center, Text, Button } from '@chakra-ui/react';
import { ChevronRightIcon, DragHandleIcon } from '@chakra-ui/icons'

//ReactJS
import { useState } from 'react'

// RainbowKit
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const Nav = ({ onSelectCoproperty }) => {

    const { coproperties, selectedCoproperty } = useSyndx();

    return (

        <>
            <VStack align='stretch' spacing={0} textAlign='left' p='1.5rem' paddingTop='1.5rem' borderRight='1px solid #eee' h='100%'>

                {
                    coproperties.length > 0 ? (

                        coproperties.map(coproperty => {
                                
                            return (
                                
                                <Button variant='ghost'
                                        borderRadius='1rem'
                                        m='0.5rem 0.1rem'
                                        bg='#f0f4ff'
                                        color={selectedCoproperty?.name == coproperty.name ? 'blue' : 'black'}
                                        key={ coproperty.name } onClick={ () => onSelectCoproperty(coproperty) }>
                                    
                                    <Text fontSize='sm'><DragHandleIcon marginRight='0.5rem'/></Text>
                                    <Text as='abbr' w='100%' fontSize='md' textAlign='left' paddingTop='0.2rem'>{ coproperty.name }</Text>
                                    <Text><ChevronRightIcon/></Text>

                                </Button>
                            )

                        })

                    ) : (

                        <Flex w='100%' paddingTop='0.75rem'>
                            <Center w='100%'>
                                <Text fontSize='sm' as='em'>no registered coproperty</Text>
                            </Center>
                        </Flex>
                    )
                }

            </VStack>
        </>

    )
}

export default Nav