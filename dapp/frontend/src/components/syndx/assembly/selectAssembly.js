'use client'

// Helpers
import { getTimestampDate } from "@/helpers/time/index";
import { formatBlockchainAddress } from "@/helpers/formatter/index";

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

// Chakra
import { SimpleGrid, Heading, Card, CardHeader, CardBody, CardFooter, Stack, StackDivider, Tbody, Tr, Td, Button, Thead, Th, Flex, Input, Text, Box, Spacer, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Center} from '@chakra-ui/react';
import { CopyIcon, AddIcon } from '@chakra-ui/icons';

const Assemblies = ({ onSelectAssembly }) => {

    const { assemblies, selectedAssembly } = useCoproperty();

    return (

        <SimpleGrid minChildWidth='120px' spacing='40px' marginTop='3rem'>

                {
                    assemblies.length > 0 && selectedAssembly == null && (

                        assemblies.map(assembly => (

                            <Box key={ assembly.contract } maxWidth='14rem' style={{ cursor: 'pointer' }} onClick={ () => onSelectAssembly(assembly) }>
                                <Card>
                                    <CardBody>
                                        <Stack divider={<StackDivider/>} spacing='4'>
                                            <Box>
                                                <Heading size='sm' textTransform='uppercase'>General Assembly</Heading>
                                            </Box>
                                            <Box>
                                                <Heading size='xs' textTransform='uppercase'>Date</Heading>
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

                    )
                }

        </SimpleGrid>

    )
}

export default Assemblies