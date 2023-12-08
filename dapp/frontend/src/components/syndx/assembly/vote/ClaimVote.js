'use client'

// ReactJS
import { useEffect, useState } from "react";

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';

// Chakra
import { Text, Button, Flex, Heading, Box, Spacer, Badge, VStack, Stepper, StepNumber, Step, StepIndicator, StepStatus, StepSeparator, StepTitle, StepDescription, Center} from '@chakra-ui/react';
import { StepIcon, ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';


// Backend
import { backend } from "@/backend";

// Helpers
import { getTimestampDate, formatTimeSpan } from "@/helpers/time/index";

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import useSyndx from "@/app/contexts/syndx/hooks/useSyndx";

const ClaimVote = ({ now, lockup }) => {

    const { userAddress, isUserConnected } = useSyndx();
    const { selectedAssembly } = useCoproperty();

    const [ hasClaimed, setHasClaimed ] = useState(false);
    const [ balance, setBalance ] = useState(0);

    const fetchUserVoteDetails = async () => {

        try {

            const balance = await readContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: 'balanceOf',
                args: [userAddress]
            });

            const hasClaimed = await readContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: 'hasClaimed',
                args: [userAddress]
            });
    
            setHasClaimed(hasClaimed);
            setBalance(balance);
          
        } catch (err) {
    
            if (err instanceof ContractFunctionExecutionError) { 
                console.log(err);
                return;
            }
    
            console.log(err);

        }
    }

    const claimVoteTokens = async () => {

        try {

            const { request } = await prepareWriteContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: "claimVoteTokens",
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

            await fetchUserVoteDetails();
        }
    
    };

    useEffect(() => {
        if (isUserConnected) fetchUserVoteDetails();
    }, [isUserConnected, userAddress]);

    useEffect(() => {
        if (isUserConnected) fetchUserVoteDetails();
    }, []);

    return (

        <>
            <Flex w='100%'>
                <Box>
                    <Text as='b'>Vote tokens balance: <span style={{ color:'#3e83de' }}>{ `${ balance }` }</span></Text>
                </Box>
                <Spacer></Spacer>
                <Box>
                {
                    !hasClaimed && now < lockup && (
                        <Button size='sm' colorScheme='messenger' onClick={ () => claimVoteTokens() }>claim vote tokens</Button>
                    )
                }
                </Box>
            </Flex>
        </>

    )
}

export default ClaimVote  