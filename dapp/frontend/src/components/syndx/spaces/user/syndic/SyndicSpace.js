'use client'

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import RegisterOwner from './features/owners/register/registerOwner';
import CopropertyOwners from './features/owners/manage/copropertyOwners';

const SyndicSpace = () => {

    const { selectedCoproperty } = useSyndx();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                SYNDIC SPACE
                
                <CopropertyOwners/>
                <RegisterOwner/>

            </div>
        </>

    )
}

export default SyndicSpace