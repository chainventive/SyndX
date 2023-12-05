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

    // listen to all events of the smart contract

    const listenToAllEvents = async () => {

        try {

            const allEvents = await viemPublicClient.getContractEvents({
                address: backend.contracts.syndx.address,
                abi: backend.contracts.syndx.abi,
                fromBlock: BigInt(backend.blocknumber),
                toBlock: 'latest'
            });

            /*
            dispatchFromEventsAction({
                type: VOTING_EVENTS_UPDATE_ACTION,
                payload: { userAddress: address, logs: allEvents }
            });
            */
        }
        catch (err) {

            console.error("Error while fetching events", error);
        }

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