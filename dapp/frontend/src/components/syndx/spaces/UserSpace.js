'use client'

// Components
import SyndicSpace from '@/components/syndx/spaces/users/SyndicSpace';
import OwnerSpace from '@/components/syndx/spaces/users/OwnerSpace';

// Chakra
import { VStack, Box, Text, TableContainer, Table, Tbody, Tr, Td } from '@chakra-ui/react';
import { CopyIcon, ChatIcon } from '@chakra-ui/icons';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const UserSpace = () => {
    
    const { selectedCoproperty, isUserSelectedCopropertySyndic } = useSyndx();

    return (

        <Box w='100%' p='2rem'>

            {
                selectedCoproperty == null ? (

                    <Text fontSize='xl' ><ChatIcon marginRight='0.75rem'/>please select a coproperty.</Text>

                ) : (

                    <>
                        { 
                            isUserSelectedCopropertySyndic ? (

                                <SyndicSpace />

                            ) : (
                                            
                                <OwnerSpace />
                            )
                        }
                    </>
                )
            }

        </Box>

    )
}

export default UserSpace