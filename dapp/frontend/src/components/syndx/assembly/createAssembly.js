'use client'

//ReactJS
import { useState } from 'react'

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';

// Backend
import { backend } from "@/backend";

// Chakra
import { TableContainer, Table, Tbody, Tr, Td, Button, Thead, Th, Flex, Input, Text, Box, Spacer, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Center} from '@chakra-ui/react';
import { CopyIcon, AddIcon } from '@chakra-ui/icons';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

const CreateAssembly = () => {

    const [submitting, setSubmitting] = useState(false);

    const { selectedCoproperty } = useSyndx();
    const { fetchAssemblyCount } = useCoproperty();

    const [ date, setDate ] = useState('');

    const createAssembly = async () => {

        try {

            setSubmitting(true);

            const voteStartDate = Math.floor(new Date(date).getTime() / 1000);
            
            const { request } = await prepareWriteContract({
                address: selectedCoproperty.contract,
                abi: backend.contracts.coproperty.abi,
                functionName: "createGeneralAssembly",
                args: [voteStartDate]
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
            
            setDate('');
            fetchAssemblyCount();
            setSubmitting(false);
        }
    
    };

    return (

        <>
            <Flex p='1rem' bg='#f8f8f8' marginTop='0.75rem' borderRadius='0.75rem'>
              <Spacer/>
              <Box marginRight='1.5rem'>
                <Center>
                  <Text paddingTop='0.3rem' as='b' fontSize='sm'><AddIcon marginRight='0.5rem' />general assembly</Text>
                </Center>
              </Box>
              <Box marginRight='1.5rem'>
                <Input size='sm' bg='white' borderRadius='0.5rem' color="black" cursor='pointer' paddingRight='0.25rem' paddingLeft='0.5rem' paddingTop='0.2rem' paddingBottom='0.2rem' type="datetime-local" value={ date } onChange={ (e) => setDate(e.target.value) }/>
              </Box>
              <Box>
                <Button isLoading={submitting}  minWidth='5rem' size='sm' onClick={ () => createAssembly() }>create</Button>
              </Box>
              <Spacer/>
            </Flex>
        </>

    )
}

export default CreateAssembly