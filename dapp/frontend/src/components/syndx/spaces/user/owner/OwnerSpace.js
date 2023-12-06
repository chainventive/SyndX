'use client'

const OwnerSpace = ({ coproperty }) => {

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                OWNER SPACE

                <p>You selected: { coproperty.name } - { coproperty.contract }</p>

            </div>
        </>

    )
}

export default OwnerSpace