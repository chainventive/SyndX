module.exports = {
  "network": "hardhat",
  "blocknumber": 431,
  "contracts": {
    "chainlink": {
      "vrf": {
        "subscriptionId": 1,
        "coordinatorAddress": "0x1eB5C49630E08e95Ba7f139BcF4B9BA171C9a8C7"
      }
    },
    "syndx": {
      "address": "0x6B21b3ae41f818Fc91e322b53f8D0773d31eCB75",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_chainlinkVrfCoordinator",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "_chainlinkVrfSubscriptionID",
              "type": "uint64"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "AddressZeroNotAllowed",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "consumer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "requestId",
              "type": "uint256"
            }
          ],
          "name": "ConsumerRequestAlreadyFulfilled",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "consumer",
              "type": "address"
            }
          ],
          "name": "ConsumerRequestNotFound",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            }
          ],
          "name": "CopropertyAlreadyCreated",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CopropertyNameTooLong",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CopropertyNameTooShort",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "EmptyChainlinkRandomWords",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "have",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "want",
              "type": "address"
            }
          ],
          "name": "OnlyCoordinatorCanFulfill",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "OwnableInvalidOwner",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "OwnableUnauthorizedAccount",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "requestId",
              "type": "uint256"
            }
          ],
          "name": "RandomNumberRequestAlreadyMade",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "currentBlockNumber",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "targetBlockNumber",
              "type": "uint256"
            }
          ],
          "name": "RandomNumberRequestLockupNotEndedYet",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "RequestAlreadyFullfilled",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "consumer",
              "type": "address"
            }
          ],
          "name": "UnauthorizedRandomnessConsumer",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "contractAddress",
              "type": "address"
            }
          ],
          "name": "UnknownCopropertyContract",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "string",
              "name": "copropertyName",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "copropertyContract",
              "type": "address"
            }
          ],
          "name": "CopropertyContractCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "generalAssembly",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "copropertyContract",
              "type": "address"
            }
          ],
          "name": "GeneralAssemblyContractCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "tokenContract",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "copropertyContract",
              "type": "address"
            }
          ],
          "name": "GovernanceTokenContractCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "requestID",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "consumer",
              "type": "address"
            }
          ],
          "name": "RandomNumberRequestReset",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "consumer",
              "type": "address"
            }
          ],
          "name": "RandomNumberRequested",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "requestId",
              "type": "uint256"
            }
          ],
          "name": "RandomWordsFulfilled",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "requestId",
              "type": "uint256"
            }
          ],
          "name": "RandomWordsRequested",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "beforeChange",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "afterChange",
              "type": "address"
            }
          ],
          "name": "TokenFactorySet",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "tokenContract",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "generalAssemblyContract",
              "type": "address"
            }
          ],
          "name": "VoteTokenContractCreated",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "chainlinkVrfSubscriptionID",
          "outputs": [
            {
              "internalType": "uint64",
              "name": "",
              "type": "uint64"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "contracts",
          "outputs": [
            {
              "internalType": "enum SDX.ContractType",
              "name": "",
              "type": "uint8"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "name": "coproperties",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "_tokenISO",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "_syndic",
              "type": "address"
            }
          ],
          "name": "createCoproperty",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_voteStartTime",
              "type": "uint256"
            }
          ],
          "name": "createGeneralAssembly",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_consumer",
              "type": "address"
            }
          ],
          "name": "getConsumerRandomNumberRequest",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "bool",
                  "name": "authorized",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "requestID",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "requestBlockNumber",
                  "type": "uint256"
                },
                {
                  "internalType": "enum SDX.ContractType",
                  "name": "consumerType",
                  "type": "uint8"
                }
              ],
              "internalType": "struct SDX.ConsumerRequest",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "requestId",
              "type": "uint256"
            },
            {
              "internalType": "uint256[]",
              "name": "randomWords",
              "type": "uint256[]"
            }
          ],
          "name": "rawFulfillRandomWords",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "requestRandomNumber",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_consumer",
              "type": "address"
            }
          ],
          "name": "resetRandomNumberRequest",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_address",
              "type": "address"
            }
          ],
          "name": "setTokenFactory",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "tokenFactory",
          "outputs": [
            {
              "internalType": "contract ITokenFactory",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "tokenFactory": {
      "address": "0xa31F4c0eF2935Af25370D9AE275169CCd9793DA3",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_syndx",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "providedAddress",
              "type": "address"
            }
          ],
          "name": "InvalidGovernanceTokenAddress",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "providedAddress",
              "type": "address"
            }
          ],
          "name": "InvalidSyndicAddress",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "providedAddress",
              "type": "address"
            }
          ],
          "name": "InvalidTokenOwnerAddress",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "NotAuthorized",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "OwnableInvalidOwner",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "OwnableUnauthorizedAccount",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "TokenISOTooLong",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "TokenISOTooShort",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_tokenISO",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "_syndic",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_owner",
              "type": "address"
            }
          ],
          "name": "createGovernanceToken",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_tokenISO",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "_generalAssemblyID",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "_syndic",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_governanceToken",
              "type": "address"
            }
          ],
          "name": "createVoteToken",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "syndx",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    }
  }
};