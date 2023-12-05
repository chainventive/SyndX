// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
require("@nomicfoundation/hardhat-toolbox");
const { writeOutputFile } = require('../helpers/fileOutput');

const _config = {
  chainlink : {
    vrf: {
      sepolia: {
        subscriptionID: 7287,
        wordCountPerRequest: 1,
        requestConfirmations: 3,
        callbackGasLimit: 100000,
        coordinatorAddress: '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625',
        administratorAccount: '0xb91fb1a124d2673eeaa9ec5682444ad88f0cdb6f',
        gaslaneKeyhash: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
      }
    }
  }
}

const _context = {
  deployer: null,
  network: {
    name: null,
    local: null,
  },
  chainlink : {
    vrf: {
      subscriptionID: null,
      coordinatorAddress: null,
    }
  },
  contracts : {
    VRFCoordinatorV2Mock: null,
    syndx: null,
    tokenFactory: null,
  }
}

async function main() {
  console.log(); // DO NOT REMOVE

  /* Check network and load deployer account */
  console.log();
  console.log(`# NETWORK CHECKS`);
  console.log();

  const [ deployer ] = await ethers.getSigners();
  _context.deployer = deployer;
  _context.network.name = hre.network.name;
  _context.network.local = hre.network.name == 'hardhat' || hre.network.name == 'localhost';

  console.log(`  > Network: ${ _context.network.name } (${ _context.network.local ? 'local env' : 'live env' })`);
  console.log(`  > Deployer account: ${ _context.deployer.address }`);
  console.log();

  /* Deploy Chainlink VRF Mock On Local Env. */
  console.log();
  console.log(`# CHAINLINK VRF SERVICE`);
  console.log();

  if (_context.network.local) {

    // Deploy the Chainlink VRF Coordinator Mock
    const GAS_PRICE_LINK = "1000000000";
    const BASE_FEE = "100000000000000000";
    const VRFCoordinatorV2MockFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    const VRFCoordinatorV2Mock = await VRFCoordinatorV2MockFactory.deploy(BASE_FEE, GAS_PRICE_LINK);
    _context.contracts.VRFCoordinatorV2Mock = VRFCoordinatorV2Mock;
    _context.chainlink.vrf.coordinatorAddress = VRFCoordinatorV2Mock.target;
    console.log(`  > Chainlink VRFCoordinatorV2Mock contract deployed at address ${ _context.chainlink.vrf.coordinatorAddress }`);
    console.log();

    // Create the chainlink VRF subscription
    let transaction = await VRFCoordinatorV2Mock.connect(deployer).createSubscription();
    let transactionReceipt = await transaction.wait(1);
    console.log(`    - created new subscription to mock coordinator with deployer account ${ _context.deployer.address }`);

    // Fund the subscription
    const fundAmount = "1000000000000000000";
    _context.chainlink.vrf.subscriptionID = transactionReceipt.logs[0].args[0];
    await VRFCoordinatorV2Mock.connect(deployer).fundSubscription(_context.chainlink.vrf.subscriptionID, fundAmount);
    console.log(`    - subscription to mock coordinator funded (subscriptionID: ${ _context.chainlink.vrf.subscriptionID }`);

  }
  else {

    // Inject chainlink sepolia config into the context
    _context.chainlink.vrf.coordinatorAddress = _config.chainlink.vrf.sepolia.coordinatorAddress;
    _context.chainlink.vrf.subscriptionID = _config.chainlink.vrf.sepolia.subscriptionID;

    // Output chainlink VRF sepolia config
    console.log(`  > Chainlink VRF configurations`);
    console.log();
    console.log(`    - subscription ID        : ${ _config.chainlink.vrf.sepolia.subscriptionID }`);
    console.log(`    - word count per request : ${ _config.chainlink.vrf.sepolia.wordCountPerRequest }`);
    console.log(`    - request confirmations  : ${ _config.chainlink.vrf.sepolia.requestConfirmations }`);
    console.log(`    - callback gas limit     : ${ _config.chainlink.vrf.sepolia.callbackGasLimit }`);
    console.log(`    - coordinator address    : ${ _config.chainlink.vrf.sepolia.coordinatorAddress }`);
    console.log(`    - admninistrator address : ${ _config.chainlink.vrf.sepolia.administratorAccount }`);
    console.log(`    - gas lane keyhash       : ${ _config.chainlink.vrf.sepolia.gaslaneKeyhash }`);

  }

  console.log();


  /* Deploy Syndx */
  console.log();
  console.log(`# SYNDX CONTRACT`);
  console.log();

  // Deploy the syndx contract
  const syndx = await hre.ethers.deployContract("Syndx", [_context.chainlink.vrf.coordinatorAddress, _context.chainlink.vrf.subscriptionID]);
  await syndx.waitForDeployment();
  _context.contracts.syndx = syndx;
  console.log(`  > Syndx contract deployed at address ${ _context.contracts.syndx.target }`);
  console.log();
  console.log(`    - arg1 (chainlink vrf coordinator address): ${_context.chainlink.vrf.coordinatorAddress}`);
  console.log(`    - arg2 (chainlink vrf subscription ID)    : ${_context.chainlink.vrf.subscriptionID}`);
  console.log();

  // Attach syndx contract with chainlink VRF account
  if (_context.network.local) {

    transaction = await _context.contracts.VRFCoordinatorV2Mock.connect(_context.deployer).addConsumer(_context.chainlink.vrf.subscriptionID, _context.contracts.syndx.target);
    transactionReceipt = await transaction.wait(1);
    console.log(`    - syndx contract added as VRFCoordinatorV2Mock consumer`);

  }
  else {

    console.log(`    - /!\\ please add syndx contract ${ _context.contracts.syndx.target } as Chainlink VRF consumer in your subscription #${ _context.chainlink.vrf.subscriptionID } (${ _context.network.name }) /!\\`);
  }

  console.log();

  /* Deploy TokenFactory */
  console.log();
  console.log(`# TOKEN FACTORY CONTRACT`);
  console.log();

  const tokenFactory = await hre.ethers.deployContract("TokenFactory", [_context.contracts.syndx.target]);
  await tokenFactory.waitForDeployment();
  _context.contracts.tokenFactory = tokenFactory;
  console.log(`  > TokenFactory contract deployed at address ${ _context.contracts.tokenFactory.target }`);
  console.log();
  console.log(`    - arg1 (syndx contract address): ${_context.contracts.syndx.target}`);
  console.log();

  /* Attach TokenFactory to Syndx */
  const tx = await _context.contracts.syndx.setTokenFactory(_context.contracts.tokenFactory.target);
  await tx.wait(1);
  console.log(`  > TokenFactory successfully attached to Syndx`);
  console.log();

  /* Write output file */
  const output = {
    network: hre.network.name == 'localhost' ? 'hardhat' : hre.network.name,
    blocknumber: Number((await ethers.provider.getBlock("latest")).number),
    contracts: {
      chainlink: {
        vrf: {
          subscriptionId: Number(_context.chainlink.vrf.subscriptionID),
          coordinatorAddress: _context.chainlink.vrf.coordinatorAddress
        }
      },
      syndx: { 
        address: _context.contracts.syndx.target 
      },
      tokenFactory: { 
        address: _context.contracts.tokenFactory.target 
      }
    },
  };

  const paths = [
    './scripts/outputs',
    '../frontend/src/backend/outputs'
  ]

  writeOutputFile(paths, 'deployOutput.js', output);

  // DO NOT REMOVE
  console.log();
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


