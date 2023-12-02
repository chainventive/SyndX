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
  
  // Load signers to manipulate contracts

  const [ _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes ] = await hre.ethers.getSigners();
  console.log();

  // Deploy Syndx

  const syndx = await hre.ethers.deployContract("Syndx");
  await syndx.waitForDeployment();

  console.log(`> Syndx contract: ${ syndx.target }`);
  console.log();

  // Create a coproperty contract for BATACOFT

  const copropertyName = "BATACOFT";
  const copropertyTokenName = "synBATA";
  const copropertyTokenSymbol = "SYN";

  const txCoproperty = await syndx.createCoproperty(copropertyName, copropertyTokenName, copropertyTokenSymbol, _syndic.address);
  await txCoproperty.wait();
  
  const copropertyAddress = await syndx.coproperties(copropertyName);
  const coproperty = await hre.ethers.getContractAt("Coproperty", copropertyAddress);

  console.log(`> Coproperty contract: ${ coproperty.target }`);
  console.log();

  const governanceTokenAddress = await coproperty.governanceToken();
  const governanceToken = await hre.ethers.getContractAt("CopropertyToken", governanceTokenAddress);
  const governanceTokenName = await governanceToken.name();
  const governanceTokenSymbol = await governanceToken.symbol();
  const governanceTokenSupply = await governanceToken.totalSupply();
  const governanceTokenAdministrator = await governanceToken.administrator();
  const governanceTokenOwner= await governanceToken.owner();

  console.log(`> Governance token contract: ${ governanceToken.target }`);
  console.log();
  console.log(`  - token: ${governanceTokenName} (${governanceTokenSymbol})`);
  console.log(`  - total supply: ${governanceTokenSupply}`);
  console.log(`  - owner: ${governanceTokenOwner}`);
  console.log(`  - admin: ${governanceTokenAdministrator}`);
  console.log();

  // Distribute governance token to property owners


  const tx10 = await governanceToken.connect(_syndic).addPropertyOwner(_anigail.address, 2000);
  const tx11 = await governanceToken.connect(_syndic).addPropertyOwner(_bernard.address, 2000);
  const tx12 = await governanceToken.connect(_syndic).addPropertyOwner(_cynthia.address, 2000);
  await tx12.wait();

  //const tx13 = await governanceToken.connect(_syndic).transfertPropertyShares(_cynthia.address, _bernard.address);
  //await tx13.wait();







  syndicGovernanceTokenBalance  = await governanceToken.balanceOf(_syndic);
  anigailGovernanceTokenBalance = await governanceToken.balanceOf(_anigail);
  bernardGovernanceTokenBalance = await governanceToken.balanceOf(_bernard);
  cynthiaGovernanceTokenBalance = await governanceToken.balanceOf(_cynthia);
  douniaGovernanceTokenBalance  = await governanceToken.balanceOf(_dounia);
  elyesGovernanceTokenBalance   = await governanceToken.balanceOf(_elyes);

  totalGovernanceDistributedTokens = syndicGovernanceTokenBalance + anigailGovernanceTokenBalance + bernardGovernanceTokenBalance + cynthiaGovernanceTokenBalance + douniaGovernanceTokenBalance + elyesGovernanceTokenBalance;

  console.log(`> Initial governance token distribution:`);
  console.log();
  console.log(`  - syndic  init. balance: ${syndicGovernanceTokenBalance}`);
  console.log(`  - anigail init. balance: ${anigailGovernanceTokenBalance}`);
  console.log(`  - bernard init. balance: ${bernardGovernanceTokenBalance}`);
  console.log(`  - cynthia init. balance: ${cynthiaGovernanceTokenBalance}`);
  console.log(`  - dounia  init. balance: ${douniaGovernanceTokenBalance}`);
  console.log(`  - elyes   init. balance: ${elyesGovernanceTokenBalance}`);
  console.log(`  ==============================`);
  console.log(`    TOTAL DISTRIBUTED = ${totalGovernanceDistributedTokens}`);
  console.log();

  // DO NOT REMOVE
  console.log();
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
