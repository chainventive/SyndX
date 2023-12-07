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

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

const CreateAssembly = () => {

    const { selectedCoproperty } = useSyndx();
    const { fetchAssemblyCount } = useCoproperty();

    const [ date, setDate ] = useState('');

    const createAssembly = async () => {

        try {

            const voteStartDate = Math.floor(new Date(date).getTime() / 1000);
            
            const { request } = await prepareWriteContract({
                address: selectedCoproperty.contract,
                abi: backend.contracts.coproperty.abi,
                functionName: "createGeneralAssembly",
                args: [voteStartDate]
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
            
            setDate('');
            fetchAssemblyCount();
        }
    
    };

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h3>CREATE ASSEMBLY</h3>

                <input type="datetime-local" value={ date } onChange={ (e) => setDate(e.target.value) }/>

                <br></br>
                <br></br>

                <button onClick={ () => createAssembly() }>register</button>

            </div>
        </>

    )
}

export default CreateAssembly