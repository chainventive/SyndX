'use client'

const { createContext } = require("react");

import { backend } from '@/backend/index';
import { useState, useEffect } from 'react';
import { readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

const SyndxContext = createContext(null);

export default SyndxContext;

const SyndxContextProvider = ({ children }) => {

    const viemClient = usePublicClient();

    // context state
    
    const { address, isConnected } = useAccount();

    const [ isSyndxAdmin, setIsSyndxAdmin ] = useState(false);

    // checks who is the connected user

    const retrieveUserProfile = async () => {

        const owner = await readContract({
            address: backend.contracts.syndx.address,
            abi: backend.contracts.syndx.abi,
            functionName: 'owner'
        });

        setIsSyndxAdmin(address == owner);
    }

    // Component lifecycle

    useEffect(() => {

        if (isConnected) {
            retrieveUserProfile();
        }
        else {
            setIsSyndxAdmin(false);
        }

    }, [isConnected, address]);

    useEffect(() => {

        console.log(backend.contracts.syndx.abi);

        if (isConnected) {
            retrieveUserProfile();
        }
        else {
            setIsSyndxAdmin(false);
        }

    }, []);

    // JSX

    return (

        <SyndxContext.Provider value={{
            isUserConnected: isConnected,
            userAddress: address,
            isSyndxAdmin: isSyndxAdmin
        }}>
            { children }
        </SyndxContext.Provider>

    )
};

export { SyndxContextProvider }