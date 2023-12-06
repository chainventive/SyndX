require('dotenv').config();

const deployOutput = require('@/backend/outputs/deployOutput');

export const backend = {

    network: deployOutput.network,

    blocknumber: deployOutput.blocknumber,

    contracts: {

        syndx: {
            abi: deployOutput.contracts.syndx.abi,
            address: deployOutput.contracts.syndx.address,
        },

        tokenFactory: {
            abi: deployOutput.contracts.syndx.abi,
            address: deployOutput.contracts.tokenFactory.address,
        },
    }
}