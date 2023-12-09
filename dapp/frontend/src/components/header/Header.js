'use client'

// RainbowKit
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

// Helpers
import { getTimestampDate, getDateTimestamp } from "@/helpers/time/index";
import { formatBlockchainAddress } from "@/helpers/formatter/index";
import { copyToClipboard } from "@/helpers/utils/index";

// Components
import CreateCoproperty from '@/components/syndx/coproperty/createCoproperty';

// Backend
import { backend } from "@/backend";

// Chakra
import { Flex, Spacer, Box, Heading, Link, VStack, Badge } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons'

const Header = () => {

    const { networkNow, isUserSyndxOwner, isUserConnected, selectedCoproperty } = useSyndx();

    return (

        <VStack w='100%' spacing={0} align='stretch'>
            <Flex w='100%' p='1rem' borderBottom='1px solid #a8a8a8'>
                <Box>
                    <Heading>
                        <Link href="/" style={{ border: '3px solid black', borderRadius: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '1.75rem' }}>
                            SyndX
                        </Link>
                    </Heading>
                </Box>

                <Spacer></Spacer>

                <Box>
                    <ConnectButton />
                </Box>
            </Flex>
            
            {
                isUserConnected &&
                (   
                    <>
                        <Flex w='100%' p='1rem' m='0' borderBottom='1px solid #a8a8a8' bg={isUserSyndxOwner ? 'linear-gradient(to bottom, #283048, #1a202c)' : 'linear-gradient(to right, #7474BF, #348AC7)'}>
                            <Box>
                                <Badge p='0.25rem 1rem' borderRadius='0.25rem' variant='outline' color='white'>
                                    { backend.network } - { networkNow > 0 ? getTimestampDate(networkNow) : (selectedCoproperty != null ? 'syncing ...' : 'standy') }
                                </Badge> 
                            </Box>
                            <Spacer/>
                            <Box marginRight='0.5rem'>
                                <Badge p='0.25rem 1rem' borderRadius='0.25rem' variant='outline' color='white'>
                                    { isUserSyndxOwner ? 'admin' : 'user' }
                                </Badge>           
                            </Box>
                            <Box>
                                <Badge p='0.25rem 1rem' borderRadius='0.25rem' color='white' variant='outline' style={{ cursor: 'pointer' }} onClick={ () => copyToClipboard(backend.contracts.syndx.address) }>
                                    syndx { formatBlockchainAddress(backend.contracts.syndx.address) }<CopyIcon marginLeft='0.25rem'/>
                                </Badge>     
                            </Box>
                        </Flex>

                        {
                            isUserSyndxOwner && (
                                
                                <Flex w='100%'>
                                    <CreateCoproperty></CreateCoproperty>
                                </Flex>
                            )
                        }
                        
                    </>
                )
            }

        </VStack>

    )
}

export default Header