'use client'

// Chakra
import { Box, VStack, Center, Text } from '@chakra-ui/react';

const Disconnected = () => {

    return (

        <>
            <Box flexGrow='1' height='50vw'p='1rem' m='1rem' textAlign='left'>
                <Center h='100%'>

                    <VStack align='left'>
                        <Text align='left' fontSize='6xl' as='b'>Decentralized coproperty</Text>

                        <Text align='left' fontSize='6xl' as='b'>Management<span style={{ color: '#0e76fd' }}> _</span></Text>

                        <Text align='left' fontSize='lg' as='em' marginTop='4rem'>
                            <span style={{ background: '#0e76fd', borderRadius: '1rem', padding: '0.75rem 1.5rem', color: 'white' }}>Empowering transparency, ensuring trust in coproperty management.</span>
                        </Text>
                    </VStack>

                </Center>
            </Box>
        </>
    )
}

export default Disconnected