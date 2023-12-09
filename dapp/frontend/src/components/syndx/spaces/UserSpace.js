'use client'

// Components
import SyndicSpace from '@/components/syndx/spaces/users/SyndicSpace';
import OwnerSpace from '@/components/syndx/spaces/users/OwnerSpace';

// Chakra
import { Center, Box, Text, Flex } from '@chakra-ui/react';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const UserSpace = () => {
    
    const { selectedCoproperty, isUserSelectedCopropertySyndic } = useSyndx();

    return (

        <Box w='100%' p='2rem'>

            {
                selectedCoproperty == null ? (

                    <Flex w='100%' h="50vh">
                        <Center w='100%' h='100%'>
                            <Text fontSize='md' color='dimgray'>- no coproperty selected -</Text>
                        </Center>
                    </Flex>

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