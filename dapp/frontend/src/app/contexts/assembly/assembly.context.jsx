'use client'

const { createContext } = require("react");

// ReactJS
import { useEffect, useReducer } from 'react';

// Wagmi
import { readContract, watchContractEvent } from '@wagmi/core';
import { usePublicClient } from 'wagmi';

// Backend
import { backend } from '@/backend/index';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

import assemblyContextReducer, {
    ON_ASSEMBLY_DETAILS_FETCHED
} from '@/app/contexts/assembly/assembly.reducer';

const AssemblyContext = createContext(null);

export default AssemblyContext;

const AssemblyContextProvider = ({ children }) => {

    const viemClient = usePublicClient();

    // hooks

    const { } = useSyndx();
    const { selectedAssembly } = useCoproperty();

    // context state
    
    const [ reducerState, dispatchToReducerAction ] = useReducer(assemblyContextReducer, {
        syndic: null,
        tiebreaker: 0,
        created: null,
        lockup: null,
        voteEnd: null,
        resolutions: [],
        amendments: [],
    });

    // internal functions

    const fetchAssemblyDetails = async () => {

        const syndic = await readContract({
            address: selectedAssembly.contract,
            abi: backend.contracts.generalAssembly.abi,
            functionName: 'syndic'
        });

        const tiebreaker = await readContract({
            address: selectedAssembly.contract,
            abi: backend.contracts.generalAssembly.abi,
            functionName: 'tiebreaker'
        });

        const timeline = await readContract({
            address: selectedAssembly.contract,
            abi: backend.contracts.generalAssembly.abi,
            functionName: 'getTimeline'
        });

        dispatchToReducerAction({ type: ON_ASSEMBLY_DETAILS_FETCHED, payload: { syndic, tiebreaker, timeline } });

    }

    const fetchPastContractEvents = async () => {
    }

    const eventWatcher = async () => {
    }
    
    // Component lifecycle

    useEffect(() => {

        if (selectedAssembly != null) { 
            fetchAssemblyDetails();
        }

    }, [selectedAssembly]);

    useEffect(() => {

        if (selectedAssembly != null) {
            fetchAssemblyDetails();
        }

    }, []);

    // JSX

    return (

        <AssemblyContext.Provider value={{
            syndic      : reducerState.syndic,
            tiebreaker  : reducerState.tiebreaker,
            created     : reducerState.created,
            lockup      : reducerState.lockup,
            voteEnd     : reducerState.voteEnd,
            resolutions : reducerState.resolutions,
            amendments  : reducerState.amendments,
        }}>
            { children }
        </AssemblyContext.Provider>

    )
};

export { AssemblyContextProvider }