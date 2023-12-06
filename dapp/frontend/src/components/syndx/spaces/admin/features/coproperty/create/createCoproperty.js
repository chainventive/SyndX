'use client'

//ReactJS
import { useState } from 'react'

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core';

// Backend
import { backend } from "@/backend";

const CreateCoproperty = () => {

    const [copropertyName, setCopropertyName] = useState('');
    const [copropertyTokenISO, setCopropertyTokenISO] = useState('');
    const [copropertySyndicAddress, setCopropertySyndicAddress] = useState('');

    const createCoproperty = async () => {

        try {
    
          const { request } = await prepareWriteContract({
            address: backend.contracts.syndx.address,
            abi: backend.contracts.syndx.abi,
            functionName: "createCoproperty",
            args: [copropertyName, copropertyTokenISO, copropertySyndicAddress]
          });
    
          const { txHash } = await writeContract(request);
          await waitForTransaction({hash: txHash});
    
          setCopropertyName('');
          setCopropertyTokenISO('');
          setCopropertySyndicAddress('');
    
          return txHash;
          
        } catch (err) {
    
          if( err instanceof ContractFunctionExecutionError) { 
            console.log(err.cause.reason);
            return;
          }
    
          console.log(err);
    
        }
    
    };

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h3>REGISTER A NEW COPROPERTY</h3>

                <input style={{ marginRight: '0.5rem' }} type="text" value={copropertyName} onChange={e => setCopropertyName(e.target.value)} placeholder="coproperty name"></input>
                <input style={{ marginRight: '0.5rem' }} type="text" value={copropertyTokenISO} onChange={e => setCopropertyTokenISO(e.target.value)} placeholder="token iso"></input>
                <input style={{ marginRight: '0.5rem' }} type="text" value={copropertySyndicAddress} onChange={e => setCopropertySyndicAddress(e.target.value)} placeholder="syndic address"></input>

                <br></br>
                <br></br>

                <button onClick={ () => createCoproperty() }>register</button>

            </div>
        </>

    )
}

export default CreateCoproperty