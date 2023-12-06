'use client'

import CreateCoproperty from '@/components/syndx/spaces/admin/features/coproperty/create/createCoproperty';

const AdminSpace = ({ coproperty }) => {
    
    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <CreateCoproperty/>

            </div>
        </>

    )
}

export default AdminSpace