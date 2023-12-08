'use client'

import CreateCoproperty from '@/components/syndx/coproperty/createCoproperty';

// Helpers
import { copyToClipboard } from "@/helpers/utils/index";
import { formatBlockchainAddress } from "@/helpers/formatter/index";

// Chakra
import { VStack, Box, Text, TableContainer, Table, Tbody, Tr, Td } from '@chakra-ui/react';
import { CopyIcon, ChatIcon } from '@chakra-ui/icons';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const AdminSpace = () => {

    const { selectedCoproperty } = useSyndx();
    
    return (

        <VStack w='100%' p='2rem'>

            <Box w='100%'>
                {
                    selectedCoproperty ? (

                        <Box w='100%' marginBottom='1.25rem' fontSize='xl'>

                            <Text fontSize='2xl' as='b' >{ selectedCoproperty.name }</Text>

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
                        
                        <Text fontSize='xl' ><ChatIcon marginRight='0.75rem'/>please select a coproperty.</Text>
                    )
                }
            </Box>

        </VStack>

    )
}

export default AdminSpace