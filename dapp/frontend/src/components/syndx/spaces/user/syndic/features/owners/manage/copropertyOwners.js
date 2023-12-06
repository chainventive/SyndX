'use client'

//ReactJS
import { useState, useEffect } from 'react'

// Viem
import { ContractFunctionExecutionError } from 'viem';

// Wagmi
import { readContract } from '@wagmi/core';
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core';

// Backend
import { backend } from "@/backend";

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';

const CopropertyOwners = () => {

    const { owners, tokenName, tokenSymbol, tokenTotalSupply, distributedTokens, tokenContract } = useCoproperty();

    const removeOwner = async (owner) => {

        try {
    
            const { request } = await prepareWriteContract({
              address: tokenContract,
              abi: backend.contracts.governanceToken.abi,
              functionName: "removePropertyOwner",
              args: [owner.address]
            });
      
            const { txHash } = await writeContract(request);
            await waitForTransaction({hash: txHash});

            return txHash;
            
          } catch (err) {
      
            if( err instanceof ContractFunctionExecutionError) { 
              console.log(err);
              return;
            }
      
            console.log(err);
      
          }

    } 
    
    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h3>GOVERNANCE TOKEN</h3>

                <p>Name : { tokenName }</p>
                <p>Symbol : { tokenSymbol }</p>
                <p>Total Supply: { tokenTotalSupply }</p>
                <p>Distributed: { distributedTokens }</p>
                <p>Contract : { tokenContract }</p>

                <h3>REGISTERED OWNERS</h3>

                {
                    owners.map(owner => (

                        <div key={ owner.address }>
                            <p>{ owner.address } - { owner.shares }</p>
                            <button onClick={ () => removeOwner(owner) }>remove</button>
                        </div>

                    ))
                }

            </div>
        </>

    )
}

export default CopropertyOwners