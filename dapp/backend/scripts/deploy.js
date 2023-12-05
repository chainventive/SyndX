// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const { getDateTimestamp, getTimestampDate, dateToShortDateTime, wait } = require('../helpers/time');

const getVoteType = (value) => value === 0 ? "Undetermined" : value === 1 ? "Unanimity" : value === 2 ? "SimpleMajority" : value === 3 ? "AbsoluteMajority" : "ERROR";

async function main() {
  console.log();
  // DO NOT REMOVE

  const [ _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes ] = await ethers.getSigners();

  /* Deploy Syndx */

  const syndx = await hre.ethers.deployContract("Syndx");
  await syndx.waitForDeployment();

  console.log(`[1/3] Syndx contract deployed at address -> ${ syndx.target }`);

  /* Deploy TokenFactory */

  const tokenFactory = await hre.ethers.deployContract("TokenFactory", [syndx.target]);
  await tokenFactory.waitForDeployment();

  console.log(`[2/3] TokenFactory contract deployed at address -> ${ tokenFactory.target }`);

  /* Connect Syndx with TokenFactory */

  const txSetTokenFactory = await syndx.setTokenFactory(tokenFactory.target);
  await txSetTokenFactory.wait();

  console.log(`[3/3] TokenFactory successfully linked with Syndx contract !`);

  // DO NOT REMOVE
  console.log();
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
