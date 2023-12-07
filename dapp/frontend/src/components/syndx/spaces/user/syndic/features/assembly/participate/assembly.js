'use client'

// Helpers
import { getTimestampDate } from "@/helpers/time/index";

// Components
import CreateResolution from "@/components/syndx/spaces/user/syndic/features/assembly/create/createResolution";

// Contexts
import useCoproperty from '@/app/contexts/coproperty/hook/useCoproperty';
import useAssembly from '@/app/contexts/assembly/hook/useAssembly';

const Assembly = () => {

    const { selectedAssembly } = useCoproperty();
    const { tiebreaker, created, lockup, voteEnd, resolutions, amendments } = useAssembly();

    return (

        <>
            <div style={{ border: '1px solid black', padding: '1rem', margin: '1rem' }}>

                <h3>ASSEMBLY</h3>

                <p>Contract: { selectedAssembly.contract }</p>
                <p>Vote Token: { selectedAssembly.voteToken }</p>
                <p>tiebreaker: { `${tiebreaker}` }</p>
                <p>created: { getTimestampDate(created) }</p>
                <p>lockup: { getTimestampDate(lockup) }</p>
                <p>vote start: { getTimestampDate(selectedAssembly.voteStartTime) }</p>
                <p>vote end: { getTimestampDate(voteEnd) }</p>

                <br></br>

                <h4>RESOLUTIONS</h4>

                <CreateResolution assembly={ selectedAssembly }/>
                
                {
                    resolutions.length > 0 ? (

                        resolutions.map((resolution, index) => (

                            <div style={{ margin: '0.5rem' }} key={index}>

                                <p>Title: { resolution.tiltle }</p>
                                <p>Description: { resolution.tiltle }</p>
                                <p>Author: { resolution.author }</p>

                                {
                                    amendments.length > 0 && (
                                        
                                        amendments.map(amendment => (

                                            <div>
                                                <p>Description: { amendment.description }</p>
                                                <p>Author: { amendment.author }</p>
                                            </div>
                                        ))
                                    )
                                }

                                <button>amend</button>
                                <button>vote</button>

                            </div>
                        ))

                    ) : (

                        <p>No resolution submitted yet</p>

                    )
                }

            </div>
        </>

    )
}

export default Assembly