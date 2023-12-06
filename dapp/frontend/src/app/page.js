"use client"

//ReactJS
import { useState } from 'react'

// RainbowKit
import { ConnectButton } from "@rainbow-me/rainbowkit"

// Viem
import { ContractFunctionExecutionError } from 'viem'

// Wagmi
import { prepareWriteContract, writeContract,waitForTransaction } from '@wagmi/core'

// Backend
import { backend } from "@/backend"

// Contexts
import useSyndx from "@/app/contexts/syndx/hooks/useSyndx";

export default function Home() {

  const { isUserConnected, userAddress, isSyndxAdmin, contractEvents } = useSyndx();

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

    <main>

      <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>
        <ConnectButton />
      </div>

      {
        isUserConnected && isSyndxAdmin && (

          <>

            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

              <h3>CONNECTED USER</h3>

              <p>connected: { isUserConnected ? 'yes' : 'no' }</p>
              <p>user address: { userAddress }</p>
              <p>is syndx admin: { isSyndxAdmin ? 'yes' : 'no' }</p>

            </div>

            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

              <h3>REGISTER A NEW COPROPERTY</h3>

              <p>connected: { isUserConnected ? 'yes' : 'no' }</p>
              <p>user address: { userAddress }</p>
              <p>is syndx admin: { isSyndxAdmin ? 'yes' : 'no' }</p>

              <input style={{ marginRight: '0.5rem' }} type="text" value={copropertyName} onChange={e => setCopropertyName(e.target.value)} placeholder="coproperty name"></input>
              <input style={{ marginRight: '0.5rem' }} type="text" value={copropertyTokenISO} onChange={e => setCopropertyTokenISO(e.target.value)} placeholder="token iso"></input>
              <input style={{ marginRight: '0.5rem' }} type="text" value={copropertySyndicAddress} onChange={e => setCopropertySyndicAddress(e.target.value)} placeholder="syndic address"></input>

              <br></br>
              <br></br>

              <button onClick={ () => createCoproperty() }>register</button>

            </div>

            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

              <h3>REGISTERED COPROPERTIES</h3>

              {
                contractEvents.length > 0 ? (

                  contractEvents.filter(event => event.name == 'CopropertyContractCreated').map(event => {
                    
                    return <p key={ event.index }>{ event.args.copropertyName }</p>

                  })

                ) : (

                  <p>No contract events yet</p>

                )
              }

            </div>

          </>

        )
      }

    </main>
    
  )
}
