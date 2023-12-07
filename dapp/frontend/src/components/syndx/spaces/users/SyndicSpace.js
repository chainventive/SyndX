'use client'

import Assembly from '@/components/syndx/assembly/manageAssembly';
import Assemblies from '@/components/syndx/assembly/selectAssembly';
import RegisterOwner from '@/components/syndx/coproperty/registerOwner';
import CreateAssembly from '@/components/syndx/assembly/createAssembly';
import CopropertyOwners from '@/components/syndx/coproperty/manageOwners';

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import { AssemblyContextProvider } from '@/app/contexts/assembly/assembly.context.jsx';

const SyndicSpace = () => {

    const { setSelectedAssembly, selectedAssembly } = useCoproperty();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h3>SYNDIC SPACE</h3>
                
                <CopropertyOwners/>
                <RegisterOwner/>
                <CreateAssembly/>
                <Assemblies onSelectAssembly={ setSelectedAssembly } />

                {
                    selectedAssembly && (

                        <AssemblyContextProvider>
                            <Assembly/>
                        </AssemblyContextProvider>
                    )
                }

            </div>
        </>

    )
}

export default SyndicSpace