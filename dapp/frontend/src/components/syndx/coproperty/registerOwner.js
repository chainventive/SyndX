'use client'

//ReactJS
import { useState } from 'react'

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';

// Helpers
import { copyToClipboard } from "@/helpers/utils/index";
import { formatBlockchainAddress } from "@/helpers/formatter/index";

// Chakra
import { TableContainer, Table, Tbody, Tr, Td, Button, Thead, Th, Flex, Input, Text, Box, Spacer, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Center} from '@chakra-ui/react';
import { CopyIcon, AddIcon } from '@chakra-ui/icons';

// Backend
import { backend } from "@/backend";

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

const RegisterOwner = () => {

    const { selectedCoproperty } = useSyndx();
    const { owners } = useCoproperty();


    const [ownerAddress, setOwnerAddress] = useState('');
    const [ownerShares, setOwnerShares]   = useState(1);

    const registerOwner = async () => {

        try {

          const governanceToken = await readContract({
            address: selectedCoproperty.contract,
            abi: backend.contracts.coproperty.abi,
            functionName: 'governanceToken'
          });

          const { request } = await prepareWriteContract({
            address: governanceToken,
            abi: backend.contracts.governanceToken.abi,
            functionName: "addPropertyOwner",
            args: [ownerAddress, ownerShares]
          });
    
          const { txHash } = await writeContract(request);
          await waitForTransaction({hash: txHash});

          return txHash;
          
        } catch (err) {
    
          if (err instanceof ContractFunctionExecutionError) { 
            console.log(err);
            return;
          }
    
          console.log(err);

        } finally {
            
            setOwnerAddress('');
            setOwnerShares(0);
        }
    
    };

    const removeOwner = async (owner) => {

      try {
        console.log(owner)
          const { request } = await prepareWriteContract({
            address: selectedCoproperty.contract,
            abi: backend.contracts.governanceToken.abi,
            functionName: "removePropertyOwner",
            args: [owner.address]
          });
    
          const { txHash } = await writeContract(request);
          await waitForTransaction({hash: txHash});

          return txHash;
          
        } catch (err) {
    
          if (err instanceof ContractFunctionExecutionError) { 
            console.log(err);
            return;
          }
    
          console.log(err);
    
        }

  } 

    return (

        <>
            <Flex color='white' p='1rem' bg='#262222' marginTop='0.75rem' borderRadius='0.75rem'>
              <Spacer/>
              <Box marginRight='1.5rem'>
                <Center>
                  <Text paddingTop='0.3rem' as='b' fontSize='sm'><AddIcon marginRight='0.5rem' />new owner</Text>
                </Center>
              </Box>
              <Box marginRight='1.5rem'>
                <Input bg='white' color='black' borderRadius='0.25rem' size='sm' type="text"  value={ownerAddress} onChange={e => setOwnerAddress(e.target.value)} placeholder="address"></Input>
              </Box>
              <Box marginRight='1.5rem'>
                <NumberInput bg='white' color='black' size='sm' defaultValue={1} value={ownerShares} onChange={(value) => setOwnerShares(value)} min={1} max={10000}>
                  <NumberInputField borderRadius='0.25rem'  />
                  <NumberInputStepper>
                    <NumberIncrementStepper children='+' />
                    <NumberDecrementStepper children='-' />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <Box>
                <Button minWidth='5rem' size='sm' onClick={ () => registerOwner() }>add</Button>
              </Box>
              <Spacer/>
            </Flex>

            <TableContainer marginTop='2rem'>
              <Table size='sm'>
                <Thead>
                  <Tr>
                    <Th>Owner</Th>
                    <Th>Shares</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                {
                  owners.map(owner => (

                    <Tr key={ owner.address }>
                      <Td>
                        { formatBlockchainAddress(owner.address) }
                        <CopyIcon style={{ cursor: 'pointer' }} onClick={ () => copyToClipboard(owner.address) } marginLeft='0.25rem'/>
                      </Td>
                      <Td>{ owner.shares }</Td>
                      <Td textAlign='right'>
                        <Button size='xs' onClick={ () => removeOwner(owner) }>remove</Button>
                      </Td>
                    </Tr>
                  ))
                }
                </Tbody>
              </Table>
            </TableContainer>

        </>

    )
}

export default RegisterOwner