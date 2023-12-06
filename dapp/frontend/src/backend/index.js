require('dotenv').config();

import syndxArtifact from "../../../backend/artifacts/contracts/Syndx.sol/Syndx.json";
import tokenFactoryArtifact from "../../../backend/artifacts/contracts/tokens/TokenFactory.sol/TokenFactory.json";
import copropertyArtifact from "../../../backend/artifacts/contracts/coproperty/Coproperty.sol/Coproperty.json";
import generalAssemblyArtifact from "../../../backend/artifacts/contracts/assembly/GeneralAssembly.sol/GeneralAssembly.json";

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