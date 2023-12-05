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

// Helpers
import { formatAddress, copyToClipboard } from "@/helpers/index";

export default function Home() {

  const { isUserConnected, userAddress, isSyndxAdmin } = useSyndx();

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

      await writeContract(request);
      await waitForTransaction({hash: hash});

      setCopropertyName('');

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

      <ConnectButton />

      <p>connected: { isUserConnected ? 'yes' : 'no' }</p>
      <p>user address: { userAddress }</p>
      <p>is syndx admin: { isSyndxAdmin ? 'yes' : 'no' }</p>

      <input type="text" value={copropertyName} onChange={e => setCopropertyName(e.target.value)} placeholder="coproperty name"></input>
      <input type="text" value={copropertyTokenISO} onChange={e => setCopropertyTokenISO(e.target.value)} placeholder="token iso"></input>
      <input type="text" value={copropertySyndicAddress} onChange={e => setCopropertySyndicAddress(e.target.value)} placeholder="syndic address"></input>

      <br></br>

      <button onClick={ () => createCoproperty() }>create coproperty</button>

    </main>
    
  )
}
