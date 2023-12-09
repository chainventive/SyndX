'use client'

// Helpers
import { getTimestampDate, getDateTimestamp, getTimestampShortDate } from "@/helpers/time/index";
import { formatBlockchainAddress } from "@/helpers/formatter/index";

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core';

// Backend
import { backend } from "@/backend";

// Chakra
import { Text, Button, Flex, Heading, Box, Spacer, Badge, VStack, Stepper, StepNumber, Step, StepIcon, StepIndicator, StepStatus, StepSeparator, StepTitle, StepDescription, Center} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';

import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
  } from '@chakra-ui/react'


// Components
import CreateResolution from "@/components/syndx/assembly/createResolution";
import Resolution from "@/components/syndx/assembly/resolution/Resolution";
import ClaimVote from "@/components/syndx/assembly/vote/ClaimVote";

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import useAssembly from '@/app/contexts/assembly/hook/useAssembly';

// ReactJS
import { useEffect, useState } from "react";
import VoteToken from "./vote/VoteToken";

const   Assembly = () => {

    const { networkNow, selectedCoproperty, userAddress } = useSyndx();
    const { selectedAssembly, setSelectedAssembly } = useCoproperty();
    const { tiebreaker, created, lockup, voteEnd, resolutions, amendments, isSyndicUser, votes } = useAssembly();

    const [ currentStep, setCurrentStep ] = useState(1);

    let steps = [
        { title: 'created', description: `${getTimestampDate(created)}` },
        { title: 'lockup', description: `${getTimestampDate(lockup)}` },
        { title: 'vote', description: `${getTimestampDate(selectedAssembly.voteStartTime)}` },
        { title: 'tally', description: `${getTimestampDate(voteEnd)}` },
    ]

    const getCurrentStep = () => {
        if (networkNow <= 0) return 0;
        if (networkNow < lockup) return 1;
        if (networkNow < selectedAssembly.voteStartTime) return 2;
        if (networkNow < voteEnd) return 3; 
        return 4;
    };

    const tiebreak = async () => {

        try {
            
            const { request } = await prepareWriteContract({
                address: selectedAssembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: "requestTiebreaker",
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

    const verifyHasVoted = (resolutionId) => {
        
        const hasVoted = votes.some(vote => vote.author == userAddress && resolutionId == vote.resolutionId);
        return hasVoted;
    }

    useEffect(() => {
        setCurrentStep(getCurrentStep());
    }, [networkNow]);

    return (

        <>
            <VStack w='100%' paddingLeft='1rem' paddingRight='1rem'>

                <Flex w='100%' marginBottom='2rem'>
                    <Box>
                        <Heading as='h4' size='md'>GENERAL ASSEMBLY - { getTimestampShortDate(selectedAssembly.voteStartTime) }</Heading>
                    </Box>
                    <Box marginLeft='1rem'>
                        <Menu>
                            <MenuButton size='xs' as={Button} rightIcon={<ChevronDownIcon />}>
                                contracts
                            </MenuButton>
                            <MenuList>
                                <MenuItem>
                                    <Badge bg='transparent'>
                                    coproperty <span style={{ color: '#805ad5' }}>{ formatBlockchainAddress(selectedCoproperty.contract) }</span> 
                                    </Badge> 
                                </MenuItem>
                                <MenuItem>
                                    <Badge bg='transparent'>
                                        assembly <span style={{ color: '#805ad5' }}>{ formatBlockchainAddress(selectedCoproperty.contract) }</span>
                                    </Badge>  
                                </MenuItem>
                                <MenuItem>
                                    <Badge bg='transparent'>
                                        governance <span style={{ color: '#805ad5' }}>{ formatBlockchainAddress(selectedCoproperty.contract) }</span>
                                    </Badge>  
                                </MenuItem>
                                <MenuItem>
                                    <Badge bg='transparent'>
                                        vote <span style={{ color: '#805ad5' }}>{ formatBlockchainAddress(selectedCoproperty.contract) }</span>
                                    </Badge>  
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Box>
                    <Spacer/>
                    <Box>
                        <Button size='sm' onClick={ () => setSelectedAssembly(null) }>back<ChevronRightIcon marginLeft='0.25rem'/></Button>
                    </Box>
                </Flex>

                <Flex marginBottom='2rem' paddingBottom='1rem' borderBottom='1px solid #eee'>
                    <Stepper size='sm' index={currentStep}>
                        {steps.map((step, index) => (
                            <Step key={index} gap="12">
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>
                                <Box flexShrink='0'>
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription>{step.description}</StepDescription>
                                </Box>
                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>
                </Flex>

                <Flex w='100%' marginBottom='2rem' paddingBottom='2rem' borderBottom='1px solid #eee'>
                    <Box>
                        <Badge padding='0.5rem 1rem' borderRadius='0.5rem'>
                            <Center>
                                tiebreaker - { `${ tiebreaker }`  }
                            </Center>
                        </Badge>
                    </Box>
                    <Spacer></Spacer>
                    <Box>
                        { 
                            networkNow > voteEnd && tiebreaker <= 0 && (
                                <Button colorScheme='messenger' size='sm' onClick={() => tiebreak()}>request tiebreak</Button>
                            )
                        }
                    </Box>
                </Flex>

                <Flex  w='100%' marginBottom='2rem' paddingBottom='2rem' borderBottom='1px solid #eee'>
                    {
                        isSyndicUser ? (
                            <VoteToken/>
                        ) : (
                            <ClaimVote now={networkNow} lockup={lockup}/>
                        )
                    }
                </Flex>

                {
                    networkNow < lockup && (
                        <Flex  w='100%' marginBottom='2rem' paddingBottom='2rem'>
                            <CreateResolution assembly={ selectedAssembly }/>
                        </Flex>
                    )
                }
                
                {
                    resolutions.length > 0 && (
                        <Flex  w='100%' marginBottom='1rem'>
                            <Center w='100%'>
                                <Heading as='h4' size='md'>RESOLUTIONS</Heading>
                            </Center> 
                        </Flex>
                    )
                }

                <Flex w='100%' marginBottom='2rem' paddingBottom='2rem'>
                    <VStack w='100%'>
                    {
                        resolutions.length > 0 && (

                            resolutions.map((resolution, index) => (

                                <Resolution key={index} hasVoted={verifyHasVoted(resolution.id)} isSyndicUser={ isSyndicUser } now={ networkNow } assembly={ selectedAssembly } lockup={ lockup } voteEnd={ voteEnd } resolution={ resolution } amendments={ amendments.filter(amendment => amendment.resolutionID == resolution.id) }/>
                                
                            ))

                        )
                    }
                    </VStack>
                </Flex>

            </VStack>
        </>

    )
}

export default Assembly  