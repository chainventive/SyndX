'use client'

//ReactJS
import { useEffect, useState } from 'react'

// Viem
import { ContractFunctionExecutionError } from 'viem';

import { formatBlockchainAddress } from "@/helpers/formatter/index";

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core';

// Chakra
import { Text, Button, Flex, Select, Box, Spacer, Badge, VStack, Textarea, Center} from '@chakra-ui/react';

// Backend
import { backend } from "@/backend";

const Resolution = ({ assembly, resolution, amendments, isSyndicUser, now, lockup, voteEnd, hasVoted }) => {

    const [ description, setDescription ] = useState('');
    const [ voteType, setVoteType ] = useState(0);
    const [ voteResult, setVoteResult ] = useState(null);

    const [ updatingVoteType, setUpdatingVoteType ] = useState(false);
    const [ amending, setAmending ] = useState(false);
    const [ votingYes, setVotingYes ] = useState(false);
    const [ votingNo, setVotingNo ] = useState(false);
    const [ fetchingResult, setFetchingResult ] = useState(false);

    const getVoteTypeName = (value) => {

        switch (value) {
            case 1:
                return "Unanimity";
            case 2:
                return "Simple Majority";
            case 3:
                return "Absolute Majority";
            case 4:
                return "Double Majority";
            default:
                return "Undefined";
        }
    }

    const createAmendment = async () => {

        try {

            setAmending(true);

            const { request } = await prepareWriteContract({
                address: assembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: "createAmendment",
                args: [resolution.id, description]
            });
    
            const { hash } = await writeContract(request);
            await waitForTransaction({hash});

            setDescription('');

            return hash;
          
        } catch (err) {
    
            if (err instanceof ContractFunctionExecutionError) { 
                console.log(err);
                return;
            }
    
            console.log(err);
        }
        finally {
            setAmending(false);
        }
    };

    const setResolutionVoteType = async () => {

        if (voteType <= 0) return;

        try {

            setUpdatingVoteType(true);

            const { request } = await prepareWriteContract({
                address: assembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: "setResolutionVoteType",
                args: [resolution.id, voteType]
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
            setUpdatingVoteType(false);
        }
    }

    const vote = async (ballot) => {

        if (voteType <= 0) return;

        try {

            if (ballot == true) setVotingYes(true);
            if (ballot == false) setVotingNo(true);

            const { request } = await prepareWriteContract({
                address: assembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: "vote",
                args: [resolution.id, ballot]
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
            if (ballot == true) setVotingYes(true);
            if (ballot == false) setVotingNo(true);
        }

    }

    const getVoteResult = async () => {

        try {

            setFetchingResult(true);

            const voteResult = await readContract({
                address: assembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: 'getVoteResult',
                args: [resolution.id]
            });

            setVoteResult(voteResult);
          
        } catch (err) {
    
            if (err instanceof ContractFunctionExecutionError) { 
                console.log(err);
                return;
            }
    
            console.log(err);

        }
        finally {
            setFetchingResult(false);
        }
    }

    useEffect(() => {
        
        setVoteType(resolution.voteType);

    }, []);

    return (

        <Flex w='100%' border='1px solid #eee' p='2rem' borderRadius='1rem' marginBottom='2rem' bg='#fbfbfb'>
            <VStack w='100%'>
                <Flex w='100%'>
                    <Box>
                        
                        {
                            (isSyndicUser && resolution.voteType <= 0 && now < lockup) ? (
                                <Flex w='100%'>
                                    <Select marginRight='0.5rem' borderRadius='0.5rem' bg='white' size='sm' value={voteType} onChange={ (e) => setVoteType(e.target.value) }>
                                        <option value="0">Undefined</option>
                                        <option value="1">Unanimity</option>
                                        <option value="2">Simple Majority</option>
                                        <option value="3">Absolute Majority</option>
                                        <option value="4">Double Majority</option>
                                    </Select>
                                    <Button isLoading={updatingVoteType} w='10rem' size='sm' onClick={ () => setResolutionVoteType() }>set vote type</Button>
                                </Flex>
                            ) : (
                                <Badge colorScheme='messenger'>{ getVoteTypeName(resolution.voteType) }</Badge>
                            )
                        }
                    </Box>
                    <Spacer></Spacer>
                    <Box>
                        <Badge>author { formatBlockchainAddress(resolution.author) }</Badge>
                    </Box>
                </Flex>
                <Flex w='100%'>
                    <Box textAlign='left'>
                        <Text as='b'>{ resolution.title }</Text>
                    </Box>
                </Flex>
                <Flex w='100%' paddingBottom='0.5rem'>
                    <Box textAlign='left'>
                        <Text>{ resolution.description }</Text>
                    </Box>
                </Flex>

                {
                    amendments.length > 0 && (
                                            
                        amendments.map(amendment => (

                            <VStack w='100%' key={ amendment.id } borderTop='1px solid #eee'>
                                <Flex w='100%'>
                                    <Spacer></Spacer>
                                    <Box textAlign='left'>
                                        <Badge variant='outline'><b>amended by</b> { formatBlockchainAddress(amendment.author) }</Badge>
                                    </Box>
                                </Flex>
                                <Flex w='100%' textAlign='left' paddingBottom='1rem'>
                                    <Box textAlign='left'>
                                        <Text color='#606060' fontSize='sm'>{ amendment.description }</Text>
                                    </Box>
                                </Flex>
                            </VStack>
                        ))
                    )
                }

                {
                    now < lockup && (
                        <Flex w='100%'>
                            <Textarea bg='white' size='sm' borderRadius='0.5rem' style={{ marginRight: '0.5rem' }} type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="description"></Textarea>
                            <Button isLoading={amending} size='sm' onClick={ () => createAmendment() }>amend</Button>
                        </Flex>
                    )
                }

                {
                    !isSyndicUser && now > assembly.voteStartTime && now <= voteEnd && !hasVoted &&
                    (   
                        <Flex w='100%'>
                            <Spacer></Spacer>
                            <Button isLoading={votingNo} marginRight='1rem' colorScheme='red' size='sm' onClick={ () => vote(false) }>vote no</Button>
                            <Button isLoading={votingYes} colorScheme='green' size='sm' onClick={ () => vote(true)  }>vote yes</Button>
                        </Flex>
                    )
                }

                {
                    now > voteEnd && 
                    (
                        <Flex  w='100%' paddingTop='1rem'>
                            {
                                voteResult == null ? (

                                    <Center w='100%'>
                                        <Button isLoading={fetchingResult} minWidth='10rem' size='sm' colorScheme='messenger' onClick={ () => getVoteResult() }>result</Button>
                                    </Center>
                                    
                                ) : (

                                    <Flex w='100%'>
                                        <Center w='100%'>
                                            <Box>
                                                <Badge>
                                                    Yes Shares: { voteResult.yesShares }
                                                </Badge>
                                            </Box>
                                            <Spacer></Spacer>
                                            <Box>
                                                <Badge>
                                                    No Shares: { voteResult.noShares }
                                                </Badge>
                                            </Box>
                                            <Spacer></Spacer>
                                            <Box>
                                                <Badge>
                                                    Yes Count: { voteResult.yesCount }
                                                </Badge>
                                            </Box>
                                            <Spacer></Spacer>
                                            <Box>
                                                <Badge>
                                                    No Count: { voteResult.noCount }
                                                </Badge>
                                            </Box>
                                            <Spacer></Spacer>
                                            <Box>
                                                <Badge>
                                                    Equality: { voteResult.equality ? 'yes' : 'no' }
                                                </Badge>
                                            </Box>
                                            <Spacer></Spacer>
                                            <Box>
                                                <Badge colorScheme={voteResult.approved ? 'green' : 'red'}>
                                                    <span>Approved: </span>
                                                    { 
                                                        voteResult.equality ?  (

                                                            voteResult.tiebreaker > 0 ? (voteResult.approved ? 'yes' : 'no') : ('awaiting')
                                                        
                                                        ) : (

                                                            voteResult.approved ? 'yes' : 'no'
                                                        )
                                                    }
                                                </Badge>
                                            </Box>
                                        </Center>
                                    </Flex>
                                )
                            }
                        </Flex>
                    )
                }
            </VStack>
        </Flex>

    )
}

export default Resolution