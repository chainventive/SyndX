'use client'

// RainbowKit
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const Header = () => {

    const { userAddress, isUserSyndxOwner, isUserConnected } = useSyndx();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <ConnectButton />

                {
                    isUserConnected && (
                        <>
                            <p>connected: { isUserConnected ? 'yes' : 'no' }</p>
                            <p>user address: { userAddress }</p>
                            <p>is syndx admin: { isUserSyndxOwner ? 'yes' : 'no' }</p>
                        </>
                    )
                }

            </div>
        </>

    )
}

export default Header