'use client'

// Helpers
import { getTimestampDate } from "@/helpers/time/index";
import { formatBlockchainAddress } from "@/helpers/formatter/index";

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

// Chakra
import { SimpleGrid, Heading, Card, CardBody, Stack, StackDivider, Box, Text, Flex, Center } from '@chakra-ui/react';

const Assemblies = ({ onSelectAssembly }) => {

    const { assemblies, selectedAssembly } = useCoproperty();

    return (

        <SimpleGrid minChildWidth='120px' spacing='40px' marginTop='1rem'>

                {
                     selectedAssembly == null && (

                        
                            assemblies.length > 0 ? (

                                assemblies.map(assembly => (

                                    <Box key={ assembly.contract } maxWidth='14rem' style={{ cursor: 'pointer' }} onClick={ () => onSelectAssembly(assembly) }>
                                        <Card>
                                            <CardBody>
                                                <Stack divider={<StackDivider/>} spacing='4'>
                                                    <Box>
                                                        <Heading size='sm' textTransform='uppercase'>General Assembly</Heading>
                                                    </Box>
                                                    <Box>
                                                        <Heading size='xs' textTransform='uppercase'>VOTE DATE</Heading>
                                                        <Text pt='2' fontSize='sm'>{ getTimestampDate(assembly.voteStartTime) }</Text>
                                                    </Box>
                                                    <Box>
                                                        <Heading size='xs' textTransform='uppercase'>Contract</Heading>
                                                        <Text pt='2' fontSize='sm'>{ formatBlockchainAddress(assembly.contract) }</Text>
                                                    </Box>
                                                </Stack>
                                            </CardBody>
                                        </Card>
                                    </Box>
        
                                ))

                            ) : (

                                <Flex w='100%' h="50vh">
                                    <Center w='100%' h='100%'>
                                        <Text fontSize='md' color='dimgray'>- no coproperty selected -</Text>
                                    </Center>
                                </Flex>
                            )
                        

                    )
                }

        </SimpleGrid>

    )
}

export default Assemblies