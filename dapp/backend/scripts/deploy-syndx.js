// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const { SYNDX } = require('../data/syndx');

async function main() {

  // Checks contracts byte code size

  const syndxFactoryArtifact = await hre.artifacts.readArtifact("SyndxFactory");
  const copropertyArtifact = await hre.artifacts.readArtifact("Coproperty");
  const synTokenArtifact = await hre.artifacts.readArtifact("SynToken");
  const meetingArtifact = await hre.artifacts.readArtifact("AGMeeting");

  console.log();
  console.log("  ### SyndxFactory bytecode size:", (syndxFactoryArtifact.bytecode.length/2), "bytes / 24576 bytes");
  console.log("  ### Coproperty bytecode size:", (copropertyArtifact.bytecode.length/2), "bytes / 24576 bytes");
  console.log("  ### SynToken bytecode size:", (synTokenArtifact.bytecode.length/2), "bytes / 24576 bytes");
  console.log("  ### Meeting bytecode size:", (meetingArtifact.bytecode.length/2), "bytes / 24576 bytes");
  console.log();

  // Load signers to manipulate contracts

  const [ _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes ] = await hre.ethers.getSigners();

  // Deploy the SyndxDactory contract

  const syndxFactory = await hre.ethers.deployContract("SyndxFactory");
  await syndxFactory.waitForDeployment();
  console.log(`> SyndxFactory contract: ${ syndxFactory.target } (managed by SyndX)`);
  console.log();

  // Load BATACOFT

  const BATACOFT = SYNDX.customers.BATACOFT;

  // Create shortcut access for BATACOFT user accounts

  let syndic  = BATACOFT.syndic;
  let anigail = BATACOFT.propertyOwners[0];
  let bernard = BATACOFT.propertyOwners[1];
  let cynthia = BATACOFT.propertyOwners[2];
  let dounia  = BATACOFT.propertyOwners[3];
  let elyes   = BATACOFT.propertyOwners[4];

  // Inject hardhat accounts according to predefined addresses

  syndic.wallet.account  = _syndic;
  anigail.wallet.account = _anigail;
  bernard.wallet.account = _bernard;
  cynthia.wallet.account = _cynthia;
  dounia.wallet.account  = _dounia;
  elyes.wallet.account   = _elyes;

  // Create the coproperty contract

  BATACOFT.contract = await hre.ethers.deployContract("Coproperty", [syndxFactory.target, BATACOFT.name, BATACOFT.token.name, BATACOFT.token.symbol, syndic.wallet.address]);
  await BATACOFT.contract.waitForDeployment();

  console.log(`> Coproperty contract: ${ BATACOFT.contract.target } (managed by SyndX)`);
  console.log();
  console.log(`  - syndic  : ${ syndic.wallet.address }`);
  console.log(`  - anigail : ${ anigail.wallet.address }`);
  console.log(`  - bernard : ${ bernard.wallet.address }`);
  console.log(`  - cynthia : ${ cynthia.wallet.address }`);
  console.log(`  - dounia  : ${ dounia.wallet.address }`);
  console.log(`  - elyes   : ${ elyes.wallet.address }`);
  console.log();

  // Get the token contract

  const synToken = await hre.ethers.getContractAt("SynToken", await BATACOFT.contract.token());
  console.log(`> Coproperty token contract: ${synToken.target}`);

  // Get the coproperty contract token infos

  const tokenOwner = await synToken.owner();
  const tokenAdmin = await synToken.admin();
  const tokenName = await synToken.name();
  const tokenSymbol = await synToken.symbol();
  const totalSupply = await synToken.totalSupply();

  console.log();
  console.log(`  - token: ${tokenName} (${tokenSymbol})`);
  console.log(`  - total supply: ${totalSupply}`);
  console.log(`  - owner: ${tokenOwner}`);
  console.log(`  - admin: ${tokenAdmin}`);
  console.log();

  // Show the initial token distribution

  let adminBalance = await synToken.balanceOf(syndic.wallet.address);
  let anigailBalance = await synToken.balanceOf(anigail.wallet.address);
  let bernardBalance = await synToken.balanceOf(bernard.wallet.address);
  let cynthiaBalance = await synToken.balanceOf(cynthia.wallet.address);
  let douniaBalance = await synToken.balanceOf(dounia.wallet.address);
  let elyesBalance = await synToken.balanceOf(elyes.wallet.address);
  let totalDistributed = adminBalance + anigailBalance + bernardBalance + cynthiaBalance + douniaBalance + elyesBalance;

  console.log(`> Initial token distribution (tot. ${totalDistributed}):`);
  console.log();
  console.log(`  - syndic  init. balance: ${adminBalance}`);
  console.log(`  - anigail init. balance: ${anigailBalance}`);
  console.log(`  - bernard init. balance: ${bernardBalance}`);
  console.log(`  - cynthia init. balance: ${cynthiaBalance}`);
  console.log(`  - dounia  init. balance: ${douniaBalance}`);
  console.log(`  - elyes   init. balance: ${elyesBalance}`);
  console.log();

  // Perfom token distribution according to tantiem shares calculation

  await synToken.connect(syndic.wallet.account).setWhitelist(anigail.wallet.address, true);
  await synToken.connect(syndic.wallet.account).transfer(anigail.wallet.address, anigail.shares);

  await synToken.connect(syndic.wallet.account).setWhitelist(bernard.wallet.address, true);
  await synToken.connect(syndic.wallet.account).transfer(bernard.wallet.address, bernard.shares);

  await synToken.connect(syndic.wallet.account).setWhitelist(cynthia.wallet.address, true);
  await synToken.connect(syndic.wallet.account).transfer(cynthia.wallet.address, cynthia.shares);

  await synToken.connect(syndic.wallet.account).setWhitelist(dounia.wallet.address, true);
  await synToken.connect(syndic.wallet.account).transfer(dounia.wallet.address, dounia.shares);

  await synToken.connect(syndic.wallet.account).setWhitelist(elyes.wallet.address, true);
  await synToken.connect(syndic.wallet.account).transfer(elyes.wallet.address, elyes.shares);

  // Show the initial token distribution after tantiem shares calculation

  adminBalance = await synToken.balanceOf(syndic.wallet.address);
  anigailBalance = await synToken.balanceOf(anigail.wallet.address);
  bernardBalance = await synToken.balanceOf(bernard.wallet.address);
  cynthiaBalance = await synToken.balanceOf(cynthia.wallet.address);
  douniaBalance = await synToken.balanceOf(dounia.wallet.address);
  elyesBalance = await synToken.balanceOf(elyes.wallet.address);
  totalDistributed = adminBalance + anigailBalance + bernardBalance + cynthiaBalance + douniaBalance + elyesBalance;

  console.log(`> Token distribution after tantiem shares calculation (tot. ${totalDistributed}):`);
  console.log();
  console.log(`  - syndic  balance: ${adminBalance}`);
  console.log(`  - anigail balance: ${anigailBalance}`);
  console.log(`  - bernard balance: ${bernardBalance}`);
  console.log(`  - cynthia balance: ${cynthiaBalance}`);
  console.log(`  - dounia  balance: ${douniaBalance}`);
  console.log(`  - elyes   balance: ${elyesBalance}`);
  console.log();

  // Create an AG meeting
  await BATACOFT.contract.name();

  // DO NOT REMOVE
  console.log();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

