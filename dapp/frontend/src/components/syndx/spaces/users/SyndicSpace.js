'use client'

import Assembly from '@/components/syndx/assembly/manageAssembly';
import Assemblies from '@/components/syndx/assembly/selectAssembly';
import RegisterOwner from '@/components/syndx/coproperty/registerOwner';
import CreateAssembly from '@/components/syndx/assembly/createAssembly';
import CopropertyOwners from '@/components/syndx/coproperty/manageOwners';
import VoteToken from '@/components/syndx/assembly/vote/VoteToken';

// Chakra
import { Tabs, TabList, Text, Tab, TabPanels, TabPanel, Badge } from '@chakra-ui/react';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import { AssemblyContextProvider } from '@/app/contexts/assembly/assembly.context.jsx';

const SyndicSpace = () => {

    const { selectedCoproperty } = useSyndx();
    const { setSelectedAssembly, selectedAssembly } = useCoproperty();

    return (

        <>
            <Text fontSize='2xl' as='b' >{ selectedCoproperty.name }</Text>
            <Badge borderRadius='0.5rem' marginLeft='0.5rem' variant='outline'>syndic</Badge>

            <Tabs variant='enclosed' marginTop='2rem'>

                <TabList>

                    <Tab onClick={() => setSelectedAssembly(null)}>Coproperty Owners</Tab>
                    <Tab onClick={() => setSelectedAssembly(null)}>Governance Token</Tab>
                    <Tab onClick={() => setSelectedAssembly(null)}>General Assemblies</Tab>

                </TabList>

                <TabPanels>
                    
                    <TabPanel>
                        <RegisterOwner/>
                    </TabPanel>

                    <TabPanel>
                        <CopropertyOwners/>
                    </TabPanel>

                    <TabPanel>

                        {                 
                            selectedAssembly == null && (
                                <CreateAssembly/>
                            ) 
                        }
                        
                        <Assemblies onSelectAssembly={ setSelectedAssembly } />

                    </TabPanel>

                </TabPanels>

            </Tabs>
                
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

export default SyndicSpace