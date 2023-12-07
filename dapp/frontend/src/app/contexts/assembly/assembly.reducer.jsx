export const ON_ASSEMBLY_DETAILS_FETCHED = 'assembly/details/fetched';

import { easeContractEvent } from '@/helpers/transformer/index';

const assemblyContextReducer = (reducerState, action) => {

    if (action.type == ON_ASSEMBLY_DETAILS_FETCHED) {
        
        return {
            ...reducerState,
            syndic: action.payload.syndic,
            tiebreaker: Number(action.payload.tiebreaker),
            created: Number(action.payload.timeline.created),
            lockup: Number(action.payload.timeline.lockup),
            created: Number(action.payload.timeline.voteEnd),
        }
    }

    return reducerState;
};

export default assemblyContextReducer;