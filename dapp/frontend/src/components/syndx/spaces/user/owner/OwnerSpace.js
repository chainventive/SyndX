'use client'

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const OwnerSpace = () => {

    const { selectedCoproperty } = useSyndx();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                OWNER SPACE

                <p>You selected: { selectedCoproperty.name } - { selectedCoproperty.contract }</p>

            </div>
        </>

    )
}

export default OwnerSpace