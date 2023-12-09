const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

/*** CONSTANTS ***/

const COPROPERTY_NAME = "BATACOFT";
const COPROPERTY_TOKEN_ISO = "BATA";
const COPROPERTY_TOTAL_SUPPLY = 10000;
const GENERAL_ASSEMBLY_LOCKUP_DURATION = 30;
const GENERAL_ASSEMBLY_VOTING_SESSION_DURATION = 240;
const RANDMNESS_REQUEST_BLOCKS_LOCKUP_BEFORE_RETRY = 5;
const GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP  = 300;
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

/*** HELPER FUNCTIONS ***/

const mooveToBlockTimestamp = async (timestamp) => {
    await hre.network.provider.send("evm_setNextBlockTimestamp", [timestamp]);
    await hre.network.provider.send("evm_mine");
}

const getLatestBlockTimestamp = async () => {
    await hre.network.provider.send("evm_mine");
    return (await ethers.provider.getBlock("latest")).timestamp;
}

/*** UNIT TEST ***/

describe("SyndX", function () {

    // ::::::::::: Fixtures ::::::::::: //

    async function deployAndFundVrfCoordinatorMock() {
        
        const [ _admin ] = await ethers.getSigners();

        // Deploy the Chainlink VRF Coordinator Mock

        const BASE_FEE = "100000000000000000";
        const GAS_PRICE_LINK = "1000000000";

        const VRFCoordinatorV2MockFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        const VRFCoordinatorV2Mock = await VRFCoordinatorV2MockFactory.deploy(BASE_FEE, GAS_PRICE_LINK);

        // Create the chainlink VRF subscription

        let transaction = await VRFCoordinatorV2Mock.connect(_admin).createSubscription();
        let transactionReceipt = await transaction.wait(1);

        // Fund the subscription

        const fundAmount = "1000000000000000000";
        const chainlinkVRFSubscriptionID = transactionReceipt.logs[0].args[0];
        await VRFCoordinatorV2Mock.connect(_admin).fundSubscription(chainlinkVRFSubscriptionID, fundAmount);

        return { _admin, VRFCoordinatorV2Mock, chainlinkVRFSubscriptionID };
    }

    async function deploySyndxWithVrfCoordinatorMock() {

        const { _admin, VRFCoordinatorV2Mock, chainlinkVRFSubscriptionID } = await loadFixture(deployAndFundVrfCoordinatorMock);

        // Inject coproperty accounts
        
        const [ , _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes ] = await ethers.getSigners();

        // Chainlink VRF subscription ID

        const chainlinkVrfSubscriptionID = 1;

        // Deploy the Syndx contract

        const syndx = await ethers.deployContract("Syndx", [VRFCoordinatorV2Mock.target, chainlinkVrfSubscriptionID]);
        await syndx.waitForDeployment();

        // Add the Syndx contract as consumer of the chainlink VRF subscription

        transaction = await VRFCoordinatorV2Mock.connect(_admin).addConsumer(chainlinkVRFSubscriptionID, syndx.target);
        transactionReceipt = await transaction.wait(1);

        return { VRFCoordinatorV2Mock, syndx, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes };
    }

    async function deployTokenFactory() {

        const { VRFCoordinatorV2Mock, syndx, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(deploySyndxWithVrfCoordinatorMock);

        // Deploy the TokenFactory contract

        const tokenFactory = await ethers.deployContract("TokenFactory", [syndx.target]);
        await tokenFactory.waitForDeployment();

        return { VRFCoordinatorV2Mock, syndx, tokenFactory, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes };
    }

    async function connectSyndxToTokenFactory() {

        const { VRFCoordinatorV2Mock, syndx, tokenFactory, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(deployTokenFactory);

        // Attach the token factory to the syndx contract

        await syndx.setTokenFactory(tokenFactory.target);

        return { VRFCoordinatorV2Mock, syndx, tokenFactory, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes };
    }

    async function deployCopropertyWithGovernanceToken() {

        const { VRFCoordinatorV2Mock, syndx, tokenFactory, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(connectSyndxToTokenFactory);

        // Deploy a coproperty contrat

        await syndx.createCoproperty(COPROPERTY_NAME, COPROPERTY_TOKEN_ISO, _syndic.address)

        // Retrieve the deployed coproperty contract

        const copropertyContract = await syndx.coproperties(COPROPERTY_NAME);
        const coproperty = await hre.ethers.getContractAt("Coproperty", copropertyContract);

        // Retrieve the coproperty governance token contract

        const governanceTokenContract = await coproperty.governanceToken();
        const governanceToken = await hre.ethers.getContractAt("GovernanceToken", governanceTokenContract);

        return { VRFCoordinatorV2Mock, syndx, tokenFactory, coproperty, governanceToken, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes };
    }

    async function distributeCopropertyGovernanceTokens() {

        const { VRFCoordinatorV2Mock, syndx, coproperty, governanceToken, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(deployCopropertyWithGovernanceToken);

        // Add the property owners and their property shares with the syndic account

        await governanceToken.connect(_syndic).addPropertyOwner(_anigail.address, 2000);
        await governanceToken.connect(_syndic).addPropertyOwner(_bernard.address, 2000);
        await governanceToken.connect(_syndic).addPropertyOwner(_cynthia.address, 2000);
        await governanceToken.connect(_syndic).addPropertyOwner(_dounia.address,  2000);
        await governanceToken.connect(_syndic).addPropertyOwner(_elyes.address,   2000);

        return { VRFCoordinatorV2Mock, syndx, coproperty, governanceToken, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes };
    }

    async function createGeneralAssemblyWithVoteToken() {

        const { VRFCoordinatorV2Mock, syndx, coproperty, governanceToken, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(distributeCopropertyGovernanceTokens);

        // Get latest block timestamp

        const now = await getLatestBlockTimestamp();

        // Calculate a vote start time that fit with lockup duration and minimum amount of time required between no and the beginning of the lockup
        
        const lockupDuration = GENERAL_ASSEMBLY_LOCKUP_DURATION;
        const miniDurationBeforeLockup = GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP;
        const voteStartTime = now + miniDurationBeforeLockup + lockupDuration + 2;

        // Create the general assembly with the calculated vote start time

        await coproperty.connect(_syndic).createGeneralAssembly(voteStartTime);

        // Retrieve the general assembly that was just created from the coproperty contract

        const generalAssemblyContract = await coproperty.getLastestGeneralAssembly();
        const generalAssembly = await hre.ethers.getContractAt("GeneralAssembly", generalAssemblyContract);

        // Retrieve the vote token contract created for the general assembly

        const voteTokenContract = await generalAssembly.voteToken();
        const voteToken = await hre.ethers.getContractAt("VoteToken", voteTokenContract);

        return { VRFCoordinatorV2Mock, syndx, coproperty, governanceToken, generalAssembly, voteStartTime, voteToken, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes };
    }

    async function claimVoteTokensForGeneralAssembly() {

        const { VRFCoordinatorV2Mock, syndx, generalAssembly, voteStartTime, voteToken, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(createGeneralAssemblyWithVoteToken);

        // Claim vote tokens of all property owners

        await voteToken.connect(_anigail).claimVoteTokens();
        await voteToken.connect(_bernard).claimVoteTokens();
        await voteToken.connect(_cynthia).claimVoteTokens();
        await voteToken.connect(_dounia).claimVoteTokens();
        await voteToken.connect(_elyes).claimVoteTokens();

        return { VRFCoordinatorV2Mock, syndx, generalAssembly, voteStartTime, voteToken, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes };
    }

    async function createResolutionsAndAmendmentsInGeneralAssembly() {

        const { VRFCoordinatorV2Mock, syndx, generalAssembly, voteStartTime, voteToken, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(claimVoteTokensForGeneralAssembly);

        // Create resolutions

        const title1 = "Lorem ipsum dolor sit";
        const description1 = "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";
        await generalAssembly.connect(_syndic).createResolution(title1, description1);

        const title2 = "Sed ut perspiciatis unde omnis";
        const description2 = "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet";
        await generalAssembly.connect(_syndic).createResolution(title2, description2);

        const title3 = "Ut enim ad minima veniam";
        const description3 = "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur";
        await generalAssembly.connect(_dounia).createResolution(title3, description3);

        const title4 = "Lorem Ipsum is simply dummy text";
        const description4 = "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s";
        await generalAssembly.connect(_anigail).createResolution(title4, description4);

        // Create amendment on the latest create resolution

        const resolutionCount = await generalAssembly.getResolutionCount();
        const latestResolutionId = Number(resolutionCount) - 1;
        const amendmentDescription = "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit";
        await generalAssembly.connect(_syndic).createAmendment(latestResolutionId, amendmentDescription);

        return { VRFCoordinatorV2Mock, syndx, generalAssembly, voteStartTime, voteToken, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes };
    }

    async function setVoteTypesForGeneralAssemblyResolutions() {

        const { VRFCoordinatorV2Mock, syndx, generalAssembly, voteStartTime, voteToken, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

        const resolutionCount = Number(await generalAssembly.getResolutionCount());

        // An arbitrary algo to dispatch votes amongs resolutions according to their ID

        const getVoteTypeForResolutionID = (resolutionID) => {

            const undefinedVoteType        = 0;
            const unanimityVoteType        = 1;
            const simpleMajorityVoteType   = 2;
            const absoluteMajorityVoteType = 3;
            const doubleMajorityVoteType   = 4;
        
            if (resolutionID == 0) return unanimityVoteType;
            if (resolutionID == 1) return simpleMajorityVoteType;
            if (resolutionID == 2) return absoluteMajorityVoteType;
            if (resolutionID == 3) return doubleMajorityVoteType;
            
            return undefinedVoteType;
        }

        // Dispatch vote types amongs all resolutions in order to have all vote types as test cases

        for(let i = 0; i < resolutionCount; ++i) {

            const newVoteType = getVoteTypeForResolutionID(i);

            await generalAssembly.connect(_syndic).setResolutionVoteType(i, newVoteType);
        }
        
        return { VRFCoordinatorV2Mock, syndx, generalAssembly, voteStartTime, voteToken, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes };
    }

    async function setVoteTypesAndDelegateTokensToAnigailInGeneralAssembly() {

        const { generalAssembly, voteStartTime, voteToken, _anigail, _bernard, _cynthia, _dounia } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

        // Delegate vote tokens to anigail in order to give her the majority of property shares

        await voteToken.connect(_bernard).transfer(_anigail.address, 1000);
        await voteToken.connect(_cynthia).transfer(_anigail.address, 1000);
        await voteToken.connect(_dounia).transfer(_anigail.address, 1000);

        return {  generalAssembly, voteStartTime, _anigail, _bernard, _cynthia, _dounia }
    }
    
    async function completeVotingSessionWithPositiveOutcomeInGeneralAssembly() {

        const { syndx, generalAssembly, voteStartTime, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

        // Move the chain to the vote start time

        await mooveToBlockTimestamp(Number(voteStartTime) + 1);

        // Cast votes

        const resolution0 = 0;
        await generalAssembly.connect(_anigail).vote(resolution0, true);
        await generalAssembly.connect(_bernard).vote(resolution0, true);
        await generalAssembly.connect(_cynthia).vote(resolution0, true);
        await generalAssembly.connect(_dounia).vote(resolution0, true);
        await generalAssembly.connect(_elyes).vote(resolution0, true);

        const resolution1 = 1;
        await generalAssembly.connect(_anigail).vote(resolution1, true);
        await generalAssembly.connect(_bernard).vote(resolution1, false);
        await generalAssembly.connect(_cynthia).vote(resolution1, true);
        await generalAssembly.connect(_elyes).vote(resolution1, true);

        const resolution2 = 2;
        await generalAssembly.connect(_anigail).vote(resolution2, true);
        await generalAssembly.connect(_bernard).vote(resolution2, false);
        await generalAssembly.connect(_dounia).vote(resolution2, true);
        await generalAssembly.connect(_elyes).vote(resolution2, true);

        const resolution3 = 3;
        await generalAssembly.connect(_anigail).vote(resolution3, true);
        await generalAssembly.connect(_bernard).vote(resolution3, true);
        await generalAssembly.connect(_dounia).vote(resolution3, true);
        await generalAssembly.connect(_elyes).vote(resolution3, false);

        // Move the chain to the vote end time

        const voteEndTime = await generalAssembly.voteEnd();
        await mooveToBlockTimestamp(Number(voteEndTime) + 1); 

        return { syndx, generalAssembly, _admin, _syndic, _anigail };
    }

    async function completeVotingSessionWithNegativeOutcomeInGeneralAssembly() {

        const { generalAssembly, voteStartTime, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

        // Move the chain just after the vote start time

        await mooveToBlockTimestamp(Number(voteStartTime) + 1);

        // Cast votes

        const resolution0 = 0;
        await generalAssembly.connect(_anigail).vote(resolution0, false);
        await generalAssembly.connect(_bernard).vote(resolution0, false);
        await generalAssembly.connect(_cynthia).vote(resolution0, false);
        await generalAssembly.connect(_dounia).vote(resolution0, false);
        await generalAssembly.connect(_elyes).vote(resolution0, false);

        const resolution1 = 1;
        await generalAssembly.connect(_anigail).vote(resolution1, false);
        await generalAssembly.connect(_bernard).vote(resolution1, false);
        await generalAssembly.connect(_cynthia).vote(resolution1, false);
        await generalAssembly.connect(_elyes).vote(resolution1, true);

        const resolution2 = 2;
        await generalAssembly.connect(_anigail).vote(resolution2, false);
        await generalAssembly.connect(_bernard).vote(resolution2, false);
        await generalAssembly.connect(_dounia).vote(resolution2, false);
        await generalAssembly.connect(_elyes).vote(resolution2, true);

        const resolution3 = 3;
        await generalAssembly.connect(_anigail).vote(resolution3, false);
        await generalAssembly.connect(_bernard).vote(resolution3, false);
        await generalAssembly.connect(_dounia).vote(resolution3, false);
        await generalAssembly.connect(_elyes).vote(resolution3, true);

        // Move the chain just after the vote end time

        const voteEndTime = await generalAssembly.voteEnd();
        await mooveToBlockTimestamp(Number(voteEndTime) + 1);

        return { generalAssembly };
    }

    async function completeVotingSessionWithNegativeOutcomeDueToInsufficientOwnerParticipation() {

        const { generalAssembly, voteStartTime, _admin, _syndic, _anigail, _bernard, _cynthia, _dounia } = await loadFixture(setVoteTypesAndDelegateTokensToAnigailInGeneralAssembly);

        // Move the chain just after the vote start time

        await mooveToBlockTimestamp(Number(voteStartTime) + 1);

        // Cast votes

        const resolution3 = 3;
        await generalAssembly.connect(_anigail).vote(resolution3, true);
        await generalAssembly.connect(_bernard).vote(resolution3, false);
        await generalAssembly.connect(_cynthia).vote(resolution3, false);
        await generalAssembly.connect(_dounia).vote(resolution3, false);

        // Move the chain to the vote end time

        const voteEndTime = await generalAssembly.voteEnd();
        await mooveToBlockTimestamp(Number(voteEndTime) + 1);

        return { generalAssembly, _admin, _syndic };

    }

    async function completeVotingSessionWithEqualitiesInGeneralAssembly() {

        const { VRFCoordinatorV2Mock, syndx, generalAssembly, voteStartTime, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

        // Move the chain to the vote start time

        await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(voteStartTime) + 1]);
        await hre.network.provider.send("evm_mine"); 

        // Cast votes

        const resolution1 = 1;
        await generalAssembly.connect(_anigail).vote(resolution1, true);
        await generalAssembly.connect(_bernard).vote(resolution1, true);
        await generalAssembly.connect(_cynthia).vote(resolution1, false);
        await generalAssembly.connect(_elyes).vote(resolution1, false);

        const resolution2 = 2;
        await generalAssembly.connect(_anigail).vote(resolution2, false);
        await generalAssembly.connect(_bernard).vote(resolution2, false);
        await generalAssembly.connect(_dounia).vote(resolution2, true);
        await generalAssembly.connect(_elyes).vote(resolution2, true);

        const resolution3 = 3;
        await generalAssembly.connect(_anigail).vote(resolution3, false);
        await generalAssembly.connect(_bernard).vote(resolution3, true);
        await generalAssembly.connect(_dounia).vote(resolution3, true);
        await generalAssembly.connect(_elyes).vote(resolution3, false);

        // Move the chain to the vote end time

        const voteEndTime = await generalAssembly.voteEnd();
        await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(voteEndTime) + 1]);
        await hre.network.provider.send("evm_mine");

        return { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic };
    }

    // ::::::::::: Test ::::::::::: //
    
    describe("SyndX and TokenFactory Deployment Tests", function() {

        describe("SyndX Contract Deployment", function() {

            it("Successfully deploys SyndX contract", async function () {

                const { syndx, _admin } = await loadFixture(deploySyndxWithVrfCoordinatorMock);
                expect(await syndx.owner()).to.be.equal(_admin.address);
                
            });
    
            it("Successfully deploys TokenFactory contract, assigning ownership to SyndX.", async function () {
    
                const { syndx, tokenFactory } = await loadFixture(deployTokenFactory);
                expect(await tokenFactory.syndx()).to.be.equal(syndx.target);
    
            });

        });

        describe("TokenFactory Contract Settings", function() {

            it("Allows setting TokenFactory contract when called by the owner", async function () {

                const { syndx, tokenFactory } = await loadFixture(deployTokenFactory);
                    
                await expect(
                    await syndx.setTokenFactory(tokenFactory.target)
                ).to.emit(syndx, "TokenFactorySet").withArgs(ADDRESS_ZERO, tokenFactory.target);
    
                expect(await syndx.tokenFactory()).to.be.equal(await tokenFactory.target);
                expect(await syndx.target).to.be.equal(await tokenFactory.syndx());
    
            });
    
            it("Blocks setting TokenFactory contract when called by a non-owner", async function () {
    
                const { syndx, tokenFactory, _syndic } = await loadFixture(deployTokenFactory);
    
                await expect(
                    syndx.connect(_syndic).setTokenFactory(tokenFactory.target)
                ).to.be.revertedWithCustomError(syndx, "OwnableUnauthorizedAccount");
    
            });
        });

    });

    describe("SyndX Functionality Tests", function() {

        describe("Contract Verification", function() {

            it("Verifies contract creation by SyndX", async function () {

                const { syndx, coproperty } = await loadFixture(deployCopropertyWithGovernanceToken);
    
                expect(await syndx.contracts(coproperty.target)).greaterThan(0);
    
            });
    
            it("Checks if a coproperty name is already in use", async function () {
    
                const { syndx, coproperty } = await loadFixture(deployCopropertyWithGovernanceToken);
    
                expect(await syndx.coproperties(COPROPERTY_NAME)).not.to.be.equal(ADDRESS_ZERO);
    
            });

        });

        describe("Access and Authorization", function() {

            it("Restricts random number requests to authorized customers", async function () {

                const { syndx, _syndic } = await loadFixture(deploySyndxWithVrfCoordinatorMock);
    
                await expect(
                    syndx.connect(_syndic).requestRandomNumber()
                ).to.be.revertedWithCustomError(syndx, "UnauthorizedRandomnessConsumer").withArgs(_syndic.address);
    
            });
    
            it("Prohibits unknown coproperty contracts from initiating a general assembly", async function () {
    
                const { syndx, _syndic } = await loadFixture(deploySyndxWithVrfCoordinatorMock);
    
                const voteStartTime = 1;
    
                await expect(
                    syndx.connect(_syndic).createGeneralAssembly(voteStartTime)
                ).to.be.revertedWithCustomError(syndx, "UnknownCopropertyContract").withArgs(_syndic.address);
    
            });

        });

    });

    describe("Token Factory Tests", function() {

        describe("Retrieving Contract Address", function() {

            it("Enables retrieval of SyndX contract address", async function () {
        
                const { syndx, tokenFactory, _syndic } = await loadFixture(connectSyndxToTokenFactory);
                
                expect(await tokenFactory.syndx()).to.be.equal(syndx.target);
    
            });

        });

        describe("Governance Token Tests", function() {

            it("Blocks non-administrators from creating governance tokens", async function () {
        
                const { syndx, tokenFactory, _syndic } = await loadFixture(connectSyndxToTokenFactory);

                await expect(
                    tokenFactory.connect(_syndic).createGovernanceToken(COPROPERTY_TOKEN_ISO, _syndic.address, syndx.target)
                ).to.be.revertedWithCustomError(tokenFactory, "NotAuthorized");
    
            });

            it("Allows Token Factory owner to create governance tokens", async function () {
    
                const { syndx, tokenFactory, _syndic } = await loadFixture(connectSyndxToTokenFactory);
                
                const governanceTokenAddress = await tokenFactory.createGovernanceToken(COPROPERTY_TOKEN_ISO, _syndic.address, syndx.target);

                expect(governanceTokenAddress).not.to.be.equal(ADDRESS_ZERO);
    
            });

            it("Prevents creation of governance tokens with zero address as syndic or owner", async function () {
    
                const { syndx, tokenFactory, _syndic } = await loadFixture(connectSyndxToTokenFactory);

                await expect(
                    tokenFactory.createGovernanceToken(COPROPERTY_TOKEN_ISO, ADDRESS_ZERO, syndx.target)
                ).to.be.revertedWithCustomError(tokenFactory, "InvalidSyndicAddress").withArgs(ADDRESS_ZERO);
    
            });

            it("Ensures governance token ISO length is valid", async function () {
    
                const { tokenFactory, _syndic } = await loadFixture(connectSyndxToTokenFactory);

                await expect(
                    tokenFactory.createGovernanceToken(COPROPERTY_TOKEN_ISO, _syndic.address, ADDRESS_ZERO)
                ).to.be.revertedWithCustomError(tokenFactory, "InvalidTokenOwnerAddress").withArgs(ADDRESS_ZERO);
    
            });

        });

        describe("Vote Token Tests", function() {

            it("Permits Token Factory owner to create vote tokens", async function () {
        
                const { tokenFactory, governanceToken, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);
                
                const voteTokenAddress = await tokenFactory.createVoteToken(COPROPERTY_TOKEN_ISO, 1, _syndic.address, governanceToken.target);

                expect(voteTokenAddress).not.to.be.equal(ADDRESS_ZERO);
    
            });

            it("Prevents non-administrators from creating vote tokens", async function () {
        
                const { tokenFactory, governanceToken, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);
                
                await expect(
                    tokenFactory.connect(_syndic).createVoteToken(COPROPERTY_TOKEN_ISO, 1, _syndic.address, governanceToken.target)
                ).to.be.revertedWithCustomError(tokenFactory, "NotAuthorized");
    
            });

            it("Validates vote token creation criteria (address, governance token, ISO length)", async function () {
        
                const { tokenFactory, governanceToken } = await loadFixture(deployCopropertyWithGovernanceToken);

                await expect(
                    tokenFactory.createVoteToken(COPROPERTY_TOKEN_ISO, 1, ADDRESS_ZERO, governanceToken.target)
                ).to.be.revertedWithCustomError(tokenFactory, "InvalidSyndicAddress").withArgs(ADDRESS_ZERO);
    
            });

            it("Prohibit Creating Vote Tokens with Zero Address as Governance Token by Administrators", async function () {
        
                const { _syndic, tokenFactory } = await loadFixture(deployCopropertyWithGovernanceToken);

                await expect(
                    tokenFactory.createVoteToken(COPROPERTY_TOKEN_ISO, 1, _syndic.address, ADDRESS_ZERO)
                ).to.be.revertedWithCustomError(tokenFactory, "InvalidGovernanceTokenAddress").withArgs(ADDRESS_ZERO);
    
            });

            it("Should Block Creation of Vote Tokens by Administrators with Invalid ISO Length", async function () {
        
                const { tokenFactory, governanceToken, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);

                const shortTokenISO = "";

                await expect(
                    tokenFactory.createVoteToken(shortTokenISO, 1, _syndic.address, governanceToken.target)
                ).to.be.revertedWithCustomError(tokenFactory, "TokenISOTooShort");

                const longTokenISO = "AAAAAAAAAAAAAAAAAAAAA";

                await expect(
                    tokenFactory.createVoteToken(longTokenISO, 1, _syndic.address, governanceToken.target)
                ).to.be.revertedWithCustomError(tokenFactory, "TokenISOTooLong");
    
            });

        });

    });

    describe("Coproperty Tests", function() {

        describe("Coproperty Creation with Governance Token", function() {

            it("Allows contract creation if caller is the owner", async function () {
        
                const { syndx, _syndic } = await loadFixture(connectSyndxToTokenFactory);
    
                await expect(
                    await syndx.createCoproperty(COPROPERTY_NAME, COPROPERTY_TOKEN_ISO, _syndic.address)
                ).to.emit(syndx, "CopropertyContractCreated")
                 .to.emit(syndx, "GovernanceTokenContractCreated");

                expect(await syndx.coproperties(COPROPERTY_NAME)).not.to.be.equal(ADDRESS_ZERO);
    
            });

            it("Blocks contract creation if caller is not the owner", async function () {
    
                const { syndx, _syndic } = await loadFixture(connectSyndxToTokenFactory);

                await expect(
                    syndx.connect(_syndic).createCoproperty(COPROPERTY_NAME, COPROPERTY_TOKEN_ISO, _syndic.address)
                ).to.be.revertedWithCustomError(syndx, "OwnableUnauthorizedAccount");
    
            });

            it("Ensures governance token ISO length is valid during creation", async function () {
        
                const { syndx, tokenFactory, _syndic } = await loadFixture(connectSyndxToTokenFactory);

                const shortTokenIso = "";
                
                await expect(
                    tokenFactory.createGovernanceToken(shortTokenIso, _syndic.address, syndx.target)
                ).to.be.revertedWithCustomError(tokenFactory, "TokenISOTooShort").withArgs();

                const longTokenISO = "AAAAAAAAAAAAAAAAAAA";

                await expect(
                    tokenFactory.createGovernanceToken(longTokenISO, _syndic.address, syndx.target)
                ).to.be.revertedWithCustomError(tokenFactory, "TokenISOTooLong").withArgs();
    
            });

            it("Correctly Set the Syndx Contract Address", async function () {
        
                const { syndx, coproperty } = await loadFixture(deployCopropertyWithGovernanceToken);

                expect(await coproperty.syndx()).to.be.equal(syndx.target);

            });

            it("Properly Assign Syndx Contract as the Owner", async function () {
    
                const { syndx, coproperty } = await loadFixture(deployCopropertyWithGovernanceToken);

                expect(await coproperty.owner()).to.be.equal(syndx.target);

            });

            it("Should Accurately Assign the Syndic Account as the Coproperty Syndic", async function () {
        
                const { coproperty, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);

                expect(await coproperty.syndic()).to.be.equal(_syndic.address);

            });

            it(`Should CREATE a coproperty contract with name: ${COPROPERTY_NAME}`, async function () {
        
                const { coproperty } = await loadFixture(deployCopropertyWithGovernanceToken);
                expect(await coproperty.name()).to.be.equal(COPROPERTY_NAME);

            });

        });

        describe("Coproperty Governance Token Configuration", function() {

            it(`Forbid Creation of Governance Tokens with Invalid ISO Length`, async function () {
                    
                const { syndx, tokenFactory, _syndic } = await loadFixture(connectSyndxToTokenFactory);

                await expect(
                    syndx.createCoproperty(COPROPERTY_NAME, "", _syndic.address)
                ).to.be.revertedWithCustomError(tokenFactory, "TokenISOTooShort");
                
                await expect(
                    syndx.createCoproperty(COPROPERTY_NAME, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", _syndic.address)
                ).to.be.revertedWithCustomError(tokenFactory, "TokenISOTooLong");
            });

            it(`Successfully Create a Coproperty Governance Token with Syndx Contract Owner as Owner`, async function () {
        
                const { syndx, governanceToken } = await loadFixture(deployCopropertyWithGovernanceToken);
                expect(await governanceToken.owner()).to.be.equal(await syndx.owner());

            });

            it(`Successfully Create a Coproperty Governance Token with Syndic Account as Admin`, async function () {
        
                const { governanceToken, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);
                expect(await governanceToken.administrator()).to.be.equal(_syndic.address);

            });

            it(`Successfully Create a Coproperty Governance Token with 'BATA' as ISO`, async function () {
        
                const { governanceToken } = await loadFixture(deployCopropertyWithGovernanceToken);
                expect(await governanceToken.getTokenISO()).to.be.equal(COPROPERTY_TOKEN_ISO);

            });

            it(`Successfully Create a Coproperty Governance Token with 'synBATA' Symbol`, async function () {
    
                const { governanceToken } = await loadFixture(deployCopropertyWithGovernanceToken);
                expect(await governanceToken.symbol()).to.be.equal(`syn${COPROPERTY_TOKEN_ISO}`);

            });
    
            it(`Create a Coproperty Governance Token with a Total Supply of 10000 synBATA`, async function () {
    
                const { governanceToken } = await loadFixture(deployCopropertyWithGovernanceToken);
                expect(await governanceToken.totalSupply()).to.be.equal(COPROPERTY_TOTAL_SUPPLY);

            });

            it(`Enable Checking of Governance Token Decimals`, async function () {
    
                const { governanceToken } = await loadFixture(deployCopropertyWithGovernanceToken);
                expect(await governanceToken.decimals()).to.be.equal(0);

            });

            it(`Allow Syndx Contract Owner to Appoint Governance Token Administrator`, async function () {
        
                const { governanceToken, _admin, _anigail } = await loadFixture(distributeCopropertyGovernanceTokens);

                await governanceToken.connect(_admin).setAdministrator(_anigail.address);

                expect(await governanceToken.administrator()).to.be.equal(_anigail.address);

            });

            it(`Restrict Setting Governance Token Administrator to Syndx Contract Owner Only`, async function () {
        
                const { governanceToken, _syndic, _anigail } = await loadFixture(distributeCopropertyGovernanceTokens);

                await expect(
                    governanceToken.connect(_syndic).setAdministrator(_anigail.address)
                ).to.be.revertedWithCustomError(governanceToken, 'OwnableUnauthorizedAccount').withArgs(_syndic.address);

            });

            it(`Block Adding Zero Address as Governance Token Administrator`, async function () {
        
                const { governanceToken, _admin } = await loadFixture(distributeCopropertyGovernanceTokens);

                await expect(
                    governanceToken.connect(_admin).setAdministrator(ADDRESS_ZERO)
                ).to.be.revertedWithCustomError(governanceToken, 'AddressZeroNotAllowed');

            });

            it(`Trigger 'AdministratorSet' Event Upon Setting Governance Token Administrator`, async function () {
    
                const { syndx, governanceToken, _admin, _anigail } = await loadFixture(distributeCopropertyGovernanceTokens);

                expect(
                    await governanceToken.connect(_admin).setAdministrator(_anigail)
                ).to.emit(governanceToken, 'AdministratorSet').withArgs(await syndx.owner(), _anigail.address);

            });

        });

        describe("Governance Token Distribution", function() {

            it(`Verify if an Account Is Whitelisted`, async function () {
        
                const { governanceToken, _admin, _anigail } = await loadFixture(distributeCopropertyGovernanceTokens);
                expect(await governanceToken.isWhitelistedAddress(_admin.address)).to.be.false;
                expect(await governanceToken.isWhitelistedAddress(_anigail.address)).to.be.true;

            });

            it("Initially Allocate Entire Token Supply to the Syndic Account", async function () {
    
                const { governanceToken } = await loadFixture(deployCopropertyWithGovernanceToken);

                expect(await governanceToken.totalSupply()).to.be.equal(COPROPERTY_TOTAL_SUPPLY);

            });

            it("Permit the Syndic to Add Property Owners and Allocate Governance Tokens", async function () {

                const { governanceToken, _syndic, _anigail } = await loadFixture(deployCopropertyWithGovernanceToken);

                await governanceToken.connect(_syndic).addPropertyOwner(_anigail.address, 2000);
                const anigailBalance = await governanceToken.balanceOf(_anigail.address);
                expect(anigailBalance).to.be.equal(2000);

                await expect(await governanceToken.isWhitelistedAddress(_anigail.address)).to.be.true;

            });

            it("Prohibit Adding Zero Address as a Property Owner", async function () {

                const { governanceToken, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);

                await expect(
                    governanceToken.connect(_syndic).addPropertyOwner(ADDRESS_ZERO, 2000)
                ).to.be.revertedWithCustomError(governanceToken, 'AddressZeroNotAllowed');

            });

            it("Only Allow the Syndic to Add Property Owners and Allocate Tokens", async function () {

                const { governanceToken, _syndic, _anigail } = await loadFixture(deployCopropertyWithGovernanceToken);

                await expect(
                    governanceToken.connect(_anigail).addPropertyOwner(_anigail.address, 2000)
                ).to.be.revertedWithCustomError(governanceToken, "NotTokenAdministrator").withArgs(_syndic.address, _anigail.address);

            });

            it("Prevent the Syndic to Add Property Owners and Allocate Tokens Twice", async function () {

                const { governanceToken, _syndic, _anigail } = await loadFixture(deployCopropertyWithGovernanceToken);

                await governanceToken.connect(_syndic).addPropertyOwner(_anigail.address, 2000);

                await expect(
                    governanceToken.connect(_syndic).addPropertyOwner(_anigail.address, 2000)
                ).to.be.revertedWithCustomError(governanceToken, "PropertyOwnerAlreadyAdded").withArgs(_anigail.address);

            });

            it("Trigger 'PropertyOwnerAdded' Event on Addition of a Property Owner", async function () {

                const { governanceToken, _syndic, _anigail } = await loadFixture(deployCopropertyWithGovernanceToken);

                await expect(
                    governanceToken.connect(_syndic).addPropertyOwner(_anigail.address, 2000)
                ).to.be.emit(governanceToken, "PropertyOwnerAdded").withArgs(_anigail.address, Number(2000));

            });

            it("Enable the Syndic to Revoke Property Ownership and Retrieve Tokens", async function () {

                const { governanceToken, _syndic, _anigail } = await loadFixture(distributeCopropertyGovernanceTokens);

                await governanceToken.connect(_syndic).removePropertyOwner(_anigail.address);

                const syndicBalance = await governanceToken.balanceOf(_syndic.address);
                await expect(Number(syndicBalance)).to.be.equal(2000);

                const anigailBalance = await governanceToken.balanceOf(_anigail.address);
                await expect(Number(anigailBalance)).to.be.equal(0);

                await expect(await governanceToken.isWhitelistedAddress(_anigail.address)).to.be.false;

            });

            it("Forbid Removal of Property Owner with Zero Address", async function () {

                const { governanceToken, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);

                await expect(
                    governanceToken.connect(_syndic).removePropertyOwner(ADDRESS_ZERO)
                ).to.be.revertedWithCustomError(governanceToken, 'AddressZeroNotAllowed');

            });

            it("Restrict Property Owner Removal to the Syndic Only", async function () {

                const { governanceToken, _syndic, _anigail } = await loadFixture(distributeCopropertyGovernanceTokens);

                await expect(
                    governanceToken.connect(_anigail).removePropertyOwner(_anigail.address)
                ).to.be.revertedWithCustomError(governanceToken, "NotTokenAdministrator").withArgs(_syndic.address, _anigail.address);

            });

            it("Trigger 'PropertyOwnerRemoved' Event on Property Owner Removal", async function () {

                const { governanceToken, _syndic, _anigail } = await loadFixture(distributeCopropertyGovernanceTokens);

                await expect(
                    governanceToken.connect(_syndic).removePropertyOwner(_anigail.address)
                ).to.be.emit(governanceToken, "PropertyOwnerRemoved").withArgs(_anigail.address, 2000);

            });

            it("Transfer Tokens to Syndic and Delist from Whitelist on Property Owner Removal", async function () {

                const { governanceToken, _syndic, _anigail } = await loadFixture(distributeCopropertyGovernanceTokens);
                
                const balanceOfPropertyOwnerBefore = await governanceToken.balanceOf(_anigail.address);
                const balanceSyndicBefore = await governanceToken.balanceOf(_syndic.address);

                await governanceToken.connect(_syndic).removePropertyOwner(_anigail.address);

                const balanceOfPropertyOwnerAfter = await governanceToken.balanceOf(_anigail.address);
                const balanceSyndicAfter = await governanceToken.balanceOf(_syndic.address);

                await expect(balanceOfPropertyOwnerAfter).to.be.equal(0);
                await expect(balanceSyndicAfter).to.be.equal(balanceSyndicBefore + balanceOfPropertyOwnerBefore);

            });

            it("Exclude Property Owner Addresses from Token Whitelist on Removal", async function () {

                const { governanceToken, _syndic, _anigail } = await loadFixture(distributeCopropertyGovernanceTokens);
                
                const isPropertyOwnerWhitelistedBefore = await governanceToken.whitelist(_anigail.address);
                await governanceToken.connect(_syndic).removePropertyOwner(_anigail.address);
                const isPropertyOwnerWhitelistedAfter = await governanceToken.whitelist(_anigail.address);

                await expect(isPropertyOwnerWhitelistedBefore).to.be.true;
                await expect(isPropertyOwnerWhitelistedAfter).to.be.false;

            });

            it("Disallow Non-Syndic Accounts from Removing Property Owners", async function () {

                const { governanceToken, _syndic, _anigail, _bernard } = await loadFixture(distributeCopropertyGovernanceTokens);

                await expect(
                    governanceToken.connect(_anigail).removePropertyOwner(_bernard.address)
                ).to.be.revertedWithCustomError(governanceToken, "NotTokenAdministrator").withArgs(_syndic.address, _anigail.address);

            });

            it("Forbid Property Owners from Transferring Tokens to Non-Syndic Accounts", async function () {

                const { governanceToken, _syndic, _anigail, _bernard } = await loadFixture(distributeCopropertyGovernanceTokens);

                await expect(
                    governanceToken.connect(_anigail).transfer(_bernard.address, 1000)
                ).to.be.revertedWithCustomError(governanceToken, "TokenTransferUnauthorized").withArgs(_anigail.address, _bernard.address);

                await expect(
                    governanceToken.connect(_anigail).transfer(_syndic.address, 1000)
                ).not.to.be.revertedWithCustomError(governanceToken, "TokenTransferUnauthorized");

            });

            it("Allow Property Owners to Return Governance Tokens to the Syndic", async function () {

                const { governanceToken, _anigail, _syndic } = await loadFixture(distributeCopropertyGovernanceTokens);

                const transferedAmount = 1500;

                const syndicBalanceSnapshot = await governanceToken.balanceOf(_syndic.address);
                const anigailBalanceSnapshot = await governanceToken.balanceOf(_anigail.address);

                await governanceToken.connect(_anigail).transfer(_syndic.address, transferedAmount);

                const syndicBalance = await governanceToken.balanceOf(_syndic.address);
                const anigailBalance = await governanceToken.balanceOf(_anigail.address);
                
                await expect(Number(syndicBalanceSnapshot) + transferedAmount).to.be.equal(Number(syndicBalance));
                await expect(Number(anigailBalanceSnapshot) - transferedAmount).to.be.equal(Number(anigailBalance));
            });

            it("Should Restrict Token Receipt to Only Property Owners and the Syndic", async function () {

                const { governanceToken, _admin, _syndic, _anigail } = await loadFixture(deployCopropertyWithGovernanceToken);
                
                
                await expect(
                    governanceToken.connect(_syndic).transfer(_admin.address, 500)
                ).to.be.revertedWithCustomError(governanceToken, "NotAuthorizedToReceiveTokens").withArgs(_syndic.address, _admin.address);

            });

        });

    });

    describe("General Assembly Tests", function() {

        describe("General Assembly Creation with Vote Token", function() {

            it("Create a General Assembly with Syndic Address", async function () {

                const { coproperty, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);

                await hre.network.provider.send("evm_mine");
                const now = (await ethers.provider.getBlock("latest")).timestamp;

                const lockupDuration = GENERAL_ASSEMBLY_LOCKUP_DURATION;
                const miniDurationBeforeLockup = GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP;
                const voteStartTime = now + miniDurationBeforeLockup + lockupDuration + 30;

                const txGeneralAssembly = await coproperty.connect(_syndic).createGeneralAssembly(voteStartTime);
                await txGeneralAssembly.wait();

                const generalAssemblyContractAddress = await coproperty.getLastestGeneralAssembly();
                const generalAssembly = await hre.ethers.getContractAt("GeneralAssembly", generalAssemblyContractAddress);

                expect(await generalAssembly.syndic()).to.be.equal(_syndic.address);
            });

            it("Emit 'GeneralAssemblyContractCreated' Event for New Assembly", async function () {

                const { syndx, coproperty, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);

                await hre.network.provider.send("evm_mine");
                const now = (await ethers.provider.getBlock("latest")).timestamp;

                const lockupDuration = 30;
                const miniDurationBeforeLockup = 180;
                const voteStartTime = now + miniDurationBeforeLockup + lockupDuration + 30;

                expect(
                    coproperty.connect(_syndic).createGeneralAssembly(voteStartTime)
                ).to.be.emit(syndx, "GeneralAssemblyContractCreated");
            });

            it("Emit 'VoteTokenContractCreated' Event for Each New Assembly", async function () {

                const { syndx, coproperty, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);

                await hre.network.provider.send("evm_mine");
                const now = (await ethers.provider.getBlock("latest")).timestamp;

                const lockupDuration = 30;
                const miniDurationBeforeLockup = 180;
                const voteStartTime = now + miniDurationBeforeLockup + lockupDuration + 30;

                expect(
                    coproperty.connect(_syndic).createGeneralAssembly(voteStartTime)
                ).to.be.emit(syndx, "VoteTokenContractCreated");
            });

            it("Emit 'LockupTimeSet' Event When Setting Vote Token Contract Lockup Time", async function () {

                const { coproperty, voteToken, _syndic } = await loadFixture(deployCopropertyWithGovernanceToken);

                await hre.network.provider.send("evm_mine");
                const now = (await ethers.provider.getBlock("latest")).timestamp;

                const lockupDuration = GENERAL_ASSEMBLY_LOCKUP_DURATION;
                const miniDurationBeforeLockup = GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP;
                const voteStartTime = now + miniDurationBeforeLockup + lockupDuration + 30;

                expect (
                    await coproperty.connect(_syndic).createGeneralAssembly(voteStartTime)
                ).to.emit(voteToken, "LockupTimeSet").withArgs(voteStartTime-lockupDuration);
            });

            it("Restrict General Assembly Creation to the Syndic Account of the Coproperty", async function () {

                const { coproperty, _admin } = await loadFixture(deployCopropertyWithGovernanceToken);

                await hre.network.provider.send("evm_mine");
                const now = (await ethers.provider.getBlock("latest")).timestamp;

                const lockupDuration = 30;
                const miniDurationBeforeLockup = 180;
                const voteStartTime = now + miniDurationBeforeLockup + lockupDuration + 30;

                await expect(
                    coproperty.connect(_admin).createGeneralAssembly(voteStartTime)
                ).to.be.revertedWithCustomError(coproperty, 'NotCopropertySyndic').withArgs(_admin.address);
            });

        });

        describe("General Assembly Contract Creation", function() {

            it(`Create a General Assembly Contract with a Set Vote Token`, async function () {

                const { generalAssembly } = await loadFixture(createGeneralAssemblyWithVoteToken);

                expect(await generalAssembly.voteToken()).not.to.be.equal(ADDRESS_ZERO);

            });

            it(`Create a General Assembly Contract with a Set Syndic Account`, async function () {

                const { generalAssembly, _syndic } = await loadFixture(createGeneralAssemblyWithVoteToken);

                expect(await generalAssembly.syndic()).to.be.equal(_syndic.address);
            });

            it(`Create a General Assembly Contract with a Named Vote Token Based on BATA ISO and Assembly ID`, async function () {

                const { coproperty, voteToken } = await loadFixture(createGeneralAssemblyWithVoteToken);

                const generalAssemblyIndex = Number(await coproperty.getGeneralAssemblyCount()) - 1;

                expect(await voteToken.symbol()).to.be.equal(`vote${COPROPERTY_TOKEN_ISO}${generalAssemblyIndex}`);

            });

            it(`Create a General Assembly Contract with a Vote Token Having Zero Decimals`, async function () {

                const { voteToken } = await loadFixture(createGeneralAssemblyWithVoteToken);

                expect(await voteToken.decimals()).to.be.equal(0);

            });

            it(`Link the General Assembly Contract to the Parent Coproperty's Governance Token`, async function () {

                const { governanceToken, generalAssembly } = await loadFixture(createGeneralAssemblyWithVoteToken);

                expect(await generalAssembly.governanceToken()).to.be.equal(governanceToken.target);
            });

            it(`Initialize a General Assembly Contract with a Tiebreaker Initially Set to Zero`, async function () {

                const { generalAssembly } = await loadFixture(createGeneralAssemblyWithVoteToken);

                expect(await generalAssembly.tiebreaker()).to.be.equal(0);
            });

            it(`Establish a Valid Timeline for the General Assembly`, async function () {

                const { generalAssembly, voteStartTime } = await loadFixture(createGeneralAssemblyWithVoteToken);

                const timespanBetweenCreationAndLockup = await generalAssembly.lockup() - await generalAssembly.created();
                const timespanBetweenLockupAndVoteStart = await generalAssembly.voteStart() - await generalAssembly.lockup();
                const timespanBetweenVoteStartAndVoteEnd = await generalAssembly.voteEnd() - await generalAssembly.voteStart();

                expect(voteStartTime).to.be.equal(await generalAssembly.voteStart());
                expect(timespanBetweenCreationAndLockup).to.be.greaterThan(GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP);
                expect(timespanBetweenLockupAndVoteStart).to.be.equal(GENERAL_ASSEMBLY_LOCKUP_DURATION);
                expect(timespanBetweenVoteStartAndVoteEnd).to.be.equal(GENERAL_ASSEMBLY_VOTING_SESSION_DURATION);

            });

            it(`Enable Retrieval of the Correctly Set General Assembly Timeline`, async function () {

                const { generalAssembly } = await loadFixture(createGeneralAssemblyWithVoteToken);

                const timeline = await generalAssembly.getTimeline();

                expect(timeline.created).to.be.greaterThan(0);
                expect(timeline.lockup).to.be.greaterThan(0);
                expect(timeline.voteStart).to.be.greaterThan(0);
                expect(timeline.voteEnd).to.be.greaterThan(0);

            });

            it(`Assign Syndx Contract as the Owner of the Vote Token`, async function () {

                const { syndx, voteToken } = await loadFixture(createGeneralAssemblyWithVoteToken);

                expect(await voteToken.owner()).to.be.equal(await syndx.target);
            });

        });

        describe("Vote Token in General Assembly", function() {

            it(`Link Coproperty's Governance Token to the Vote Token`, async function () {

                const { governanceToken, voteToken } = await loadFixture(createGeneralAssemblyWithVoteToken);
                expect(governanceToken.target).to.be.equal(await voteToken.governanceToken());
            });

            it(`Set the Syndic as the Administrator of the Vote Token`, async function () {

                const { voteToken, _syndic } = await loadFixture(createGeneralAssemblyWithVoteToken);
                expect(_syndic.address).to.be.equal(await voteToken.administrator());

            });

            it(`Sync Vote Token Lockup Time with General Assembly`, async function () {

                const { generalAssembly, voteToken } = await loadFixture(createGeneralAssemblyWithVoteToken);
                expect(await generalAssembly.lockup()).to.be.equal(await voteToken.lockupTime());
            });

            it(`Allow Property Owners to Claim Vote Tokens Based on Governance Token Balance`, async function () {

                const { governanceToken, voteToken, _anigail } = await loadFixture(createGeneralAssemblyWithVoteToken);

                const anigailGovernanceTokenBalance = await governanceToken.balanceOf(_anigail.address);

                const anigailBalanceBeforeClaim = await voteToken.balanceOf(_anigail.address);
                expect(anigailBalanceBeforeClaim).to.be.equal(0);

                await voteToken.connect(_anigail).claimVoteTokens();
                const anigailBalanceAfterClaim = await voteToken.balanceOf(_anigail.address);

                expect(anigailBalanceAfterClaim).to.be.equal(anigailGovernanceTokenBalance);
            });

            it(`Prevent Property Owners from Claiming Vote Tokens More Than Once`, async function () {

                const { governanceToken, voteToken, _anigail } = await loadFixture(createGeneralAssemblyWithVoteToken);

                await voteToken.connect(_anigail).claimVoteTokens();

                await expect(
                    voteToken.connect(_anigail).claimVoteTokens()  
                ).to.be.revertedWithCustomError(voteToken, "VoteTokensAlreadyClaimed").withArgs(_anigail.address);
            });

            it(`Emit 'VoteTokensClaimed' Event When Property Owners Successfully Claim Tokens`, async function () {

                const { governanceToken, voteToken, _anigail } = await loadFixture(createGeneralAssemblyWithVoteToken);

                const anigailGovernanceTokenBalance = await governanceToken.balanceOf(_anigail.address);

                expect (
                    await voteToken.connect(_anigail).claimVoteTokens()
                ).to.emit(voteToken, "VoteTokensClaimed").withArgs(_anigail.address, anigailGovernanceTokenBalance);
                
            });

            it(`Restrict Vote Token Claims to Governance Token Holders`, async function () {

                const { voteToken, _admin } = await loadFixture(createGeneralAssemblyWithVoteToken);

                await expect(
                    voteToken.connect(_admin).claimVoteTokens()
                ).to.be.revertedWithCustomError(voteToken, "PropertySharesBalanceIsZero").withArgs(_admin.address);
            });

            it(`Allow anyone to verify if an account claimed his vote tokens`, async function () {

                const { voteToken, _anigail } = await loadFixture(createGeneralAssemblyWithVoteToken);

                const hasClaimed = await voteToken.hasClaimed(_anigail.address);

                await expect(hasClaimed).to.be.false;
            });

            it(`Enable the Syndic to Burn Lost Tokens, Prevent Reclaiming Again and Remove Account From Property Owners`, async function () {

                const { governanceToken, voteToken, _syndic, _anigail } = await loadFixture(createGeneralAssemblyWithVoteToken);

                const anigailGovernanceTokenBalanceBefore = await governanceToken.balanceOf(_anigail.address);

                await voteToken.connect(_anigail).claimVoteTokens();
                const anigailBalanceAfterClaim = await voteToken.balanceOf(_anigail.address);
                expect (anigailBalanceAfterClaim).to.be.equal(anigailGovernanceTokenBalanceBefore);

                await voteToken.connect(_syndic).burnLostToken(_anigail.address);

                const anigailBalanceAfterBurn = await voteToken.balanceOf(_anigail.address);
                expect (anigailBalanceAfterBurn).to.be.equal(0);

                await expect(
                    voteToken.connect(_anigail).claimVoteTokens()
                ).to.be.revertedWithCustomError(voteToken, "VoteTokensAlreadyClaimed").withArgs(_anigail.address);
            });

            it(`Emit 'LostTokensBurned' Event on Token Burning by Administrator`, async function () {

                const { voteToken, _syndic, _anigail, _bernard } = await loadFixture(createGeneralAssemblyWithVoteToken);

                await voteToken.connect(_anigail).claimVoteTokens();
                const anigailBalanceAfterClaim = await voteToken.balanceOf(_anigail.address);

                await expect(
                    voteToken.connect(_syndic).burnLostToken(_anigail.address)
                ).to.be.emit(voteToken, "LostTokensBurned").withArgs(_anigail.address, anigailBalanceAfterClaim);

            });

            it(`Emit 'LostTokensBurned' Event on Token Burning by Administrator.`, async function () {

                const { voteToken, _syndic, _anigail, _bernard } = await loadFixture(createGeneralAssemblyWithVoteToken);

                await expect(
                    voteToken.connect(_anigail).burnLostToken(_bernard.address)
                ).to.be.revertedWithCustomError(voteToken, "NotTokenAdministrator").withArgs(_syndic.address, _anigail.address);

            });

            it(`Allow Transfer of Vote Tokens Among Property Owners Who Claimed Them`, async function () {

                const { voteToken, _anigail, _bernard } = await loadFixture(createGeneralAssemblyWithVoteToken);

                await voteToken.connect(_anigail).claimVoteTokens();
                const anigailBalanceAfterClaim = await voteToken.balanceOf(_anigail.address);

                await voteToken.connect(_bernard).claimVoteTokens();

                const bernardBalanceBeforeAnigailTransfer = await voteToken.balanceOf(_bernard.address);
                await voteToken.connect(_anigail).transfer(_bernard.address, anigailBalanceAfterClaim);

                const bernardBalanceAfterTransfer = await voteToken.balanceOf(_bernard.address);
                const anigailBalanceAfterTransfer= await voteToken.balanceOf(_anigail.address);

                expect(anigailBalanceAfterTransfer).to.be.equal(0);
                expect(bernardBalanceAfterTransfer).to.be.equal(Number(bernardBalanceBeforeAnigailTransfer) + Number(anigailBalanceAfterClaim));

            });

            it(`Prohibit Transfer of Vote Tokens to Non-Property Owner Accounts`, async function () {

                const { voteToken, _admin, _syndic, _anigail, _bernard, _cynthia } = await loadFixture(createGeneralAssemblyWithVoteToken);

                await voteToken.connect(_anigail).claimVoteTokens();
                const anigailBalance = await voteToken.balanceOf(_anigail.address);

                await expect(
                    voteToken.connect(_anigail).transfer(_admin.address, anigailBalance)
                ).to.be.revertedWithCustomError(voteToken, "NotAuthorizedToReceiveTokens").withArgs(_anigail.address, _admin.address);

                await voteToken.connect(_bernard).claimVoteTokens();
                const bernardBalance = await voteToken.balanceOf(_bernard.address);

                await expect(
                    voteToken.connect(_bernard).transfer(_syndic.address, bernardBalance)
                ).to.be.revertedWithCustomError(voteToken, "NotAuthorizedToReceiveTokens").withArgs(_bernard.address, _syndic.address);

                await voteToken.connect(_cynthia).claimVoteTokens();
                const cynthiaBalance = await voteToken.balanceOf(_cynthia.address);

                await expect(
                    voteToken.connect(_cynthia).transfer(ADDRESS_ZERO, cynthiaBalance)
                ).to.be.revertedWithCustomError(voteToken, "ERC20InvalidReceiver");

            });

            it(`Block Vote Token Transfer After Lockup Time`, async function () {

                const { voteToken, _anigail, _bernard } = await loadFixture(createGeneralAssemblyWithVoteToken);

                const lockupTime = await voteToken.lockupTime();

                await voteToken.connect(_anigail).claimVoteTokens();
                const anigailBalanceAfterClaim = await voteToken.balanceOf(_anigail.address);

                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(lockupTime)+1]);
                await hre.network.provider.send("evm_mine");

                await expect(
                    voteToken.connect(_anigail).transfer(_bernard.address, anigailBalanceAfterClaim)
                ).to.be.revertedWithCustomError(voteToken, "VoteTokenLockedUp").withArgs(lockupTime);

            });

        });

        describe("General Assembly Resolutions", function() {

            it(`Restrict Resolution Creation to Syndic and Property Owners`, async function () {

                const { generalAssembly, _admin } = await loadFixture(claimVoteTokensForGeneralAssembly);

                await expect(
                    generalAssembly.connect(_admin).createResolution("Titre1", "Description1")
                ).to.be.revertedWithCustomError(generalAssembly, "NotCopropertyMember").withArgs(_admin.address);
            });

            it(`Allow Syndic and Property Owners to Create Resolutions`, async function () {

                const { generalAssembly, _syndic, _anigail } = await loadFixture(claimVoteTokensForGeneralAssembly);

                const resolutionCountBefore = await generalAssembly.getResolutionCount();

                await generalAssembly.connect(_syndic).createResolution("Titre1", "Description1");
                await generalAssembly.connect(_anigail).createResolution("Titre2", "Description2");

                const resolutionCountAfter = await generalAssembly.getResolutionCount();

                expect(resolutionCountAfter).to.be.equal(Number(resolutionCountBefore) + 2);
            });

            it(`Prevent Resolution Creation After Lockup Time`, async function () {

                const { generalAssembly, _anigail } = await loadFixture(claimVoteTokensForGeneralAssembly);

                const lockupTime = await generalAssembly.lockup();
                
                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(lockupTime) + 1]);
                await hre.network.provider.send("evm_mine"); 

                const now = (await ethers.provider.getBlock("latest")).timestamp;

                await expect(
                    generalAssembly.connect(_anigail).createResolution("Titre1", "Description1")
                ).to.be.revertedWithCustomError(generalAssembly, "LockupAlreadyStarted").withArgs(Number(now)+1, lockupTime);
            });

            it(`Block Creation of Resolutions with Invalid Title Lengths`, async function () {

                const { generalAssembly, _anigail } = await loadFixture(claimVoteTokensForGeneralAssembly);

                await expect(
                    generalAssembly.connect(_anigail).createResolution("", "Description1")
                ).to.be.revertedWithCustomError(generalAssembly, "TitleTooShort");

                await expect(
                    generalAssembly.connect(_anigail).createResolution("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "Description1")
                ).to.be.revertedWithCustomError(generalAssembly, "TitleTooLong");
            });

            it(`Block Creation of Resolutions with Invalid Description Lengths`, async function () {

                const { generalAssembly, _anigail } = await loadFixture(claimVoteTokensForGeneralAssembly);

                await expect(
                    generalAssembly.connect(_anigail).createResolution("Title1", "")
                ).to.be.revertedWithCustomError(generalAssembly, "DescriptionTooShort");

                await expect(
                    generalAssembly.connect(_anigail).createResolution("Title1", "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
                ).to.be.revertedWithCustomError(generalAssembly, "DescriptionTooLong");
            });

            it(`Emit 'ResolutionCreated' Event Upon Resolution Creation`, async function () {

                const { generalAssembly, _syndic } = await loadFixture(claimVoteTokensForGeneralAssembly);

                const expectedResolutionId = 0;

                await expect(
                    generalAssembly.connect(_syndic).createResolution("Titre1", "Description1")
                ).to.be.emit(generalAssembly, "ResolutionCreated").withArgs(expectedResolutionId, _syndic.address);
            });

            it(`Initially Set Resolutions Vote Type to 'Undetermined'`, async function () {

                const { generalAssembly } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                const undeterminedVoteType = 0;

                const resolutionID = 0;
                const resolution = await generalAssembly.getResolution(resolutionID);

                expect(resolution.voteType).to.be.equal(undeterminedVoteType);
            });

            it(`Allow Syndic to Specify Resolutions Vote Type`, async function () {

                const { generalAssembly, _syndic } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                const resolutionID = 0;
                const unanimityVoteType = 1;

                let resolution = await generalAssembly.getResolution(resolutionID);
                const voteTypeBefore = resolution.voteType;

                await generalAssembly.connect(_syndic).setResolutionVoteType(resolutionID, unanimityVoteType);

                resolution = await generalAssembly.getResolution(resolutionID);
                const voteTypeAfter = resolution.voteType;

                expect(voteTypeBefore).to.be.lessThan(voteTypeAfter);
                expect(voteTypeAfter).to.be.equal(unanimityVoteType);
            });

            it(`Prevent Others from Setting Resolution Vote Types`, async function () {

                const { generalAssembly, _admin } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                const resolutionID = 0;
                const unanimityVoteType = 1;

                await expect(
                    generalAssembly.connect(_admin).setResolutionVoteType(resolutionID, unanimityVoteType)
                ).to.be.revertedWithCustomError(generalAssembly, "NotCopropertySyndic").withArgs(_admin.address);
            });

            it(`Block Setting Resolution Vote Types Post Lockup Time`, async function () {

                const { generalAssembly, _syndic } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                const lockupTime = await generalAssembly.lockup();
                
                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(lockupTime) + 1]);
                await hre.network.provider.send("evm_mine"); 

                const now = (await ethers.provider.getBlock("latest")).timestamp;

                const resolutionID = 0;
                const unanimityVoteType = 1;

                await expect(
                    generalAssembly.connect(_syndic).setResolutionVoteType(resolutionID, unanimityVoteType)
                ).to.be.revertedWithCustomError(generalAssembly, "LockupAlreadyStarted").withArgs(Number(now)+1, lockupTime);
            });

            it(`Prohibit Setting Vote Type on Non-Existent Resolutions`, async function () {

                const { generalAssembly, _syndic } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                const resolutionID = 10;
                const unanimityVoteType = 1;

                await expect(
                    generalAssembly.connect(_syndic).setResolutionVoteType(resolutionID, unanimityVoteType)
                ).to.be.revertedWithCustomError(generalAssembly, "ResolutionNotFound").withArgs(resolutionID);
            });

            it(`Prohibit Setting Vote Type on Undefined Resolutions`, async function () {

                const { generalAssembly, _syndic } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                const resolutionID = 0;
                const undefinedVoteType = 0;

                await expect(
                    generalAssembly.connect(_syndic).setResolutionVoteType(resolutionID, undefinedVoteType)
                ).to.be.revertedWithCustomError(generalAssembly, "CannotSetResolutionVoteTypeToUndefined").withArgs(resolutionID);
            });

            it(`Emit 'ResolutionVoteTypeSet' Event When Vote Type is Set by Syndic`, async function () {

                const { generalAssembly, _syndic } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                const resolutionID = 0;
                const unanimityVoteType = 1;

                await expect(
                    generalAssembly.connect(_syndic).setResolutionVoteType(resolutionID, unanimityVoteType)
                ).to.emit(generalAssembly, "ResolutionVoteTypeSet").withArgs(resolutionID, 0, unanimityVoteType);
            });

        });

        describe("General Assembly Amendments", function() {

            it(`Permit Syndic and Property Owners to Create Amendments`, async function () {

                const { generalAssembly, _syndic, _anigail } = await loadFixture(claimVoteTokensForGeneralAssembly);

                const emendmentCountBefore = await generalAssembly.getAmendmentCount();

                await generalAssembly.connect(_syndic).createResolution("Titre1", "Description1");

                const resolutionID = 0;

                await generalAssembly.connect(_anigail).createAmendment(resolutionID, "Amendment1");

                const emendmentCountAfter = await generalAssembly.getAmendmentCount();

                expect(emendmentCountAfter).to.be.equal(Number(emendmentCountBefore) + 1);
            });

            it(`Restrict Amendment Creation to Syndic and Property Owners`, async function () {

                const { generalAssembly, _admin, _syndic } = await loadFixture(claimVoteTokensForGeneralAssembly);
                
                await generalAssembly.connect(_syndic).createResolution("Titre1", "Description1");

                const resolutionID = 0;

                await expect(
                    generalAssembly.connect(_admin).createAmendment(resolutionID, "Amendment1")
                ).to.be.revertedWithCustomError(generalAssembly, "NotCopropertyMember").withArgs(_admin.address);
            });

            it(`Block Amendment Creation on Non-Existent Resolutions`, async function () {

                const { generalAssembly, _syndic } = await loadFixture(claimVoteTokensForGeneralAssembly);
                
                const resolutionID = 10;

                await expect(
                    generalAssembly.connect(_syndic).createAmendment(resolutionID, "Amendment1")
                ).to.be.revertedWithCustomError(generalAssembly, "ResolutionNotFound").withArgs(resolutionID);
            });

            it(`Prohibit Amendment Creation Post Lockup Time`, async function () {

                const { generalAssembly, _anigail } = await loadFixture(claimVoteTokensForGeneralAssembly);

                const lockupTime = await generalAssembly.lockup();

                await generalAssembly.connect(_anigail).createResolution("Titre1", "Description1");

                const resolutionId = 0;
                
                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(lockupTime) + 1]);
                await hre.network.provider.send("evm_mine");

                const now = (await ethers.provider.getBlock("latest")).timestamp;

                await expect(
                    generalAssembly.connect(_anigail).createAmendment(resolutionId, "Amendment1")
                ).to.be.revertedWithCustomError(generalAssembly, "LockupAlreadyStarted").withArgs(Number(now)+1, lockupTime);
            });

            it(`Ensure Amendments Have Valid Description Length`, async function () {

                const { generalAssembly, _anigail } = await loadFixture(claimVoteTokensForGeneralAssembly);

                await generalAssembly.connect(_anigail).createResolution("Titre1", "Description1");

                const resolutionId = 0;

                await expect(
                    generalAssembly.connect(_anigail).createAmendment(resolutionId, "")
                ).to.be.revertedWithCustomError(generalAssembly, "DescriptionTooShort");

                await expect(
                    generalAssembly.connect(_anigail).createAmendment(resolutionId, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
                ).to.be.revertedWithCustomError(generalAssembly, "DescriptionTooLong");
            });

            it(`Emit 'AmendmentCreated' Event on Amendment Creation`, async function () {

                const { generalAssembly, _anigail } = await loadFixture(claimVoteTokensForGeneralAssembly);

                await generalAssembly.connect(_anigail).createResolution("Titre1", "Description1");

                const resolutionId = 0;
                const expectedAmendmentId = 0;

                await expect(
                    generalAssembly.connect(_anigail).createAmendment(resolutionId, "Description1")
                ).to.be.emit(generalAssembly, "AmendmentCreated").withArgs(expectedAmendmentId, resolutionId, _anigail.address);
            });

            it(`Allow Retrieval of Amendment Count`, async function () {

                const { generalAssembly } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                expect(await generalAssembly.getAmendmentCount()).to.be.equal(1);
            });

            it(`Allow Retrieval of Specific Amendments`, async function () {

                const { generalAssembly } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                let amendmentID = 0;

                await expect(
                    generalAssembly.getAmendment(amendmentID)
                ).not.to.be.revertedWithCustomError(generalAssembly, "AmendmentNotFound");
                
                amendmentID = 15;

                await expect(
                    generalAssembly.getAmendment(amendmentID)
                ).to.be.revertedWithCustomError(generalAssembly, "AmendmentNotFound").withArgs(amendmentID);
            });

        });

        describe("General Assembly Votes", function() {

            it(`Block Non-Vote Token Holders from Voting`, async function () {

                const { generalAssembly, _admin } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                const resolutionID = 0;
                const ballotChoice = true;

                await expect(
                    generalAssembly.connect(_admin).vote(resolutionID, ballotChoice)
                ).to.be.revertedWithCustomError(generalAssembly, "NotPropertySharesOwner").withArgs(_admin.address);
            });

            it(`Prevent Voting Before Designated Vote Times`, async function () {

                const { generalAssembly, _anigail, voteStartTime } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

                const resolutionID = 0;
                const ballotChoice = true;

                const now = (await ethers.provider.getBlock("latest")).timestamp;

                await expect(
                    generalAssembly.connect(_anigail).vote(resolutionID, ballotChoice)
                ).to.be.revertedWithCustomError(generalAssembly, "VotingSessionNotStartedYet").withArgs(Number(now)+1, voteStartTime);

            });

            it(`Prevent Voting After Designated Vote Times`, async function () {

                const { generalAssembly, _anigail } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

                const resolutionID = 0;
                const ballotChoice = true;

                const voteEndTime = await generalAssembly.voteEnd();

                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(voteEndTime) + 1]);
                await hre.network.provider.send("evm_mine"); 

                const now = (await ethers.provider.getBlock("latest")).timestamp;

                await expect(
                    generalAssembly.connect(_anigail).vote(resolutionID, ballotChoice)
                ).to.be.revertedWithCustomError(generalAssembly, "VotingSessionAlreadyEnded").withArgs(Number(now)+1, voteEndTime);

            });

            it(`Forbid Voting on Non-Existent Resolutions`, async function () {

                const { generalAssembly, voteStartTime, _anigail } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

                const resolutionID = 15;
                const ballotChoice = true;

                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(voteStartTime) + 1]);
                await hre.network.provider.send("evm_mine"); 

                await expect(
                    generalAssembly.connect(_anigail).vote(resolutionID, ballotChoice)
                ).to.be.revertedWithCustomError(generalAssembly, "ResolutionNotFound").withArgs(resolutionID);

            });

            it(`Forbid Voting on Repeated Resolutions`, async function () {

                const { generalAssembly, voteStartTime, _anigail } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

                const resolutionID = 0;
                const ballotChoice = true;

                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(voteStartTime) + 1]);
                await hre.network.provider.send("evm_mine"); 

                await generalAssembly.connect(_anigail).vote(resolutionID, ballotChoice);

                await expect(
                    generalAssembly.connect(_anigail).vote(resolutionID, ballotChoice)
                ).to.be.revertedWithCustomError(generalAssembly, "AlreadyVotedForResolution").withArgs(resolutionID, _anigail.address);

            });

            it(`Forbid Voting on Undefined Vote Type Resolutions`, async function () {

                const { generalAssembly, voteStartTime, _anigail } = await loadFixture(createResolutionsAndAmendmentsInGeneralAssembly);

                const resolutionID = 0;
                const ballotChoice = false;

                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(voteStartTime) + 1]);
                await hre.network.provider.send("evm_mine"); 

                await expect(
                    generalAssembly.connect(_anigail).vote(resolutionID, ballotChoice)
                ).to.be.revertedWithCustomError(generalAssembly, "CannotVoteForResolutionWithUndefinedVoteType").withArgs(resolutionID);

            });

            it(`Allow Vote Token Holders to Cast Votes`, async function () {

                const { generalAssembly, voteToken, voteStartTime, _anigail, _bernard } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(voteStartTime) + 1]);
                await hre.network.provider.send("evm_mine"); 

                const resolutionID = 0;

                const anigailBalance = await voteToken.balanceOf(_anigail.address);
                const bernardBalance = await voteToken.balanceOf(_bernard.address);

                const resolutionBeforeVotes = await generalAssembly.getResolution(resolutionID);

                await generalAssembly.connect(_anigail).vote(resolutionID, true);
                await generalAssembly.connect(_bernard).vote(resolutionID, false);

                const resolutionAfterVotes = await generalAssembly.getResolution(resolutionID);

                await expect(resolutionAfterVotes.yesShares).to.be.equal(resolutionBeforeVotes.yesShares + BigInt(anigailBalance));
                await expect(resolutionAfterVotes.yesCount).to.be.equal(resolutionBeforeVotes.yesCount + BigInt(1));
                await expect(resolutionAfterVotes.noShares).to.be.equal(resolutionBeforeVotes.noShares + BigInt(bernardBalance));
                await expect(resolutionAfterVotes.noCount).to.be.equal(resolutionBeforeVotes.noCount + BigInt(1));

                expect(await generalAssembly.hasVoted(resolutionID, _anigail.address)).to.be.true;
                expect(await generalAssembly.hasVoted(resolutionID, _bernard.address)).to.be.true;

            });

            it(`Emit 'VoteCast' Event for Each Vote Cast`, async function () {

                const { generalAssembly, voteStartTime, _anigail } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(voteStartTime) + 1]);
                await hre.network.provider.send("evm_mine"); 

                const resolutionID = 0;
                const ballotChoice = true;

                expect(
                    await generalAssembly.connect(_anigail).vote(resolutionID, ballotChoice)
                ).to.emit(generalAssembly, "VoteCast").withArgs(_anigail.address, resolutionID, ballotChoice);

            });

        });

        describe("Vote Results", function() {

            it(`Prohibit Vote Result Queries Before Session End`, async function () {

                const { generalAssembly, voteStartTime, _anigail } = await loadFixture(setVoteTypesForGeneralAssemblyResolutions);

                await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(voteStartTime) + 1]);
                await hre.network.provider.send("evm_mine"); 

                const resolutionID = 0;

                await expect(
                    generalAssembly.connect(_anigail).getVoteResult(resolutionID)
                ).to.be.revertedWithCustomError(generalAssembly, "VotingSessionNotEndedYet")

            });

            it(`Enable Vote Result Queries Post Session`, async function () {

                const { generalAssembly, _anigail } = await loadFixture(completeVotingSessionWithPositiveOutcomeInGeneralAssembly);

                const resolutionID = 0;

                await expect(
                    generalAssembly.connect(_anigail).getVoteResult(resolutionID)
                ).not.to.be.reverted;

            });

            it(`Block Queries for Non-Existent Resolution Vote Results`, async function () {

                const { generalAssembly, _anigail } = await loadFixture(completeVotingSessionWithPositiveOutcomeInGeneralAssembly);

                const resolutionID = 10;

                await expect(
                    generalAssembly.connect(_anigail).getVoteResult(resolutionID)
                ).to.be.revertedWithCustomError(generalAssembly, "ResolutionNotFound").withArgs(resolutionID);

            });

            describe("Tallies with various outcomes", function() {

                describe("Tallies Without Equality", function() {

                    describe("Positive Outcome", function() {
                        
                        it(`Confirm Unanimity Vote Type for Positive Outcome`, async function () {
    
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithPositiveOutcomeInGeneralAssembly);
    
                            const resolutionID = 0;
    
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(COPROPERTY_TOTAL_SUPPLY);
                            await expect(voteResult.noShares).to.be.equal(0);
                            await expect(voteResult.yesCount).to.be.equal(5);
                            await expect(voteResult.noCount).to.be.equal(0);
                            await expect(voteResult.tiebreaker).to.be.equal(0);
                            await expect(voteResult.equality).to.be.false;
                            await expect(voteResult.approved).to.be.true;
    
                        });
    
                        it(`Confirm Simple Majority Vote Type for Positive Outcome`, async function () {
    
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithPositiveOutcomeInGeneralAssembly);
    
                            const resolutionID = 1;
    
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(6000);
                            await expect(voteResult.noShares).to.be.equal(2000);
                            await expect(voteResult.yesCount).to.be.equal(3);
                            await expect(voteResult.noCount).to.be.equal(1);
                            await expect(voteResult.tiebreaker).to.be.equal(0);
                            await expect(voteResult.equality).to.be.false;
                            await expect(voteResult.approved).to.be.true;
    
                        });
    
                        it(`Confirm Absolute Majority Vote Type for Positive Outcome`, async function () {
    
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithPositiveOutcomeInGeneralAssembly);
    
                            const resolutionID = 2;
    
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(6000);
                            await expect(voteResult.noShares).to.be.equal(2000);
                            await expect(voteResult.yesCount).to.be.equal(3);
                            await expect(voteResult.noCount).to.be.equal(1);
                            await expect(voteResult.tiebreaker).to.be.equal(0);
                            await expect(voteResult.equality).to.be.false;
                            await expect(voteResult.approved).to.be.true;
    
                        });
    
                        it(`Confirm Double Majority Vote Type for Positive Outcome`, async function () {
    
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithPositiveOutcomeInGeneralAssembly);
    
                            const resolutionID = 3;
    
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(6000);
                            await expect(voteResult.noShares).to.be.equal(2000);
                            await expect(voteResult.yesCount).to.be.equal(3);
                            await expect(voteResult.noCount).to.be.equal(1);
                            await expect(voteResult.tiebreaker).to.be.equal(0);
                            await expect(voteResult.equality).to.be.false;
                            await expect(voteResult.approved).to.be.true;
    
                        });
    
                    });
    
                    describe("Negative Outcome", function() {
    
                        it(`Confirm Unanimity Vote Type for Negative Outcome`, async function () {
                        
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithNegativeOutcomeInGeneralAssembly);
    
                            const resolutionID = 0;
    
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(0);
                            await expect(voteResult.noShares).to.be.equal(COPROPERTY_TOTAL_SUPPLY);
                            await expect(voteResult.yesCount).to.be.equal(0);
                            await expect(voteResult.noCount).to.be.equal(5);
                            await expect(voteResult.tiebreaker).to.be.equal(0);
                            await expect(voteResult.equality).to.be.false;
                            await expect(voteResult.approved).to.be.false;
    
                        });
    
                        it(`Confirm Simple Majority Vote Type for Negative Outcome`, async function () {
    
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithNegativeOutcomeInGeneralAssembly);
    
                            const resolutionID = 1;
    
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(2000);
                            await expect(voteResult.noShares).to.be.equal(6000);
                            await expect(voteResult.yesCount).to.be.equal(1);
                            await expect(voteResult.noCount).to.be.equal(3);
                            await expect(voteResult.tiebreaker).to.be.equal(0);
                            await expect(voteResult.equality).to.be.false;
                            await expect(voteResult.approved).to.be.false;
    
                        });
    
                        it(`Confirm Absolute Majority Vote Type for Negative Outcome`, async function () {
    
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithNegativeOutcomeInGeneralAssembly);
    
                            const resolutionID = 2;
    
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(2000);
                            await expect(voteResult.noShares).to.be.equal(6000);
                            await expect(voteResult.yesCount).to.be.equal(1);
                            await expect(voteResult.noCount).to.be.equal(3);
                            await expect(voteResult.tiebreaker).to.be.equal(0);
                            await expect(voteResult.equality).to.be.false;
                            await expect(voteResult.approved).to.be.false;
    
                        });
    
                        it(`Confirm Double Majority Vote Type for Negative Outcome`, async function () {
    
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithNegativeOutcomeInGeneralAssembly);
    
                            const resolutionID = 3;
    
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(2000);
                            await expect(voteResult.noShares).to.be.equal(6000);
                            await expect(voteResult.yesCount).to.be.equal(1);
                            await expect(voteResult.noCount).to.be.equal(3);
                            await expect(voteResult.tiebreaker).to.be.equal(0);
                            await expect(voteResult.equality).to.be.false;
                            await expect(voteResult.approved).to.be.false;
    
                        });
    
                        it(`Confirm Double Majority with Unreached Property Shares Threshold for Negative Outcome`, async function () {
    
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithNegativeOutcomeInGeneralAssembly);
    
                            const resolutionID = 3;
    
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(2000);
                            await expect(voteResult.noShares).to.be.equal(6000);
                            await expect(voteResult.yesCount).to.be.equal(1);
                            await expect(voteResult.noCount).to.be.equal(3);
                            await expect(voteResult.tiebreaker).to.be.equal(0);
                            await expect(voteResult.equality).to.be.false;
                            await expect(voteResult.approved).to.be.false;
    
                        });
    
                        it(`Confirm Double Majority with Unreached Property Owner Count Threshold for Negative Outcome`, async function () {
    
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithNegativeOutcomeDueToInsufficientOwnerParticipation);
    
                            const resolutionID = 3;
    
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(5000);
                            await expect(voteResult.noShares).to.be.equal(3000);
                            await expect(voteResult.yesCount).to.be.equal(1);
                            await expect(voteResult.noCount).to.be.equal(3);
                            await expect(voteResult.tiebreaker).to.be.equal(0);
                            await expect(voteResult.equality).to.be.false;
                            await expect(voteResult.approved).to.be.false;
    
                        });
    
                    });
    
                });
    
                describe("Tallies With Equality", function() {
    
                    describe("Without Fulfilled Tiebreaker", function() {
    
                        it(`Revert Tally for Unresolved Equal Vote Without Fulfilled Tiebreaker`, async function () {
    
                            const { generalAssembly } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                            
                            const simpleMajorityResolutionID   = 1;
                            const absoluteMajorityResolutionID = 2;
                            const doubleMajorityResolutionID   = 3;
    
                            await expect(
                                generalAssembly.getVoteResult(simpleMajorityResolutionID)
                            ).to.be.revertedWithCustomError(generalAssembly, "TiebreakerRequestNotFulfilled");
    
                            await expect(
                                generalAssembly.getVoteResult(absoluteMajorityResolutionID)
                            ).to.be.revertedWithCustomError(generalAssembly, "TiebreakerRequestNotFulfilled");
    
                            await expect(
                                generalAssembly.getVoteResult(doubleMajorityResolutionID)
                            ).to.be.revertedWithCustomError(generalAssembly, "TiebreakerRequestNotFulfilled");
    
                        });
    
                    });
    
                    describe("With Fulfilled Tiebreaker", function() {
    
                        it(`Validate Simple Majority Vote Type with Fulfilled Tiebreaker`, async function () {
    
                            const { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
    
                            const txRequest =  await generalAssembly.connect(_syndic).requestTiebreaker();
                            await txRequest.wait();
    
                            const requestID = 1;
                            const txFulfill = await VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target);
                            await txFulfill.wait();
    
                            const resolutionID = 1;
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(4000);
                            await expect(voteResult.noShares).to.be.equal(4000);
                            await expect(voteResult.yesCount).to.be.equal(2);
                            await expect(voteResult.noCount).to.be.equal(2);
                            await expect(voteResult.tiebreaker).to.be.greaterThan(0);
                            await expect(voteResult.equality).to.be.true;
    
                        });
    
                        it(`Validate Absolute Majority Vote Type with Fulfilled Tiebreaker`, async function () {
    
                            const { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
    
                            const txRequest =  await generalAssembly.connect(_syndic).requestTiebreaker();
                            await txRequest.wait();
    
                            const requestID = 1;
                            const txFulfill = await VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target);
                            await txFulfill.wait();
    
                            const resolutionID = 2;
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(4000);
                            await expect(voteResult.noShares).to.be.equal(4000);
                            await expect(voteResult.yesCount).to.be.equal(2);
                            await expect(voteResult.noCount).to.be.equal(2);
                            await expect(voteResult.tiebreaker).to.be.greaterThan(0);
                            await expect(voteResult.equality).to.be.true;
    
                        });
    
                        it(`Validate Double Majority Vote Type with Fulfilled Tiebreaker`, async function () {
    
                            const { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
    
                            const txRequest =  await generalAssembly.connect(_syndic).requestTiebreaker();
                            await txRequest.wait();
    
                            const requestID = 1;
                            const txFulfill = await VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target);
                            await txFulfill.wait();
    
                            const resolutionID = 2;
                            const voteResult = await generalAssembly.getVoteResult(resolutionID);
    
                            await expect(voteResult.resolutionID).to.be.equal(resolutionID);
                            await expect(voteResult.yesShares).to.be.equal(4000);
                            await expect(voteResult.noShares).to.be.equal(4000);
                            await expect(voteResult.yesCount).to.be.equal(2);
                            await expect(voteResult.noCount).to.be.equal(2);
                            await expect(voteResult.tiebreaker).to.be.greaterThan(0);
                            await expect(voteResult.equality).to.be.true;
    
                        });
    
                    });
    
                });
                    
            });

        });

        describe("General Assembly Tiebreak", function() {

            describe("Tiebreaker Request", function() {

                it(`Emit 'TiebreakerRequested' Event in General Assembly Contract`, async function () {

                    const { generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                    
                    const now = (await ethers.provider.getBlock("latest")).timestamp;

                    await expect(
                        generalAssembly.connect(_syndic).requestTiebreaker()
                    ).to.emit(generalAssembly, "TiebreakerRequested").withArgs(Number(now)+1);

                });

                it(`Emit 'RandomNumberRequested' Event in Syndx Contrac`, async function () {

                    const { syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                    
                    await expect(
                        generalAssembly.connect(_syndic).requestTiebreaker()
                    ).to.emit(syndx, "RandomNumberRequested").withArgs(generalAssembly.target);

                });

                it(`Prohibit Duplicate Random Number Requests by the Same Consumer in Syndx Contract`, async function () {

                    const { syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                    
                    await generalAssembly.connect(_syndic).requestTiebreaker();

                    await expect(
                        generalAssembly.connect(_syndic).requestTiebreaker()
                    ).to.be.revertedWithCustomError(syndx, "RandomNumberRequestAlreadyMade").withArgs(1);

                });

                it(`Emit 'RandomWordsRequested' Event Once Chainlink Service Receives the Request in Syndx Contract`, async function () {

                    const { syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                    
                    await expect(
                        generalAssembly.connect(_syndic).requestTiebreaker()
                    ).to.emit(syndx, "RandomWordsRequested").withArgs(1);

                });

            });

            describe("Tiebreaker Request Fulfillment", function() {

                it(`Emit 'RandomWordsFulfilled' Event Once Chainlink Service Fulfills the Request`, async function () {

                    const { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                    
                    await generalAssembly.connect(_syndic).requestTiebreaker();

                    const requestID = 1;

                    await expect(
                        VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target)
                    ).to.emit(syndx, "RandomWordsFulfilled").withArgs(1);

                });

                it(`Prevent Chainlink Service from Fulfilling Requests with Empty Random Words`, async function () {

                    const { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                    
                    await generalAssembly.connect(_syndic).requestTiebreaker();

                    const requestID = 1;

                    await expect(
                        VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target)
                    ).not.to.be.revertedWithCustomError(syndx, "EmptyChainlinkRandomWords");

                });

                it(`Block Chainlink Service from Fulfilling Random Words for Already Fulfilled Requests`, async function () {

                    const { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                    
                    await generalAssembly.connect(_syndic).requestTiebreaker();

                    const requestID = 1;

                    await expect(
                        VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target)
                    ).not.to.be.revertedWithCustomError(syndx, "RequestAlreadyFullfilled");

                });

                it(`Disallow Overwriting an Already Fulfilled Tiebreaker in a General Assembly`, async function () {

                    const { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                    
                    await generalAssembly.connect(_syndic).requestTiebreaker();

                    const requestID = 1;

                    await expect(
                        VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target)
                    ).not.to.be.revertedWithCustomError(generalAssembly, "TiebreakerAlreadyFulfilled");

                });

                it(`Emit 'TiebreakerFulfilled' Event When Syndx Contract Provides Random Number to General Assembly`, async function () {

                    const { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                    
                    await generalAssembly.connect(_syndic).requestTiebreaker();

                    const requestID = 1;

                    await expect(
                        VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target)
                    ).to.emit(generalAssembly, "TiebreakerFulfilled");

                });

                it(`Should Ensure a Non-Zero Tiebreaker Number Is Provided to the General Assembly`, async function () {

                    const { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                    
                    await generalAssembly.connect(_syndic).requestTiebreaker();

                    const requestID = 1;

                    await expect(
                        VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target)
                    ).not.to.be.revertedWithCustomError(generalAssembly, "TiebreakerCannotBeFulfilledWithZero");

                    expect(await generalAssembly.tiebreaker()).to.be.greaterThan(0);

                });

            });

        });

        describe("Random Number Request Management", function() {

            it(`Block Syndx Owner from Using Zero Address to Reset a Random Number Request`, async function () {

                const { syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                
                await generalAssembly.connect(_syndic).requestTiebreaker();
                
                await expect(
                    syndx.resetRandomNumberRequest(ADDRESS_ZERO)
                ).to.be.revertedWithCustomError(syndx, "AddressZeroNotAllowed");

            });

            it(`Forbid Non-Owners of Syndx Contract from Resetting Random Number Requests`, async function () {

                const { syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                
                await generalAssembly.connect(_syndic).requestTiebreaker();

                await expect(
                    syndx.connect(_syndic).resetRandomNumberRequest(generalAssembly.target)
                ).to.be.revertedWithCustomError(syndx, "OwnableUnauthorizedAccount").withArgs(_syndic.address);

            });

            it(`Prevent Resetting Non-Existent Random Number Requests by Syndx Contract Owner`, async function () {

                const { syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                
                await generalAssembly.connect(_syndic).requestTiebreaker();

                await expect(
                    syndx.resetRandomNumberRequest(generalAssembly.target)
                ).not.to.be.revertedWithCustomError(syndx, "ConsumerRequestNotFound");

            });

            it(`Disallow Resetting Already Fulfilled Random Number Requests`, async function () {

                const { VRFCoordinatorV2Mock, syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                
                await generalAssembly.connect(_syndic).requestTiebreaker();

                const requestID = 1;

                await VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target);

                await expect(
                    syndx.resetRandomNumberRequest(generalAssembly.target)
                ).to.be.revertedWithCustomError(syndx, "ConsumerRequestAlreadyFulfilled").withArgs(generalAssembly.target, requestID);

            });

            it(`Prohibit Resetting Unfulfilled Random Number Requests Before a Set Block Minimum`, async function () {

                const { syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                
                await generalAssembly.connect(_syndic).requestTiebreaker();
                const blocknumber = Number((await ethers.provider.getBlock("latest")).number);
                const lockupLimitBlockNumber = blocknumber + RANDMNESS_REQUEST_BLOCKS_LOCKUP_BEFORE_RETRY;

                await expect(
                    syndx.resetRandomNumberRequest(generalAssembly.target)
                ).to.be.revertedWithCustomError(syndx, "RandomNumberRequestLockupNotEndedYet").withArgs(blocknumber + 1, lockupLimitBlockNumber);

            });

            it(`Permit Syndx Contract Owner to Reset Unfulfilled Random Number Requests Post Minimum Block Requirement`, async function () {

                const { syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                
                const tx = await generalAssembly.connect(_syndic).requestTiebreaker();
                await tx.wait(1);

                const blocknumber = Number((await ethers.provider.getBlock("latest")).number);
                const lockupLimitBlockNumber = blocknumber + RANDMNESS_REQUEST_BLOCKS_LOCKUP_BEFORE_RETRY;

                for (let i = 0; i <= lockupLimitBlockNumber; ++i) {
                    await hre.network.provider.send("evm_mine");
                }
                
                await expect(
                    syndx.resetRandomNumberRequest(generalAssembly.target)
                ).not.to.be.revertedWithCustomError(syndx, "RandomNumberRequestLockupNotEndedYet");

            });

            it(`Allow Access to the State of Consumer Random Number Requests`, async function () {

                const { syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                
                await generalAssembly.connect(_syndic).requestTiebreaker();
                const blocknumber = Number((await ethers.provider.getBlock("latest")).number);

                const consumerRequest = await syndx.getConsumerRandomNumberRequest(generalAssembly.target);
                
                const generalAssemblyContractType = 3;

                expect(consumerRequest.authorized).to.be.equal(true);
                expect(consumerRequest.requestID).to.be.equal(1);
                expect(consumerRequest.requestBlockNumber).to.be.equal(blocknumber);
                expect(consumerRequest.consumerType).to.be.equal(generalAssemblyContractType);
            });

            it(`Emit 'RandomNumberRequestReset' Event on Reset of Unfulfilled Random Number Request by Syndx Owner`, async function () {

                const { syndx, generalAssembly, _syndic } = await loadFixture(completeVotingSessionWithEqualitiesInGeneralAssembly);
                
                await generalAssembly.connect(_syndic).requestTiebreaker();
                const blocknumber = Number((await ethers.provider.getBlock("latest")).number);
                const lockupLimitBlockNumber = blocknumber + RANDMNESS_REQUEST_BLOCKS_LOCKUP_BEFORE_RETRY;

                for (let i = 0; i <= lockupLimitBlockNumber; ++i) {
                    await hre.network.provider.send("evm_mine");
                }
                
                await expect(
                    syndx.resetRandomNumberRequest(generalAssembly.target)
                ).emit(syndx, "RandomNumberRequestReset").withArgs(1, generalAssembly.target);

            });

        });

    });

});