// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

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
  const governanceTokenAdministrator = await governanceToken.admin();
  const governanceTokenOwner= await governanceToken.owner();

  console.log(`> Governance token contract: ${ governanceToken.target }`);
  console.log();
  console.log(`  - token: ${governanceTokenName} (${governanceTokenSymbol})`);
  console.log(`  - total supply: ${governanceTokenSupply}`);
  console.log(`  - owner: ${governanceTokenOwner}`);
  console.log(`  - admin: ${governanceTokenAdministrator}`);
  console.log();

  // Show initial governance token distribution

  let syndicGovernanceTokenBalance = await governanceToken.balanceOf(_syndic);
  let anigailGovernanceTokenBalance = await governanceToken.balanceOf(_anigail);
  let bernardGovernanceTokenBalance = await governanceToken.balanceOf(_bernard);
  let cynthiaGovernanceTokenBalance = await governanceToken.balanceOf(_cynthia);
  let douniaGovernanceTokenBalance = await governanceToken.balanceOf(_dounia);
  let elyesGovernanceTokenBalance = await governanceToken.balanceOf(_elyes);

  let totalGovernanceDistributedTokens = syndicGovernanceTokenBalance
                                       + anigailGovernanceTokenBalance
                                       + bernardGovernanceTokenBalance
                                       + cynthiaGovernanceTokenBalance
                                       + douniaGovernanceTokenBalance
                                       + elyesGovernanceTokenBalance;

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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
