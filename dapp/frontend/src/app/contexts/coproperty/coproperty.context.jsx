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

import copropertyContextReducer, {
    ON_NEW_COPROPERTY_CONTRACT_EVENTS,
    ON_COPROPERTY_TOKEN_ADDRESS_FETCHED,
    ON_TOKEN_DETAILS_FETCHED
} from '@/app/contexts/coproperty/coproperty.reducer';

const CopropertyContext = createContext(null);

export default CopropertyContext;

const CopropertyContextProvider = ({ children }) => {

    const viemClient = usePublicClient();

    // hooks

    const { selectedCoproperty } = useSyndx();

    // context state
    
    const [ reducerState, dispatchToReducerAction ] = useReducer(copropertyContextReducer, {
        owners: [],
        tokenName: null,
        tokenSymbol: null,
        tokenTotalSupply: 0,
        distributedTokens: 0,
        tokenContract: null,
    });

    // internal functions

    const fetchGovernanceTokenContract = async () => {

        const tokenContract = await readContract({
            address: selectedCoproperty.contract,
            abi: backend.contracts.coproperty.abi,
            functionName: 'governanceToken'
        });

        dispatchToReducerAction({ type: ON_COPROPERTY_TOKEN_ADDRESS_FETCHED, payload: tokenContract });
    }

    const fetchTokenDetails = async () => {

        const tokenName = await readContract({
            address: reducerState.tokenContract,
            abi: backend.contracts.governanceToken.abi,
            functionName: 'name'
        });

        const tokenSymbol = await readContract({
            address: reducerState.tokenContract,
            abi: backend.contracts.governanceToken.abi,
            functionName: 'symbol'
        });

        const tokenTotalSupply = await readContract({
            address: reducerState.tokenContract,
            abi: backend.contracts.governanceToken.abi,
            functionName: 'totalSupply'
        });

        dispatchToReducerAction({ type: ON_TOKEN_DETAILS_FETCHED, payload: { tokenName, tokenSymbol, tokenTotalSupply } });
    }

    const fetchPastContractEvents = async () => {

        let pastEvents = await viemClient.getContractEvents({
            address: reducerState.tokenContract,
            abi: backend.contracts.governanceToken.abi,
            fromBlock: BigInt(backend.blocknumber),
            toBlock: 'latest'
        });

        dispatchToReducerAction({ type: ON_NEW_COPROPERTY_CONTRACT_EVENTS, payload: pastEvents });
    }

    const eventWatcher = async () => {

        const watcher = watchContractEvent({

            abi: backend.contracts.governanceToken.abi,
            address: reducerState.tokenContract,
            eventName: 'allEvents',

            }, (newEvents) => dispatchToReducerAction({ type: ON_NEW_COPROPERTY_CONTRACT_EVENTS, payload: newEvents })
        );
        
        return () => watcher.stop();
    }
    
    // Component lifecycle

    useEffect(() => {

        if (reducerState.tokenContract != null) {
            fetchTokenDetails();
            fetchPastContractEvents();
            eventWatcher();
        }

    }, [reducerState.tokenContract]);

    useEffect(() => {

        if (selectedCoproperty != null) fetchGovernanceTokenContract();

    }, [selectedCoproperty]);

    useEffect(() => {

        if (selectedCoproperty != null) fetchGovernanceTokenContract();

    }, []);

    // JSX

    return (

        <CopropertyContext.Provider value={{
            owners: reducerState.owners,
            tokenName: reducerState.tokenName,
            tokenSymbol: reducerState.tokenSymbol,
            tokenTotalSupply: reducerState.tokenTotalSupply,
            tokenContract: reducerState.tokenContract,
            distributedTokens: reducerState.distributedTokens,
        }}>
            { children }
        </CopropertyContext.Provider>

    )
};

export { CopropertyContextProvider }