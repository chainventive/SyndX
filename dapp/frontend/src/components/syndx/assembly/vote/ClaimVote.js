'use client'

// ReactJS
import { useEffect, useState } from "react";

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';

// Backend
import { backend } from "@/backend";

// Helpers
import { getTimestampDate, formatTimeSpan } from "@/helpers/time/index";

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import useSyndx from "@/app/contexts/syndx/hooks/useSyndx";

const ClaimVote = ({ now, lockup }) => {

    const { userAddress, isUserConnected } = useSyndx();
    const { selectedAssembly } = useCoproperty();

    const [ hasClaimed, setHasClaimed ] = useState(false);
    const [ balance, setBalance ] = useState(0);

    const fetchUserVoteDetails = async () => {

        try {

            const balance = await readContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: 'balanceOf',
                args: [userAddress]
            });

            const hasClaimed = await readContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: 'hasClaimed',
                args: [userAddress]
            });
    
            setHasClaimed(hasClaimed);
            setBalance(balance);
          
        } catch (err) {
    
            if (err instanceof ContractFunctionExecutionError) { 
                console.log(err);
                return;
            }
    
            console.log(err);

        }
    }

    const claimVoteTokens = async () => {

        try {

            const { request } = await prepareWriteContract({
                address: selectedAssembly.voteToken,
                abi: backend.contracts.voteToken.abi,
                functionName: "claimVoteTokens",
            });
    
            const { txHash } = await writeContract(request);
            await waitForTransaction({hash: txHash});

            return txHash;
          
        } catch (err) {
    
            if (err instanceof ContractFunctionExecutionError) { 
                console.log(err);
                return;
            }
    
            console.log(err);

        } finally {

            await fetchUserVoteDetails();
        }
    
    };

    useEffect(() => {
        if (isUserConnected) fetchUserVoteDetails();
    }, [isUserConnected, userAddress]);

    useEffect(() => {
        if (isUserConnected) fetchUserVoteDetails();
    }, []);

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h4>VOTING POWER</h4>

                <p>Vote tokens balance: { `${ balance }` }</p>

                {
                    !hasClaimed && now < lockup && (
                        <>
                            <button onClick={ () => claimVoteTokens() }>claim</button>
                            <p>until { getTimestampDate(lockup) } (remaining: { formatTimeSpan(now, lockup) })</p>
                        </>
                    )
                }

            </div>
        </>

    )
}

export default ClaimVote  