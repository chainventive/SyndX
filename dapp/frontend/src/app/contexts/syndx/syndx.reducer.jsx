export const ON_USER_CHANGE = 'syndx/user/change';
export const ON_NEW_SYNDX_CONTRACT_EVENTS = 'syndx/events/newbatch';
export const ON_SYNDX_CONTRACT_OWNER_FETCHED = 'syndx/owner/fetched';

import { easeContractEvent } from '@/helpers/transformer/index';

const syndxContextReducer = (reducerState, action) => {

    if (action.type == ON_USER_CHANGE) {

        return {
            ...reducerState,
            userAddress: action.payload.address,
            isUserConnected: action.payload.isConnected,
        }
    }

    if (action.type == ON_SYNDX_CONTRACT_OWNER_FETCHED) {

        return {
            ...reducerState,
            isUserSyndxOwner: reducerState.userAddress == action.payload
        }
    }

    if (action.type == ON_NEW_SYNDX_CONTRACT_EVENTS) {

        const events = easeContractEvent(action.payload);

        const createdCopropertyEvents = events.filter(event => event.name == 'CopropertyContractCreated');

        const createdCoproperties = createdCopropertyEvents.map(event => ({
            name: event.args.copropertyName,
            contract: event.args.copropertyContract
        }));

        const coproperties = reducerState.coproperties;

        for (let createdCoproperty of createdCoproperties) {
            if (!coproperties.some(coproperty => coproperty.name == createdCoproperty.name)) {
                coproperties.push(createdCoproperty);
            }
        }

        return {
            ...reducerState,
            coproperties: coproperties,
        }
    }

    return reducerState;
};

export default syndxContextReducer;
