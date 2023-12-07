'use client'

import Assemblies from '@/components/syndx/spaces/user/syndic/features/assembly/select/selectAssembly';
import RegisterOwner from '@/components/syndx/spaces/user/syndic/features/owners/register/registerOwner';
import CreateAssembly from '@/components/syndx/spaces/user/syndic/features/assembly/create/createAssembly';
import CopropertyOwners from '@/components/syndx/spaces/user/syndic/features/owners/manage/copropertyOwners';

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

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
                        <p>{ selectedAssembly.contract }</p>
                    )
                }

            </div>
        </>

    )
}

export default SyndicSpace