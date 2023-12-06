require('dotenv').config();

import syndxArtifact from "../../../backend/artifacts/contracts/Syndx.sol/Syndx.json";
import tokenFactoryArtifact from "../../../backend/artifacts/contracts/tokens/TokenFactory.sol/TokenFactory.json";

const deployOutput = require('@/backend/outputs/deployOutput');


export const backend = {

    network: deployOutput.network,

    blocknumber: deployOutput.blocknumber,

    contracts: {

        syndx: {
            abi: syndxArtifact.abi,
            address: deployOutput.contracts.syndx.address,
        },

        tokenFactory: {
            abi: tokenFactoryArtifact.abi,
            address: deployOutput.contracts.tokenFactory.address,
        },
    }
}