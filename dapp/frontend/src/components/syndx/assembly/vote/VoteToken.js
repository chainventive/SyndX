'use client'

// ReactJS
import { useEffect, useState } from "react";

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core';

// Chakra
import { Flex, Box, Button, Input, Text, Badge, Spacer, VStack } from '@chakra-ui/react';

// Backend
import { backend } from "@/backend";

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import useSyndx from "@/app/contexts/syndx/hooks/useSyndx";

const VoteToken = ({lockup, now}) => {

    const { userAddress, isUserConnected } = useSyndx();
    const { selectedAssembly } = useCoproperty();

    const [ burnAddress,  setBurnAddress  ] = useState('');
    const [ totalClaimed, setTotalClaimed ] = useState(0);
    const [ tokenSymbol,  setTokenSymbol  ] = useState('');
    const [ tokenName,    setTokenName    ] = useState('');

    const [ burning, setBurning ] = useState(false);

    const fetchVoteTokenDetails = async () => {

        try {

            const totalSupply = await readContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: 'totalSupply'
            });

            setTotalClaimed(Number(totalSupply));

            const name = await readContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: 'name',
            });

            setTokenSymbol(name);

            const symbol = await readContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: 'symbol',
            });

            setTokenName(symbol);
          
        } catch (err) {
    
            if (err instanceof ContractFunctionExecutionError) { 
                console.log(err);
                return;
            }
    
            console.log(err);

        }
    }

    const burnLostTokens = async () => {
        setBurning(true);
        setBurnAddress('');
        setBurning(false);
    }

    useEffect(() => {
        if (isUserConnected) fetchVoteTokenDetails();
    }, [isUserConnected, userAddress]);

    useEffect(() => {
        if (isUserConnected) fetchVoteTokenDetails();
    }, []);

    return (

        <Flex w='100%'>
            <Box>
                <Text as='b'>Claimed vote tokens</Text>
                <Text paddingTop='0.5rem' size='xs'>{ `${totalClaimed}` } / 10000 <Badge>{ `${tokenName}` }</Badge></Text>
            </Box>
            <Spacer></Spacer>
            <Box>
               {
                    now < lockup && (

                    <VStack>          
                        <Text w='100%' as='b'>A user lost his vote tokens ?</Text>
                        <Flex alignItems="left">
                            <Input minWidth='15rem' borderRadius='0.5rem' size='sm' marginRight='1rem' type="text" value={burnAddress} onChange={e => setBurnAddress(e.target.value)} placeholder="account address"></Input>
                            <Button isLoading={burning} w='12rem' colorScheme='red' size='sm' onClick={ () => burnLostTokens() }>burn them</Button>
                        </Flex> 
                    </VStack>

                    )
               }
            </Box>
        </Flex>

    )
}

export default VoteToken  