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

    const [submitting, setSubmitting] = useState(false);

    const [copropertyName, setCopropertyName] = useState('');
    const [copropertyTokenISO, setCopropertyTokenISO] = useState('');
    const [copropertySyndicAddress, setCopropertySyndicAddress] = useState('');

    const createCoproperty = async () => {

        try {

          setSubmitting(true);
    
          const { request } = await prepareWriteContract({
            address: backend.contracts.syndx.address,
            abi: backend.contracts.syndx.abi,
            functionName: "createCoproperty",
            args: [copropertyName, copropertyTokenISO, copropertySyndicAddress]
          });
    
          const { hash } = await writeContract(request);
          await waitForTransaction({ hash });
    
          return hash;
          
        } catch (err) {
    
          if( err instanceof ContractFunctionExecutionError) { 
            console.log(err.cause.reason);
            return;
          }
    
          console.log(err);
        }
        finally {

          setCopropertyName('');
          setCopropertyTokenISO('');
          setCopropertySyndicAddress('');

          setSubmitting(false);
        }
    
    };

    return (

        <>
            <Box p='1.5rem' w='100%' bg='#f5f5f5' borderBottom='1px solid #eee'>

              <Flex w='100%'>

                <Spacer/>

                <Box>
                  <Center>
                    <Text paddingTop='0.45rem' marginRight='1.5rem' as='b' fontSize='sm'><AddIcon marginRight='0.5rem' />new coproperty</Text>
                  </Center>
                </Box>

                <Box paddingRight='2rem'>
                  <Input size='sm' borderRadius='0.5rem' marginRight='1rem' type="text" bg="white" value={copropertyName} onChange={e => setCopropertyName(e.target.value)} placeholder="name"></Input>
                </Box>

                <Box paddingRight='2rem'>
                  <Input size='sm' borderRadius='0.5rem' marginRight='1rem' type="text" bg="white" value={copropertyTokenISO} onChange={e => setCopropertyTokenISO(e.target.value)} placeholder="token iso"></Input>
                </Box>

                <Box paddingRight='2rem'>
                  <Input size='sm' borderRadius='0.5rem' marginRight='1rem' type="text" bg="white" value={copropertySyndicAddress} onChange={e => setCopropertySyndicAddress(e.target.value)} placeholder="syndic address"></Input>
                </Box>

                <Box>
                  <Button isLoading={submitting} size='sm' onClick={ () => createCoproperty() }>register</Button>
                </Box>

                <Spacer/>

              </Flex>

            </Box>
        </>

    )
}

export default CreateCoproperty