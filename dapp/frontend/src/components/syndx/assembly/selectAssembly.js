'use client'

// Helpers
import { getTimestampDate } from "@/helpers/time/index";

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

const Assemblies = ({ onSelectAssembly }) => {

    const { assemblies, selectedAssembly } = useCoproperty();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h3>GENERAL ASSEMBLIES</h3>

                {
                    assemblies.length > 0 ? (

                        assemblies.map(assembly => (

                            <button style={{ margin: '0.5rem', color: selectedAssembly?.contract == assembly.contract ? 'blue' : 'black' }} key={ assembly.contract } onClick={ () => onSelectAssembly(assembly) }>{ assembly.contract } - { getTimestampDate(assembly.voteStartTime) }</button>
                            
                        ))

                    ) : (

                        <p>No general assembly created yet</p>
                    )

                    
                }

            </div>
        </>

    )
}

export default Assemblies