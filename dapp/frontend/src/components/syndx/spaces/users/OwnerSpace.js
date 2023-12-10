'use client'

// Components
import Assembly from '@/components/syndx/assembly/manageAssembly';
import Assemblies from '@/components/syndx/assembly/selectAssembly';

// Chakra
import { Text, Flex, Center} from '@chakra-ui/react';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import { AssemblyContextProvider } from '@/app/contexts/assembly/assembly.context.jsx';

const OwnerSpace = () => {

    const { selectedCoproperty } = useSyndx();
    const { setSelectedAssembly, selectedAssembly, assemblies } = useCoproperty();

    return (

        <>
            <Flex w='100%' borderBottom='1px solid #eee' paddingTop='0.5rem' paddingBottom='0.5rem'>
                <Text fontSize='2xl' as='b' >{ selectedCoproperty.name }</Text>
            </Flex>

            {
                assemblies.length <= 0 && (
                    <Flex w='100%' h="50vh">
                        <Center w='100%' h='100%'>
                            <Text fontSize='md' color='dimgray'>- no assembly available -</Text>
                        </Center>
                    </Flex>
                )
            }

            <Assemblies onSelectAssembly={ setSelectedAssembly } />

            {
                selectedAssembly && (

                    <AssemblyContextProvider>
                        <Assembly/>
                    </AssemblyContextProvider>
                )
            }

        </>

    )
}

export default OwnerSpace