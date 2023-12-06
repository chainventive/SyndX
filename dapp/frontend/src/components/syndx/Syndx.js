'use client'

// Components
import Nav from '@/components/syndx/nav/Nav';
import UserSpace from '@/components/syndx/spaces/user/userSpace';
import AdminSpace from '@/components/syndx/spaces/admin/AdminSpace';
import Disconnected from '@/components/syndx/disconnected/Disconnected';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import { CopropertyContextProvider } from '@/app/contexts/coproperty/coproperty.context.jsx';

const Syndx = () => {

    const { isUserSyndxOwner, isUserConnected, selectedCoproperty, setSelectedCoproperty } = useSyndx();

    return (

        <>

            {
                isUserConnected ? ( 

                    <>
                        <Nav onSelectCoproperty={setSelectedCoproperty} />

                        <CopropertyContextProvider>
                            {
                                isUserSyndxOwner ? <AdminSpace coproperty={selectedCoproperty}/> : <UserSpace />
                            } 
                        </CopropertyContextProvider>

                    </>

                ) : (

                    <Disconnected/>

                )
            }

        </>

    )
}

export default Syndx