// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Chainlink imports
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

// Common imports
import "../_common/SDX.sol";
import "../_common/constants.sol";
import "../_common/errors/syndxVRF.sol";

// Contracts imports
import "../assembly/IGeneralAssembly.sol";

contract SyndxVRF is VRFConsumerBaseV2 {

    VRFCoordinatorV2Interface private COORDINATOR;

    // Chainlink subscription ID
    uint64 public chainlinkVrfSubscriptionID;

    // The suscription owner of the chainlink VRF account
    address private subscriptionOwner;

    // Keep tracks of each consumer request to ensure there will be one request per consumer
    mapping(address => SDX.ConsumerRequest) internal consumerRequests;

    // Keep tracks of the random words of each consumer request
    mapping(uint256 => SDX.ConsumerResponse) internal consumerRequestResponses;

    event RandomWordsRequested(uint256 requestId);
    event RandomWordsFulfilled(uint256 requestId);

    // The chainlink VRF subscription is owned by the syndx contract owner
    constructor(address _chainlinkVrfCoordinator, uint64 _chainlinkVrfSubscriptionID) VRFConsumerBaseV2(_chainlinkVrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_chainlinkVrfCoordinator);
        chainlinkVrfSubscriptionID = _chainlinkVrfSubscriptionID;
        subscriptionOwner = msg.sender;
    }

    // Send a request to chainlink VRF service
    // Assumes the subscription is funded sufficiently
    function requestRandomWords(address _consumer) internal {

        // Will revert if subscription is not set and funded.
        uint256 requestID = COORDINATOR.requestRandomWords(

            CHAINLINK_VRF_GASLANE_KEYHASH,
            chainlinkVrfSubscriptionID,
            CHAINLINK_VRF_REQUEST_CONFIRMATIONS,
            CHAINLINK_VRF_CALLBACK_GAS_LIMIT,
            CHAINLINK_VRF_WORDCOUNT_PER_REQUEST
        );

        // Assign the chainlink VRF requestID to the consumer
        consumerRequests[_consumer].requestID = requestID;
        consumerRequests[_consumer].requestBlockNumber = block.number;

        // Assign the consumer address to the request ID
        consumerRequestResponses[requestID].consumer = _consumer;

        emit RandomWordsRequested(requestID);
    }

    // Callback function used by Chainlink to provide the requested random words
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {

        // Ensure randomWords are really provided
        if (randomWords.length <= 0) revert EmptyChainlinkRandomWords ();

        // Checks if the consumer already gets random words
        uint256[] memory existingWords = consumerRequestResponses[requestId].randomWords;

        // If yes, revert as Syndx only admit one randomness primitives per consumer
        if (existingWords.length > 0) revert RequestAlreadyFullfilled ();

        // If not, store them
        consumerRequestResponses[requestId].randomWords = randomWords;

        emit RandomWordsFulfilled(requestId);

        // Invoke consumer callback function if there is an existing one
        _invokeConsumerCallback(requestId);
    }

    function _invokeConsumerCallback(uint256 requestId) private {

        // Retrieve the consumer address with its requestID
        address consumerAddress = consumerRequestResponses[requestId].consumer;

        // Identify the type of the consumer
        SDX.ContractType consumerType = consumerRequests[consumerAddress].consumerType;

        // If the consumer type is a general assembly contract, we provide the tiebreaker number directly through its dedicated callback function
        if (consumerType == SDX.ContractType.GeneralAssembly) {

            IGeneralAssembly consumer = IGeneralAssembly(consumerAddress);
            uint256[] memory randomWords = consumerRequestResponses[requestId].randomWords;
            uint256 tiebreaker = randomWords[0];
            consumer.fulfillTiebreaker(tiebreaker);
        }
    }
}