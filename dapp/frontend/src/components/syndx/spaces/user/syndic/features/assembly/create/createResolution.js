'use client'

//ReactJS
import { useState } from 'react'

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core';

// Backend
import { backend } from "@/backend";

const CreateResolution = ({ assembly }) => {

    const [ title, setTitle ] = useState('');
    const [ description, setDescription ] = useState('');

    const createResolution = async () => {

        try {

            const { request } = await prepareWriteContract({
                address: assembly.contract,
                abi: backend.contracts.generalAssembly.abi,
                functionName: "createResolution",
                args: [title, description]
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
            
            setTitle('');
            setDescription('');
        }
    
    };

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h4>CREATE RESOLUTION</h4>

                <input style={{ marginRight: '0.5rem' }} type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="title"></input>
                <input style={{ marginRight: '0.5rem' }} type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="description"></input>

                <br></br>
                <br></br>

                <button onClick={ () => createResolution() }>create</button>

            </div>
        </>

    )
}

export default CreateResolution