'use client'

// Components
import Nav from '@/components/syndx/nav/Nav';
import OwnerSpace from '@/components/syndx/spaces/users/OwnerSpace';
import AdminSpace from '@/components/syndx/spaces/AdminSpace';
import SyndicSpace from '@/components/syndx/spaces/users/SyndicSpace';
import Disconnected from '@/components/syndx/disconnected/Disconnected';

// Contexts
import useSyndx from '@/app/contexts/syndx/hooks/useSyndx';
import { CopropertyContextProvider } from '@/app/contexts/coproperty/coproperty.context.jsx';
import UserSpace from './spaces/UserSpace';

const Syndx = () => {

    const { isUserSyndxOwner, isUserConnected, selectedCoproperty, setSelectedCoproperty, isUserSelectedCopropertySyndic } = useSyndx();

    return (

        <>

            {
                isUserConnected ? ( 

                    <>
                        <Nav onSelectCoproperty={setSelectedCoproperty} />

                        <CopropertyContextProvider>

                            {
                                isUserSyndxOwner ? 
                                (
                                    <AdminSpace coproperty={selectedCoproperty}/>

                                ) : (

                                    <UserSpace />
                                )
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