'use client'

import Assembly from '@/components/syndx/spaces/user/syndic/features/assembly/participate/assembly';
import Assemblies from '@/components/syndx/spaces/user/syndic/features/assembly/select/selectAssembly';
import RegisterOwner from '@/components/syndx/spaces/user/syndic/features/owners/register/registerOwner';
import CreateAssembly from '@/components/syndx/spaces/user/syndic/features/assembly/create/createAssembly';
import CopropertyOwners from '@/components/syndx/spaces/user/syndic/features/owners/manage/copropertyOwners';

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import { AssemblyContextProvider } from '@/app/contexts/assembly/assembly.context.jsx';

const SyndicSpace = () => {

    const { setSelectedAssembly, selectedAssembly } = useCoproperty();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                SYNDIC SPACE
                
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