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
    ON_TOKEN_DETAILS_FETCHED,
    ON_COPROPERTY_COUNT_FETCHED,
    ON_COPROPERTY_ASSEMBLY_SELECTED,
    ON_COPROPERTY_ASSEMBLIES_FETCHED,
    ON_NEW_COPROPERTY_CONTRACT_EVENTS,
    ON_COPROPERTY_TOKEN_ADDRESS_FETCHED,
} from '@/app/contexts/coproperty/coproperty.reducer';

const CopropertyContext = createContext(null);

export default CopropertyContext;

const CopropertyContextProvider = ({ children }) => {

    const viemClient = usePublicClient();

    // hooks

    const { selectedCoproperty, selectedCopropertySyndic } = useSyndx();

    // context state
    
    const [ reducerState, dispatchToReducerAction ] = useReducer(copropertyContextReducer, {
        owners: [],
        tokenName: null,
        tokenSymbol: null,
        tokenTotalSupply: 0,
        distributedTokens: 0,
        tokenContract: null,
        syndicBalance: 0,
        assemblyCount: 0,
        assemblies: [],
        selectedAssembly: null,
    });

    // external setters

    const fetchGovernanceTokenContract = async () => {

        const tokenContract = await readContract({
            address: selectedCoproperty.contract,
            abi: backend.contracts.coproperty.abi,
            functionName: 'governanceToken'
        });

        dispatchToReducerAction({ type: ON_COPROPERTY_TOKEN_ADDRESS_FETCHED, payload: tokenContract });
    }

    const setSelectedAssembly = (assembly) => {

        dispatchToReducerAction({ type: ON_COPROPERTY_ASSEMBLY_SELECTED, payload: assembly });
    }

    // internal functions

    const fetchAssemblies = async () => {

        let assemblies = [];

        for (let i = reducerState.assemblies.length; i < reducerState.assemblyCount; i++) {

            const assemblyContract = await readContract({
                address: selectedCoproperty.contract,
                abi: backend.contracts.coproperty.abi,
                functionName: 'generalAssemblies',
                args: [i]
            });

            const voteStartTime = await readContract({
                address: assemblyContract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: 'voteStart'
            });

            const voteTokenContract = await readContract({
                address: assemblyContract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: 'voteToken'
            });

            assemblies.push({ contract: assemblyContract, voteStartTime: Number(voteStartTime), voteToken: voteTokenContract });
        }

        dispatchToReducerAction({ type: ON_COPROPERTY_ASSEMBLIES_FETCHED, payload: assemblies });
    }

    const fetchAssemblyCount = async () => {

        const count = await readContract({
            address: selectedCoproperty.contract,
            abi: backend.contracts.coproperty.abi,
            functionName: 'getGeneralAssemblyCount'
        });

        dispatchToReducerAction({ type: ON_COPROPERTY_COUNT_FETCHED, payload: count });
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

        let syndicBalance = 0;
        if (selectedCopropertySyndic != null) {

            syndicBalance = await readContract({
                address: reducerState.tokenContract,
                abi: backend.contracts.governanceToken.abi,
                functionName: 'balanceOf',
                args: [`${selectedCopropertySyndic}`]
            });
        }

        dispatchToReducerAction({ type: ON_TOKEN_DETAILS_FETCHED, payload: { tokenName, tokenSymbol, tokenTotalSupply, syndicBalance } });
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
            fetchPastContractEvents();
            fetchTokenDetails();
            eventWatcher();
        }

    }, [reducerState.tokenContract]);

    useEffect(() => {

        if (reducerState.assemblies.length < reducerState.assemblyCount) { 
            fetchAssemblies();
        }

    }, [reducerState.assemblyCount]);

    useEffect(() => {

        if (selectedCoproperty != null) { 
            fetchGovernanceTokenContract();
            fetchAssemblyCount();
        }

    }, [selectedCoproperty]);

    useEffect(() => {

        if (selectedCoproperty != null) {
            fetchGovernanceTokenContract();
            fetchAssemblyCount();
        }

    }, []);

    // JSX

    return (

        <CopropertyContext.Provider value={{
            owners              : reducerState.owners,
            tokenName           : reducerState.tokenName,
            tokenSymbol         : reducerState.tokenSymbol,
            tokenTotalSupply    : reducerState.tokenTotalSupply,
            tokenContract       : reducerState.tokenContract,
            distributedTokens   : reducerState.distributedTokens,
            syndicBalance       : reducerState.syndicBalance,
            assemblyCount       : reducerState.assemblyCount,
            assemblies          : reducerState.assemblies,
            selectedAssembly    : reducerState.selectedAssembly,
            fetchAssemblyCount  : fetchAssemblyCount,
            setSelectedAssembly : setSelectedAssembly,
        }}>
            { children }
        </CopropertyContext.Provider>

    )
};

export { CopropertyContextProvider }