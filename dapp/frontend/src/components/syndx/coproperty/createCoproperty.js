'use client'

// Chakra
import { Flex, Box, Button, Spacer, Input, Text, Center } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

//ReactJS
import { useState } from 'react'

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core';

// Backend
import { backend } from "@/backend";

const CreateCoproperty = () => {

    const [copropertyName, setCopropertyName] = useState('');
    const [copropertyTokenISO, setCopropertyTokenISO] = useState('');
    const [copropertySyndicAddress, setCopropertySyndicAddress] = useState('');

    const createCoproperty = async () => {

        try {
    
          const { request } = await prepareWriteContract({
            address: backend.contracts.syndx.address,
            abi: backend.contracts.syndx.abi,
            functionName: "createCoproperty",
            args: [copropertyName, copropertyTokenISO, copropertySyndicAddress]
          });
    
          const { txHash } = await writeContract(request);
          await waitForTransaction({hash: txHash});
    
          setCopropertyName('');
          setCopropertyTokenISO('');
          setCopropertySyndicAddress('');
    
          return txHash;
          
        } catch (err) {
    
          if( err instanceof ContractFunctionExecutionError) { 
            console.log(err.cause.reason);
            return;
          }
    
          console.log(err);
    
        } finally {
            
          setCopropertyName('');
          setCopropertyTokenISO('');
          setCopropertySyndicAddress('');
      }
    
    };

    return (

        <>
            <Box p='1.5rem' w='100%' bg='#1a202c' color='white'>

              <Flex w='100%'>

                <Box>
                  <Center>
                    <Text paddingTop='0.3rem' as='b' fontSize='sm'><AddIcon marginRight='0.5rem' />create new coproperty</Text>
                  </Center>
                </Box>

                <Spacer/>

                <Box paddingRight='2rem'>
                  <Input size='sm' bg='#2f2d2d' borderRadius='0.5rem' marginRight='1rem' type="text" value={copropertyName} onChange={e => setCopropertyName(e.target.value)} placeholder="name"></Input>
                </Box>

                <Box paddingRight='2rem'>
                  <Input size='sm' bg='#2f2d2d' borderRadius='0.5rem' marginRight='1rem' type="text" value={copropertyTokenISO} onChange={e => setCopropertyTokenISO(e.target.value)} placeholder="token iso"></Input>
                </Box>

                <Box paddingRight='2rem'>
                  <Input size='sm' bg='#2f2d2d' borderRadius='0.5rem' marginRight='1rem' type="text" value={copropertySyndicAddress} onChange={e => setCopropertySyndicAddress(e.target.value)} placeholder="syndic address"></Input>
                </Box>

                <Spacer/>

                <Box>
                  <Button size='sm' onClick={ () => createCoproperty() }>register</Button>
                </Box>

              </Flex>

            </Box>
        </>

    )
}

export default CreateCoproperty