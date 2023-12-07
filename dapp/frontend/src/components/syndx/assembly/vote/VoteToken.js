'use client'

// ReactJS
import { useEffect, useState } from "react";

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core';

// Backend
import { backend } from "@/backend";

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import useAssembly from '@/app/contexts/assembly/hook/useAssembly';
import useSyndx from "@/app/contexts/syndx/hooks/useSyndx";

const VoteToken = () => {

    const { userAddress, isUserConnected } = useSyndx();
    const { selectedAssembly } = useCoproperty();

    const [ burnAddress,  setBurnAddress  ] = useState('');
    const [ totalClaimed, setTotalClaimed ] = useState(0);
    const [ tokenSymbol,  setTokenSymbol  ] = useState('');
    const [ tokenName,    setTokenName    ] = useState('');

    const fetchVoteTokenDetails = async () => {

        try {

            const totalSupply = await readContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: 'totalSupply'
            });

            setTotalClaimed(Number(totalSupply));

            const name = await readContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: 'name',
            });

            setTokenSymbol(name);

            const symbol = await readContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: 'symbol',
            });

            setTokenName(symbol);
          
        } catch (err) {
    
            if (err instanceof ContractFunctionExecutionError) { 
                console.log(err);
                return;
            }
    
            console.log(err);

        }
    }

    const burnLostTokens = async () => {
        setBurnAddress('');
        return;
    }

    useEffect(() => {
        if (isUserConnected) fetchVoteTokenDetails();
    }, [isUserConnected, userAddress]);

    useEffect(() => {
        if (isUserConnected) fetchVoteTokenDetails();
    }, []);

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h4>VOTE TOKEN</h4>

                <p>Contract: { selectedAssembly.voteToken }</p>
                <p>Total Claimed: { `${totalClaimed}` } / 10000</p>
                <p>Token Name: { `${tokenSymbol}` }</p>
                <p>Total Symbol: { `${tokenName}` }</p>

                <b></b>

                
                <input style={{ marginRight: '0.5rem' }} type="text" value={burnAddress} onChange={e => setBurnAddress(e.target.value)} placeholder="address"></input>
                <button onClick={ () => burnLostTokens() }>burn lost tokens</button>

            </div>
        </>

    )
}

export default VoteToken  