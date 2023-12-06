'use client'

const { createContext } = require("react");

import { backend } from '@/backend/index';
import { useState, useEffect } from 'react';
import { readContract, watchContractEvent } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

const SyndxContext = createContext(null);

export default SyndxContext;

const SyndxContextProvider = ({ children }) => {

    const viemClient = usePublicClient();

    // context state
    
    const { address, isConnected } = useAccount();

    const [ isSyndxAdmin, setIsSyndxAdmin ] = useState(false);

    const [ contractEvents, setContractEvents ] = useState([]);

    // checks who is the connected user

    const retrieveUserProfile = async () => {

        const owner = await readContract({
            address: backend.contracts.syndx.address,
            abi: backend.contracts.syndx.abi,
            functionName: 'owner'
        });

        setIsSyndxAdmin(address == owner);
    }

    // listen past smart contract past events

    const fetchPastContractEvents = async () => {

        try {

            let pastEvents = await viemClient.getContractEvents({
                address: backend.contracts.syndx.address,
                abi: backend.contracts.syndx.abi,
                fromBlock: BigInt(backend.blocknumber),
                toBlock: 'latest'
            });

            pastEvents = pastEvents.map((event, index) => ({
                index: index,
                blocknumber: Number(event.blockNumber),
                name: event.eventName,
                args: event.args
            }));

            //console.log(pastEvents);

            setContractEvents(pastEvents);
        }
        catch (error) {
            console.error("Error while fetching events", error);
        }

    }

    const eventWatcher = watchContractEvent({
            abi: backend.contracts.syndx.abi,
            address: backend.contracts.syndx.address,
            eventName: 'allEvents',
        },
        (newEvents) => {

            newEvents = newEvents.map((event, index) => ({
                index: index,
                blocknumber: event.blockNumber,
                name: event.eventName,
                args: event.args
            }));

            const arr = contractEvents.concat(newEvents);
            setContractEvents(arr.filter((event, index) => arr.indexOf(event) === index));
            //console.log(newEvents);

            /*
            dispatchFromEventsAction({
                type: VOTING_EVENTS_UPDATE_ACTION,
                payload: { userAddress: address, logs }
            });
            */
        },
    );

    

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

        fetchPastContractEvents();

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
            isSyndxAdmin: isSyndxAdmin,
            contractEvents: contractEvents
        }}>
            { children }
        </SyndxContext.Provider>

    )
};

export { SyndxContextProvider }