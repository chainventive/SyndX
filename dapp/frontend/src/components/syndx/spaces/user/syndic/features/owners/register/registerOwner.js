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

const RegisterOwner = () => {

    const { selectedCoproperty } = useSyndx();

    const [ownerAddress, setOwnerAddress] = useState('');
    const [ownerShares, setOwnerShares]   = useState(0);

    const registerOwner = async () => {

        try {

          const governanceToken = await readContract({
            address: selectedCoproperty.contract,
            abi: backend.contracts.coproperty.abi,
            functionName: 'governanceToken'
          });

          const { request } = await prepareWriteContract({
            address: governanceToken,
            abi: backend.contracts.governanceToken.abi,
            functionName: "addPropertyOwner",
            args: [ownerAddress, ownerShares]
          });
    
          const { txHash } = await writeContract(request);
          await waitForTransaction({hash: txHash});
    
          setOwnerAddress('');
          setOwnerShares(0);
    
          return txHash;
          
        } catch (err) {
    
          if( err instanceof ContractFunctionExecutionError) { 
            console.log(err);
            return;
          }
    
          console.log(err);
    
        }
    
    };

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h3>REGISTER OWNER</h3>

                <input style={{ marginRight: '0.5rem' }} type="text" value={ownerAddress} onChange={e => setOwnerAddress(e.target.value)} placeholder="owner address"></input>
                <input style={{ marginRight: '0.5rem' }} type="value" value={ownerShares} onChange={e => setOwnerShares(e.target.value)} placeholder="owner shares"></input>

                <br></br>
                <br></br>

                <button onClick={ () => registerOwner() }>register</button>

            </div>
        </>

    )
}

export default RegisterOwner