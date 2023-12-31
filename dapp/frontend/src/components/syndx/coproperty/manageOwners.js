'use client'

// Chakra
import { TableContainer, Table, Tbody, Tr, Td, Badge } from '@chakra-ui/react';

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

const CopropertyOwners = () => {

    const { tokenName, tokenSymbol, tokenTotalSupply, distributedTokens, tokenContract, syndicBalance } = useCoproperty();

    return (

        <TableContainer marginTop='2rem'>
            <Table size='sm'>
                <Tbody>
                    <Tr borderTop='1px solid #eee'>
                        <Td>Token name</Td>
                        <Td>{ tokenName }</Td>
                    </Tr>
                    <Tr borderTop='1px solid #eee'>
                        <Td>Token contract</Td>
                        <Td>{ tokenContract }</Td>
                    </Tr>
                    <Tr borderTop='1px solid #eee'>
                        <Td>Token symbol</Td>
                        <Td>
                            <Badge>{ tokenSymbol }</Badge>
                        </Td>
                    </Tr>
                    <Tr borderTop='1px solid #eee'>
                        <Td>Total supply</Td>
                        <Td>{ tokenTotalSupply } { tokenSymbol }</Td>
                    </Tr>
                    <Tr borderTop='1px solid #eee'>
                        <Td>Distributed</Td>
                        <Td>{ distributedTokens } { tokenSymbol }</Td>
                    </Tr>
                    <Tr borderTop='1px solid #eee'>
                        <Td>Undistributed</Td>
                        <Td>{ syndicBalance } { tokenSymbol }</Td>
                    </Tr>
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default CopropertyOwners