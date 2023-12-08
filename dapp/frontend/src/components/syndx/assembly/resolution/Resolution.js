'use client'

//ReactJS
import { useEffect, useState } from 'react'

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core';

// Backend
import { backend } from "@/backend";

const Resolution = ({ assembly, resolution, amendments, isSyndicUser, now, lockup, voteEnd }) => {

    const [ description, setDescription ] = useState('');
    const [ voteType, setVoteType ] = useState(0);
    const [ voteResult, setVoteResult ] = useState(null);

    const getVoteTypeName = (value) => {

        switch (value) {
            case 1:
                return "Unanimity";
            case 2:
                return "Simple Majority";
            case 3:
                return "Absolute Majority";
            case 4:
                return "Double Majority";
            default:
                return "Undefined";
        }
    }

    const createAmendment = async () => {

        try {

            const { request } = await prepareWriteContract({
                address: assembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: "createAmendment",
                args: [resolution.id, description]
            });
    
            const { txHash } = await writeContract(request);
            await waitForTransaction({hash: txHash});

            setDescription('');

            return txHash;
          
        } catch (err) {
    
            if (err instanceof ContractFunctionExecutionError) { 
                console.log(err);
                return;
            }
    
            console.log(err);
        }
    };

    const setResolutionVoteType = async () => {

        if (voteType <= 0) return;

        try {

            const { request } = await prepareWriteContract({
                address: assembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: "setResolutionVoteType",
                args: [resolution.id, voteType]
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

    const vote = async (ballot) => {

        if (voteType <= 0) return;

        try {

            const { request } = await prepareWriteContract({
                address: assembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: "vote",
                args: [resolution.id, ballot]
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

    const getVoteResult = async () => {

        try {

            const voteResult = await readContract({
                address: assembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: 'getVoteResult',
                args: [resolution.id]
            });

            setVoteResult(voteResult);
          
        } catch (err) {
    
            if (err instanceof ContractFunctionExecutionError) { 
                console.log(err);
                return;
            }
    
            console.log(err);

        }
    }

    useEffect(() => {
        
        setVoteType(resolution.voteType);

    }, []);

    return (

        <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

            <p>Title: { resolution.title }</p>
            <p>Description: { resolution.description }</p>
            <p>Author: { resolution.author }</p>
            <p>Vote Type: { getVoteTypeName(resolution.voteType) }</p>

            {
                amendments.length > 0 && (
                                        
                    amendments.map(amendment => (

                        <div key={ amendment.id } style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>
                            <p>Description: { amendment.description }</p>
                            <p>Author: { amendment.author }</p>
                        </div>
                    ))
                )
            }

            {
                now < lockup && (
                    <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>
                        <input style={{ marginRight: '0.5rem' }} type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="description"></input>
                        <button onClick={ () => createAmendment() }>amend</button>
                    </div>
                )
            }

            {
                isSyndicUser && resolution.voteType <= 0 && now < lockup && (
                    <>
                        <select value={voteType} onChange={ (e) => setVoteType(e.target.value) }>
                            <option value="0">Undefined</option>
                            <option value="1">Unanimity</option>
                            <option value="2">Simple Majority</option>
                            <option value="3">Absolute Majority</option>
                            <option value="4">Double Majority</option>
                        </select>
                        <button onClick={ () => setResolutionVoteType() }>set vote type</button>
                    </>
                )
            }

            {
                !isSyndicUser && now > assembly.voteStartTime && now <= voteEnd &&
                (   
                    <>
                        <button onClick={ () => vote(false) }>no vote</button>
                        <button onClick={ () => vote(true)  }>yes vote</button>
                    </>
                )
            }

            {
                now > voteEnd && 
                (
                    voteResult == null ? (

                        <button onClick={ () => getVoteResult() }>result</button>

                    ) : (

                        <>
                            <p>Yes Shares: { voteResult.yesShares }</p>
                            <p>No Shares: { voteResult.noShares }</p>
                            <p>Yes Count: { voteResult.yesCount }</p>
                            <p>No Count: { voteResult.noCount }</p>
                            <p>Tiebreaker: { Number(voteResult.tiebreaker) <= 0 ? '-' : Number(voteResult.tiebreaker) }</p>
                            <p>Equality: { voteResult.equality ? 'yes' : 'no' }</p>
                            <p>Approved: { voteResult.approved ? 'yes' : 'no' }</p>
                        </>
                    )
                )
            }
            
        </div>

    )
}

export default Resolution