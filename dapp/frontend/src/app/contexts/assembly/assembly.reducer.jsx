export const ON_ASSEMBLY_DETAILS_FETCHED     = 'assembly/details/fetched';
export const ON_NEW_ASSEMBLY_CONTRACT_EVENTS = 'assembly/events/newbatch';
export const ON_NEW_ASSEMBLY_RESOLUTIONS     = 'assembly/resolutions/newbatch';
export const ON_NEW_ASSEMBLY_AMENDMENTS      = 'assembly/amendments/newbatch';


const assemblyContextReducer = (reducerState, action) => {

    if (action.type == ON_ASSEMBLY_DETAILS_FETCHED) {
        
        const created    = Number(action.payload.timeline.created);
        const lockup     = Number(action.payload.timeline.lockup);
        const voteEnd    = Number(action.payload.timeline.voteEnd);
        const tiebreaker = Number(action.payload.tiebreaker);

        return {
            ...reducerState,
            syndic: action.payload.syndic,
            tiebreaker: tiebreaker,
            created: created,
            lockup : lockup,
            voteEnd: voteEnd,
            resolutions: [],
            amendments: [],
        }
    }

    if (action.type == ON_NEW_ASSEMBLY_RESOLUTIONS) {
        
        let resolutions = reducerState.resolutions;

        for (let resolution of action.payload) {
            if (!resolutions.some(r => r.id === resolution.id)) {
                resolutions.push(resolution); 
            }
        }

        return {
            ...reducerState,
            resolutions: resolutions
        }
    }

    if (action.type == ON_NEW_ASSEMBLY_AMENDMENTS) {
        
        let amendments = reducerState.amendments;

        for (let amendment of action.payload) {
            if (!amendments.some(a => a.id === amendment.id)) {
                amendments.push(amendment);
            }
        }

        return {
            ...reducerState,
            amendments: amendments
        }
    }

    if (action.type == ON_NEW_ASSEMBLY_CONTRACT_EVENTS) {
        
        for (let event of action.payload) {

            if (event.name == 'ResolutionVoteTypeSet') {

                const resolutionId = Number(event.args.id);
                const newVoteType  = Number(event.args.newType);

                const resolutions  = reducerState.resolutions;

                let resolution = resolutions.find(resolution => resolution.id === resolutionId);
                if (resolution) resolution.voteType = newVoteType;

                return {
                    ...reducerState,
                    resolutions: resolutions
                }
            }
            else if (event.name == 'VoteCast') {
    
            }
            else if (event.name == 'TiebreakerRequested') {
    
                return {
                    ...reducerState,
                    tiebreakerRequested: true
                }
            }
            else if (event.name == 'TiebreakerFulfilled') {

                return {
                    ...reducerState,
                    tiebreaker: Number(event.args.tiebreaker)
                }
            }
        }

        return {
            ...reducerState,
        }
    }

    return reducerState;
};

export default assemblyContextReducer;