'use client'

// Helpers
import { copyToClipboard } from "@/helpers/utils/index";
import { formatBlockchainAddress } from "@/helpers/formatter/index";

// Chakra
import { VStack, Box, Text, TableContainer, Table, Tbody, Tr, Td, Flex, Center, Spacer, Button } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const AdminSpace = () => {

    const { selectedCoproperty, setSelectedCoproperty } = useSyndx();
    
    return (

        <VStack w='100%' p='2rem'>

            <Box w='100%'>
                {
                    selectedCoproperty ? (

                        <Box w='100%' marginBottom='1.25rem' fontSize='xl'>

                            <Flex w='100%'>
                                <Box>
                                    <Text fontSize='2xl' as='b' >{ selectedCoproperty.name }</Text>
                                </Box>
                                <Spacer></Spacer>
                                <Box>
                                    <Button onClick={() => setSelectedCoproperty(null)} size='sm'>close</Button>
                                </Box>
                            </Flex>
                            
                            <TableContainer marginTop='2rem'>
                                <Table size='sm'>
                                    <Tbody>
                                    <Tr borderTop='1px solid #eee'>
                                        <Td>contract</Td>
                                        <Td>
                                            { formatBlockchainAddress(selectedCoproperty.contract) }
                                            <CopyIcon style={{ cursor: 'pointer' }} onClick={ () => copyToClipboard(selectedCoproperty.contract) } marginLeft='0.25rem'/>
                                        </Td>
                                    </Tr>
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        
                        </Box>

                    ) : (
                        
                        <Flex w='100%' h="50vh">
                            <Center w='100%' h='100%'>
                                <Text fontSize='md' color='dimgray'>- no coproperty selected -</Text>
                            </Center>
                        </Flex>
                        
                    )
                }
            </Box>

        </VStack>

    )
}

export default AdminSpace