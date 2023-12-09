'use client'

// Chakra
import { Box, VStack, Center, Text } from '@chakra-ui/react';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const Disconnected = () => {

    const { isUserConnected } = useSyndx();

    return (

        <>
            <Box bg={ isUserConnected ? 'white' : '#f4f4f4'} flexGrow='1' height='75vh'p='1rem' paddingBottom='2rem' textAlign='left'>
                <Center h='100%'>

                    <VStack align='left'>
                        <Text align='left' fontSize='6xl' as='b'>Decentralized Coproperty</Text>

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