'use client'

const { createContext } = require("react");

// ReactJS
import { useState, useEffect, useReducer } from 'react';

// Wagmi
import { readContract, watchContractEvent } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Backend
import { backend } from '@/backend/index';

import syndxContextReducer, { 
    ON_USER_CHANGE, 
    ON_NEW_SYNDX_CONTRACT_EVENTS,
    ON_SYNDX_CONTRACT_OWNER_FETCHED,
    ON_SYNDX_COPROPERTY_SELECTED,
    ON_SYNDX_COPROPERTY_SYNDIC_FETCHED,
} from '@/app/contexts/syndx/syndx.reducer';

const SyndxContext = createContext(null);

export default SyndxContext;

const SyndxContextProvider = ({ children }) => {

    const viemClient = usePublicClient();

    // hooks

    const { address, isConnected } = useAccount();

    // context state
    
    const [ reducerState, dispatchToReducerAction ] = useReducer(syndxContextReducer, {
        userAddress: null,
        isUserSyndxOwner: false,
        isUserConnected: false,
        coproperties: [],
        selectedCoproperty: null,
        selectedCopropertySyndic: null,
        isUserSelectedCopropertySyndic: false,
    });

    const [ networkNow, setNetworkNow ] = useState(0);
    const [ isAsyncTaskRunning, setIsAsyncTaskRunning ] = useState(false);
    const [ unwatchEvents, setUnwatchEvents] = useState(null);

    // external setters

    const setSelectedCoproperty = (coproperty) => {
        fetchCopropertySyndic(coproperty);
        dispatchToReducerAction({ type: ON_SYNDX_COPROPERTY_SELECTED, payload: coproperty });
    }

    // internal functions

    const checkUser = async () => {

        dispatchToReducerAction({ type: ON_USER_CHANGE, payload: { isConnected, address } });

    }

    const fetchCopropertySyndic = async (coproperty) => {

        const syndicAddress = await readContract({
            address: coproperty.contract,
            abi: backend.contracts.coproperty.abi,
            functionName: 'syndic'
        });

        dispatchToReducerAction({ type: ON_SYNDX_COPROPERTY_SYNDIC_FETCHED, payload: syndicAddress });
    }

    const fetchSyndxContractOwner = async () => {

        const contractOwner = await readContract({
            address: backend.contracts.syndx.address,
            abi: backend.contracts.syndx.abi,
            functionName: 'owner'
        });

        dispatchToReducerAction({ type: ON_SYNDX_CONTRACT_OWNER_FETCHED, payload: contractOwner });
    }

    const fetchPastContractEvents = async () => {

        let pastEvents = await viemClient.getContractEvents({
            address: backend.contracts.syndx.address,
            abi: backend.contracts.syndx.abi,
            fromBlock: BigInt(backend.blocknumber),
            toBlock: 'latest'
        });

        dispatchToReducerAction({ type: ON_NEW_SYNDX_CONTRACT_EVENTS, payload: pastEvents });
    }

    // Watch network blocktime

    const fetchNetworkBlockTime = async () => {
        
        try {

            const block = await viemClient.getBlock({
                blockTag: 'latest' 
            });
  
            setNetworkNow(Number(block.timestamp));

        } catch (error) {

            console.error("Error in async task", error);

        } finally {

            setIsAsyncTaskRunning(false);
        }
    }

    useEffect(() => {

        const interval = setInterval(() => {

            if (!isAsyncTaskRunning) {

                setIsAsyncTaskRunning(true);
                if (isConnected) fetchNetworkBlockTime();
            }

        }, 15000);

        if (reducerState.selectedCoproperty == null) { 
            clearInterval(interval);
        };

        if (!isConnected) {
            clearInterval(interval);
            setNetworkNow(0);
        }

        return () =>  { 
            clearInterval(interval);
        }

    }, [isAsyncTaskRunning, reducerState.selectedCoproperty, isConnected]); 


    // Component lifecycle

    useEffect(() => {

        if (reducerState.selectedCoproperty != null) {

            fetchCopropertySyndic(reducerState.selectedCoproperty);
        }

    }, [reducerState.selectedCoproperty]);

    useEffect(() => {

        checkUser();

        if (isConnected) { 

            fetchSyndxContractOwner();
            fetchPastContractEvents();

            const unwatch = watchContractEvent({
                abi: backend.contracts.syndx.abi,
                address: backend.contracts.syndx.address,
                eventName: 'allEvents',
                }, (newEvents) => dispatchToReducerAction({ type: ON_NEW_SYNDX_CONTRACT_EVENTS, payload: newEvents })
            );

            setUnwatchEvents(() => unwatch);
        }

        if (!isConnected) {

            if (unwatchEvents != null) unwatchEvents();
        }

    }, [isConnected, address]);

    // JSX

    return (

        <SyndxContext.Provider value={{
            userAddress                    : reducerState.userAddress,
            isUserSyndxOwner               : reducerState.isUserSyndxOwner,
            isUserConnected                : reducerState.isUserConnected,
            coproperties                   : reducerState.coproperties,
            selectedCoproperty             : reducerState.selectedCoproperty,
            selectedCopropertySyndic       : reducerState.selectedCopropertySyndic,
            isUserSelectedCopropertySyndic : reducerState.isUserSelectedCopropertySyndic,
            networkNow                     : networkNow,
            setSelectedCoproperty          : setSelectedCoproperty
        }}>
            { children }
        </SyndxContext.Provider>

    )
};

export { SyndxContextProvider }