// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const { getTimestampDate } = require('../helpers/time');

async function main() {

  // Signers to manipulate the contract

  const [ syndic, propertyOwner1, propertyOwner2, propertyOwner3 ] = await hre.ethers.getSigners();
  let latestBlock = await ethers.provider.getBlock("latest");

  // Primitives

  let resolutionPeriodDuration = 30;
  let freezePeriodDuration = 30;
  let voteDuration = 30;

  // Prepare contract state values

  let whenFreeze    = Number(latestBlock.timestamp) + resolutionPeriodDuration;
  let whenStartVote = whenFreeze + freezePeriodDuration;
  let whenCloseVote = whenStartVote + voteDuration;

  // Deploy the contract

  const AG = await hre.ethers.deployContract("AG", [ BigInt(whenFreeze), BigInt(whenStartVote), BigInt(whenCloseVote) ]);
  await AG.waitForDeployment();

  console.log();
  console.log(`# BATACOFT AG deployed to ${ AG.target } at ${ getTimestampDate(Number(latestBlock.timestamp)) }`);
  console.log();
  console.log(`> syndic        : ${ await AG.owner() }`);
  console.log();
  console.log(`> whenFreeze    : ${ getTimestampDate(Number(await AG.whenFreeze())) }`);
  console.log(`> whenStartVote : ${ getTimestampDate(Number(await AG.whenStartVote())) }`);
  console.log(`> whenCloseVote : ${ getTimestampDate(Number(await AG.whenCloseVote())) }`);
  console.log();

  // Setup the propertyOwners

  await AG.setPropertyOwnerSurface(propertyOwner1.address, BigInt(100));
  await AG.setPropertyOwnerSurface(propertyOwner2.address, BigInt(80));
  await AG.setPropertyOwnerSurface(propertyOwner3.address, BigInt(150));

  let totalSurface = await AG.totalSurface();

  console.log(`# Setting up property owners:`);
  console.log(`> assignated 100m2 to ${propertyOwner1.address}`);
  console.log(`> assignated  80m2 to ${propertyOwner2.address}`);
  console.log(`> assignated 150m2 to ${propertyOwner3.address}`);
  console.log(`> total m2 surface : ${totalSurface}`);



  // Output environnement variables for next Azure DevOps pipeline tasks
  // console.log(`##vso[task.setvariable variable=LOCK_CONTRACT_ADDRESS;]${lock.target}`);
  // console.log(`##vso[task.setvariable variable=LOCK_CONTRACT_UNLOCK_TIME;]${unlockTime}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
