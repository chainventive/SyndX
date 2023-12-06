'use client'

//ReactJS
import { useState } from 'react'

// RainbowKit
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';

const Nav = ({ onSelectCoproperty }) => {

    const { coproperties, selectedCoproperty } = useSyndx();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                {
                    coproperties.length > 0 ? (

                    coproperties.map(coproperty => {
                            
                        return <button style={{ color: selectedCoproperty?.name == coproperty.name ? 'blue' : 'black' }} key={ coproperty.name } onClick={ () => onSelectCoproperty(coproperty) }>{ coproperty.name } - { coproperty.contract }</button>

                    })

                    ) : (

                        <p>No registered coproperty</p>

                    )
                }

            </div>
        </>

    )
}

export default Nav