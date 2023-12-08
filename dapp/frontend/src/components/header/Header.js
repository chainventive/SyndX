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

// ReactJS
import { useEffect, useState } from "react";

// Chakra
import { Flex, Spacer, Box, Heading, Link, VStack, Badge } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons'

const Header = () => {

    const { userAddress, isUserSyndxOwner, isUserConnected } = useSyndx();

    const [ now, setNow ] = useState(0);

    useEffect(() => {
        setNow(getDateTimestamp(Date.now())); 
        setInterval(() => setNow( getDateTimestamp(Date.now()) ), 5000);
    }, []);

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
                        <Flex w='100%' p='1rem' m='0' borderBottom='1px solid #a8a8a8'>
                            <Box>
                                <Badge>
                                    { isUserSyndxOwner ? 'admin' : 'user' }
                                </Badge>           
                            </Box>
                            <Spacer/>
                            <Box>
                                <Badge>
                                    { getTimestampDate(now) }
                                </Badge> 
                            </Box>
                            <Spacer/>
                            <Box>
                                <Badge style={{ cursor: 'pointer' }} onClick={ () => copyToClipboard(backend.contracts.syndx.address) }>
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