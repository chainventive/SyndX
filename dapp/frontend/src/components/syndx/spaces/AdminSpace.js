'use client'

import CreateCoproperty from '@/components/syndx/coproperty/createCoproperty';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const AdminSpace = () => {

    const { selectedCoproperty } = useSyndx();
    
    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                ADMIN SPACE

                {
                    selectedCoproperty && (
                        <div>
                            <p>You selected: { selectedCoproperty.name } - { selectedCoproperty.contract }</p>
                        </div>
                    )
                }

                <CreateCoproperty/>

            </div>
        </>

    )
}

export default AdminSpace