'use client'

// Components
import SyndicSpace from '@/components/syndx/spaces/users/SyndicSpace';
import OwnerSpace from '@/components/syndx/spaces/users/OwnerSpace';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const UserSpace = () => {
    
    const { selectedCoproperty, isUserSelectedCopropertySyndic } = useSyndx();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                {
                    selectedCoproperty == null ? (

                        <>
                            <p>Please select a coproperty</p>
                        </>

                    ) : (

                        <>
                            { 
                                isUserSelectedCopropertySyndic ? (

                                    <SyndicSpace />

                                ) : (
                                    
                                    <OwnerSpace />
                                )
                            }
                        </>
                    )
                }

            </div>
        </>

    )
}

export default UserSpace