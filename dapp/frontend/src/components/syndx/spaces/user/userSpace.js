'use client'

// Components
import SyndicSpace from '@/components/syndx/spaces/user/syndic/SyndicSpace';
import OwnerSpace from '@/components/syndx/spaces/user/owner/OwnerSpace';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const UserSpace = ({ coproperty, syndicAddress }) => {
    
    const { userAddress } = useSyndx();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                {
                    coproperty == null ? (

                        <>
                            <p>Please select a coproperty</p>
                        </>

                    ) : (

                        <>
                            { 
                                syndicAddress === userAddress ? (

                                    <SyndicSpace coproperty={coproperty} />

                                ) : (
                                    
                                    <OwnerSpace coproperty={coproperty} />
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