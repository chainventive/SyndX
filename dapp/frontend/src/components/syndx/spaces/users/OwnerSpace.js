'use client'

// Components
import Assembly from '@/components/syndx/assembly/manageAssembly';
import Assemblies from '@/components/syndx/assembly/selectAssembly';

// Chakra
import { Text, Button, Flex, Heading, Box, Spacer, Badge, VStack, Stepper, StepNumber, Step, StepIndicator, StepStatus, StepSeparator, StepTitle, StepDescription, Center} from '@chakra-ui/react';
import { StepIcon, ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import { AssemblyContextProvider } from '@/app/contexts/assembly/assembly.context.jsx';

const OwnerSpace = () => {

    const { selectedCoproperty } = useSyndx();
    const { setSelectedAssembly, selectedAssembly } = useCoproperty();

    return (

        <>
            <Flex w='100%' borderBottom='1px solid #eee' paddingTop='0.5rem' paddingBottom='0.5rem'>
                <Text fontSize='2xl' as='b' >{ selectedCoproperty.name }</Text>
            </Flex>

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