'use client'

// Helpers
import { getTimestampDate, getDateTimestamp } from "@/helpers/time/index";

// Components
import CreateResolution from "@/components/syndx/assembly/createResolution";
import Resolution from "@/components/syndx/assembly/resolution/Resolution";
import ClaimVote from "@/components/syndx/assembly/vote/ClaimVote";

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import useAssembly from '@/app/contexts/assembly/hook/useAssembly';

// ReactJS
import { useEffect, useState } from "react";
import VoteToken from "./vote/VoteToken";

const   Assembly = () => {

    const { selectedAssembly } = useCoproperty();
    const { tiebreaker, created, lockup, voteEnd, resolutions, amendments, isSyndicUser } = useAssembly();

    const [ now, setNow ] = useState(0);

    const tiebreak = async () => {

        try {

            const { request } = await prepareWriteContract({
                address: selectedAssembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: "requestTiebreaker",
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
    
        }
    }

    useEffect(() => {
        setNow(getDateTimestamp(Date.now())); 
        setInterval(() => setNow( getDateTimestamp(Date.now()) ), 5000);
    }, []);

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h3>ASSEMBLY</h3>

                <p>Date: { getTimestampDate(now) }</p>

                <p>Contract: { selectedAssembly.contract }</p>
                <p>Vote Token: { selectedAssembly.voteToken }</p>
                <p>tiebreaker: { `${tiebreaker}` }</p>
                <p>created: { getTimestampDate(created) }</p>
                <p>lockup: { getTimestampDate(lockup) }</p>
                <p>vote start: { getTimestampDate(selectedAssembly.voteStartTime) }</p>
                <p>vote end: { getTimestampDate(voteEnd) }</p>

                { 
                    now > voteEnd && tiebreaker <= 0 && (
                        <button onClick={ () => tiebreak() }>tiebreak</button>
                    )
                }

                <br></br>

                
                {
                    isSyndicUser ? (

                        <VoteToken/>

                    ) : (

                        <ClaimVote now={now} lockup={lockup}/>
                    )
                }
                

                <br></br>

                <h4>RESOLUTIONS</h4>

                {
                    now < lockup && (
                        <CreateResolution assembly={ selectedAssembly }/>
                    )
                }
                
                {
                    resolutions.length > 0 ? (

                        resolutions.map((resolution, index) => (

                            <Resolution key={index} isSyndicUser={ isSyndicUser } now={ now } assembly={ selectedAssembly } lockup={ lockup } resolution={ resolution } amendments={ amendments.filter(amendment => amendment.resolutionID == resolution.id) }/>
                        ))

                    ) : (

                        <p>No resolution submitted yet</p>

                    )
                }

            </div>
        </>

    )
}

export default Assembly  