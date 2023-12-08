'use client'

const { createContext } = require("react");

// ReactJS
import { useEffect, useReducer } from 'react';

// Wagmi
import { readContract, watchContractEvent } from '@wagmi/core';
import { usePublicClient } from 'wagmi';

// Backend
import { backend } from '@/backend/index';

// Helpers
import { easeContractEvent } from '@/helpers/transformer/index';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

import assemblyContextReducer, {
    ON_ASSEMBLY_DETAILS_FETCHED,
    ON_NEW_ASSEMBLY_CONTRACT_EVENTS,
    ON_NEW_ASSEMBLY_RESOLUTIONS,
    ON_NEW_ASSEMBLY_AMENDMENTS,
} from '@/app/contexts/assembly/assembly.reducer';

const AssemblyContext = createContext(null);

export default AssemblyContext;

const AssemblyContextProvider = ({ children }) => {

    const viemClient = usePublicClient();

    // hooks

    const { userAddress } = useSyndx();
    const { selectedAssembly } = useCoproperty();

    // context state
    
    const [ reducerState, dispatchToReducerAction ] = useReducer(assemblyContextReducer, {
        syndic: null,
        isSyndicUser: false,
        tiebreaker: 0,
        tiebreakerRequested: false,
        created: null,
        lockup: null,
        voteEnd: null,
        resolutions: [],
        amendments: [],
        votes: [],
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

    const fetchNewResolutionsFromEvents = async (events) => {

        let fetched = [];

        const resolutionEvents = events.filter(event => event.name == 'ResolutionCreated');

        for (let resolutionEvent of resolutionEvents) {

            const id = Number(resolutionEvent.args.id);
            
            const maxKnownId = reducerState.resolutions.length - 1;
            
            if (id > maxKnownId) {
                
                const resolution = await readContract({
                    address: selectedAssembly.contract,
                    abi: backend.contracts.generalAssembly.abi,
                    functionName: 'getResolution',
                    args: [id]
                });

                resolution["id"] = id;

                fetched.push(resolution);
            }
        }

        return fetched;
    }

    const fetchNewAmendmentsFromEvents = async (events) => {

        let fetched = [];

        const amendmentEvents = events.filter(event => event.name == 'AmendmentCreated');

        for (let amendmentEvent of amendmentEvents) {

            const id = Number(amendmentEvent.args.id);
            
            const maxKnownId = reducerState.amendments.length - 1;
            
            if (id > maxKnownId) {
                
                const amendment = await readContract({
                    address: selectedAssembly.contract,
                    abi: backend.contracts.generalAssembly.abi,
                    functionName: 'getAmendment',
                    args: [id]
                });

                amendment["id"] = id;

                fetched.push(amendment);
            }
        }

        return fetched;
    }

    const fetchPastContractEvents = async () => {

        let pastEvents = await viemClient.getContractEvents({
            address: selectedAssembly.contract,
            abi: backend.contracts.generalAssembly.abi,
            fromBlock: BigInt(backend.blocknumber),
            toBlock: 'latest'
        });

        pastEvents = easeContractEvent(pastEvents);

        const newResolutions = await fetchNewResolutionsFromEvents(pastEvents);
        dispatchToReducerAction({ type: ON_NEW_ASSEMBLY_RESOLUTIONS, payload: newResolutions });

        const newAmendments  = await fetchNewAmendmentsFromEvents(pastEvents);
        dispatchToReducerAction({ type: ON_NEW_ASSEMBLY_AMENDMENTS, payload: newAmendments });

        pastEvents = pastEvents.filter(event => event.name != 'ResolutionCreated' && event.name != 'AmendmentCreated');
        dispatchToReducerAction({ type: ON_NEW_ASSEMBLY_CONTRACT_EVENTS, payload: pastEvents });
    }

    const eventWatcher = async () => {

        const watcher = watchContractEvent({
            abi: backend.contracts.generalAssembly.abi,
            address: selectedAssembly.contract,
            eventName: 'allEvents',

            }, async (newEvents) => { 

                newEvents = easeContractEvent(newEvents);

                const newResolutions = await fetchNewResolutionsFromEvents(newEvents);
                dispatchToReducerAction({ type: ON_NEW_ASSEMBLY_RESOLUTIONS, payload: newResolutions });

                const newAmendments  = await fetchNewAmendmentsFromEvents(newEvents);
                dispatchToReducerAction({ type: ON_NEW_ASSEMBLY_AMENDMENTS, payload: newAmendments });

                newEvents = newEvents.filter(event => event.name != 'ResolutionCreated' && event.name != 'AmendmentCreated');
                dispatchToReducerAction({ type: ON_NEW_ASSEMBLY_CONTRACT_EVENTS, payload: newEvents });
            }
        );
        
        return () => watcher.stop();
    }
    
    // Component lifecycle

    useEffect(() => {
        
        if (reducerState.syndic != null) { 
            fetchPastContractEvents();
            eventWatcher();
        }

    }, [reducerState.created]);

    useEffect(() => {
        
        if (selectedAssembly != null) { 
            fetchAssemblyDetails();
        }

    }, [selectedAssembly]);

    // JSX

    return (

        <AssemblyContext.Provider value={{
            syndic       : reducerState.syndic,
            isSyndicUser : reducerState.syndic === userAddress,
            tiebreaker   : reducerState.tiebreaker,
            created      : reducerState.created,
            lockup       : reducerState.lockup,
            voteEnd      : reducerState.voteEnd,
            resolutions  : reducerState.resolutions,
            amendments   : reducerState.amendments,
            votes        : reducerState.votes,
            tiebreakerRequested : reducerState.tiebreakerRequested,
        }}>
            { children }
        </AssemblyContext.Provider>

    )
};

export { AssemblyContextProvider }