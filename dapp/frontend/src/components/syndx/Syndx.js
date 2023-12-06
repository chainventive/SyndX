'use client'

//ReactJS
import { useState, useEffect } from 'react';

// Wagmi
import { readContract } from '@wagmi/core';

// Components
import Nav from '@/components/syndx/nav/Nav';
import UserSpace from '@/components/syndx/spaces/user/userSpace';
import AdminSpace from '@/components/syndx/spaces/admin/AdminSpace';
import Disconnected from '@/components/syndx/disconnected/Disconnected';

// Backend
import { backend } from '@/backend/index';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const Syndx = () => {

    const { isUserSyndxOwner, isUserConnected, userAddress } = useSyndx();

    const [ selectedCoproperty, setSelectedCoproperty ] = useState(null);
    const [ selectedCopropertySyndic, setSelectedCopropertySyndic ] = useState(null);

    const fetchCopropertySyndicAddress = async () => {

        const syndicAddress = await readContract({
            address: selectedCoproperty.contract,
            abi: backend.contracts.coproperty.abi,
            functionName: 'syndic'
        });

        setSelectedCopropertySyndic(syndicAddress);
    }

    useEffect(() => {

        if (selectedCoproperty != null) fetchCopropertySyndicAddress();

    }, [selectedCoproperty]);

    useEffect(() => {

        setSelectedCoproperty(null);

    }, [isUserConnected, userAddress]);

    return (

        <>

            {
                isUserConnected ? ( 

                    <>
                        <Nav onSelectCoproperty={setSelectedCoproperty} />

                        {
                            isUserSyndxOwner ? <AdminSpace coproperty={selectedCoproperty}/> : <UserSpace coproperty={selectedCoproperty} syndicAddress={selectedCopropertySyndic} />
                        }                        
                        
                    </>

                ) : (

                    <Disconnected/>

                )
            }

        </>

    )
}

export default Syndx