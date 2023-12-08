'use client'

// Chakra
import { Flex, Spacer, Box, Heading, Link, VStack, Badge, Center, Text } from '@chakra-ui/react';

// Components
import Nav from '@/components/syndx/nav/Nav';
import OwnerSpace from '@/components/syndx/spaces/users/OwnerSpace';
import AdminSpace from '@/components/syndx/spaces/AdminSpace';
import SyndicSpace from '@/components/syndx/spaces/users/SyndicSpace';
import Disconnected from '@/components/syndx/disconnected/Disconnected';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import { CopropertyContextProvider } from '@/app/contexts/coproperty/coproperty.context.jsx';
import UserSpace from './spaces/UserSpace';

const Syndx = () => {

    const { isUserSyndxOwner, isUserConnected, selectedCoproperty, setSelectedCoproperty, isUserSelectedCopropertySyndic } = useSyndx();

    return (

        <>

            {
                isUserConnected ? ( 

                    <>
                        <Box w='16rem'>
                            <Nav onSelectCoproperty={setSelectedCoproperty} />
                        </Box>

                        <Box flexGrow='1' h='100vw'>
                            <CopropertyContextProvider>
                            {
                                isUserSyndxOwner ? 
                                (
                                    <AdminSpace coproperty={selectedCoproperty}/>

                                ) : (

                                    <UserSpace />
                                )
                            } 
                            </CopropertyContextProvider>
                        </Box>  
                        
                    </>

                ) : (

                    <Disconnected/>

                )
            }

        </>

    )
}

export default Syndx