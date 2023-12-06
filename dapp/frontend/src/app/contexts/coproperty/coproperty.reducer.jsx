export const ON_NEW_COPROPERTY_CONTRACT_EVENTS = 'coproperty/events/newbatch';
export const ON_COPROPERTY_TOKEN_ADDRESS_FETCHED = 'coproperty/token/address/fetched';
export const ON_TOKEN_DETAILS_FETCHED = 'coproperty/token/details/fetched';

import { easeContractEvent } from '@/helpers/transformer/index';

const copropertyContextReducer = (reducerState, action) => {

    if (action.type == ON_NEW_COPROPERTY_CONTRACT_EVENTS) {

        const events = easeContractEvent(action.payload);

        const propertyOwnerChangeEvents = events.filter(event => event.name == 'PropertyOwnerAdded' || event.name == 'PropertyOwnerRemoved');

        const propertyOwnerChanges = propertyOwnerChangeEvents.map(event => ({
            address: event.args.propertyOwner,
            shares : Number(event.args.shares),
            removed: event.name == 'PropertyOwnerRemoved'
        }));

        let propertyOwners = reducerState.owners;

        for (let propertyOwnerChange of propertyOwnerChanges) {

            if (propertyOwnerChange.removed) {

                propertyOwners = propertyOwners.filter(owner => owner.address != propertyOwnerChange.address);

            } else {

                if (!propertyOwners.some(owner => owner.address == propertyOwnerChange.address)) {

                    propertyOwners.push({ 
                        address: propertyOwnerChange.address, 
                        shares: propertyOwnerChange.shares 
                    });
                }
            
            }
        }

        const distributedTokens = propertyOwners.reduce((total, owner) => {
            return total + owner.shares
        }, 0);

        return {
            ...reducerState,
            owners: propertyOwners,
            distributedTokens: distributedTokens,
        }
    }

    if (action.type == ON_TOKEN_DETAILS_FETCHED) {

        return {
            ...reducerState,
            tokenName: action.payload.tokenName,
            tokenSymbol: action.payload.tokenSymbol,
            tokenTotalSupply: action.payload.tokenTotalSupply,
            tokenSupply: 10000,
        }
    }

    if (action.type == ON_COPROPERTY_TOKEN_ADDRESS_FETCHED) {

        return {
            ...reducerState,
            tokenContract: action.payload
        }
    }

    return reducerState;
};

export default copropertyContextReducer;