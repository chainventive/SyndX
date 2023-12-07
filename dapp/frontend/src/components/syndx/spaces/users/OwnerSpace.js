'use client'

// Components
import Assembly from '@/components/syndx/assembly/manageAssembly';
import Assemblies from '@/components/syndx/assembly/selectAssembly';

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import { AssemblyContextProvider } from '@/app/contexts/assembly/assembly.context.jsx';

const OwnerSpace = () => {

    const { setSelectedAssembly, selectedAssembly } = useCoproperty();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h3>OWNER SPACE</h3> 

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

export default OwnerSpace