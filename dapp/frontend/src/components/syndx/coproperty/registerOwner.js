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

import { useRouter } from 'next/navigation';

const RegisterOwner = () => {

    const { selectedCoproperty, setSelectedCoproperty } = useSyndx();
    const { owners, fetchTokenDetails, fetchPastContractEvents } = useCoproperty();

    const [submitting, setSubmitting] = useState(false);
    const [removing, setRemoving] = useState('');

    const [ownerAddress, setOwnerAddress] = useState('');
    const [ownerShares, setOwnerShares]   = useState(1);

    const router = useRouter();

    const handleRefresh = () => {
      
      fetchTokenDetails();
      fetchPastContractEvents();
    };

    const registerOwner = async () => {

        try {

          setSubmitting(true);

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
    
          const { hash } = await writeContract(request);
          await waitForTransaction({hash});

          return hash;
          
        } catch (err) {
    
          if (err instanceof ContractFunctionExecutionError) { 
            console.log(err);
            return;
          }
    
          console.log(err);

        } finally {
            
            fetchTokenDetails();
            setOwnerAddress('');
            setOwnerShares(1);
            setSubmitting(false);
            handleRefresh();
        }
    
    };

    const removeOwner = async (owner) => {

      try {

          setRemoving(owner.address);

          const governanceToken = await readContract({
            address: selectedCoproperty.contract,
            abi: backend.contracts.coproperty.abi,
            functionName: 'governanceToken'
          });

          const { request } = await prepareWriteContract({
            address: governanceToken,
            abi: backend.contracts.governanceToken.abi,
            functionName: "removePropertyOwner",
            args: [owner.address]
          });
    
          const { hash } = await writeContract(request);
          await waitForTransaction({hash});

          return hash;
          
        } catch (err) {
    
          if (err instanceof ContractFunctionExecutionError) { 
            console.log(err);
            return;
          }
    
          console.log(err);
    
        }
        finally {
          setSelectedCoproperty(selectedCoproperty);
          fetchTokenDetails();
          setRemoving('');
          handleRefresh();
        }

  } 

    return (

        <>
            <Flex p='1rem' bg='#f5f5f5' marginTop='0.75rem' borderRadius='0.75rem'>
              <Spacer/>
              <Box marginRight='1.5rem'>
                <Center>
                  <Text paddingTop='0.4rem' as='b' fontSize='sm'><AddIcon marginRight='0.5rem' />new owner</Text>
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
                <Button isLoading={submitting} minWidth='5rem' size='sm' onClick={ () => registerOwner() }>add</Button>
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
                        <Button isLoading={removing==owner.address} size='xs' onClick={ () => removeOwner(owner) }>remove</Button>
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