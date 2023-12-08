'use client'

//ReactJS
import { useState } from 'react'

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core';

// Chakra
import { Input, Text, Button, Flex, Heading, Box, Spacer, Badge, VStack, Textarea, StepNumber, Step, StepIndicator, StepStatus, StepSeparator, StepTitle, StepDescription, Center} from '@chakra-ui/react';
import { AddIcon, ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';


// Backend
import { backend } from "@/backend";

const CreateResolution = ({ assembly }) => {

    const [ title, setTitle ] = useState('');
    const [ description, setDescription ] = useState('');

    const createResolution = async () => {

        try {

            const { request } = await prepareWriteContract({
                address: assembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: "createResolution",
                args: [title, description]
            });
    
            const { txHash } = await writeContract(request);
            await waitForTransaction({hash: txHash});

            setTitle('');
            setDescription('');

            return txHash;
          
        } catch (err) {
    
            if (err instanceof ContractFunctionExecutionError) { 
                console.log(err);
                return;
            }
    
            console.log(err);
    
        }
    
    };

    return (

        <Flex w='100%'>
            <VStack w='100%'>
                <Flex w='100%'>
                    <Text as='b'><AddIcon marginRight='0.5rem'/>New resolution</Text>
                </Flex>
                <Flex w='100%' marginTop='1rem'>
                    <VStack w='100%'>
                        <Input style={{ marginRight: '0.5rem' }} type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="title"></Input>
                        <Textarea style={{ marginRight: '0.5rem' }} type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="description"></Textarea>
                    </VStack>
                </Flex>
                <Flex w='100%'>
                    <Spacer></Spacer>
                    <Box marginTop='1rem'>
                        <Button size='sm' colorScheme='messenger' onClick={ () => createResolution() }>submit resolution</Button>
                    </Box>
                </Flex>
            </VStack>
        </Flex>

    )
}

export default CreateResolution