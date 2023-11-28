// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const { SYNDX } = require('../data/syndx');
const { getDateTimestamp, getTimestampDate, dateToShortDateTime, delay } = require('../helpers/time');

async function main() {

  // Perform synchronisation between hardhat chain and local system time

  await network.provider.send("evm_setNextBlockTimestamp", [getDateTimestamp(Date.now())]);
  await network.provider.send("evm_mine");

  // Checks contracts byte code size

  const syndxFactoryArtifact = await hre.artifacts.readArtifact("SyndxFactory");
  const copropertyArtifact = await hre.artifacts.readArtifact("Coproperty");
  const synTokenArtifact = await hre.artifacts.readArtifact("SynToken");
  const meetingArtifact = await hre.artifacts.readArtifact("AGMeeting");
  const voteArtifact = await hre.artifacts.readArtifact("Vote");

  console.log();
  console.log("  ### SyndxFactory bytecode size:", (syndxFactoryArtifact.bytecode.length/2), "bytes / 24576 bytes");
  console.log("  ### Coproperty bytecode size:", (copropertyArtifact.bytecode.length/2), "bytes / 24576 bytes");
  console.log("  ### SynToken bytecode size:", (synTokenArtifact.bytecode.length/2), "bytes / 24576 bytes");
  console.log("  ### Meeting bytecode size:", (meetingArtifact.bytecode.length/2), "bytes / 24576 bytes");
  console.log("  ### Vote bytecode size:", (voteArtifact.bytecode.length/2), "bytes / 24576 bytes");
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

  BATACOFT.token.contract = await hre.ethers.getContractAt("SynToken", await BATACOFT.contract.token());
  console.log(`> Coproperty token contract: ${BATACOFT.token.contract.target}`);

  // Get the coproperty contract token infos

  const tokenOwner = await BATACOFT.token.contract.owner();
  const tokenAdmin = await BATACOFT.token.contract.admin();
  const tokenName = await BATACOFT.token.contract.name();
  const tokenSymbol = await BATACOFT.token.contract.symbol();
  const totalSupply = await BATACOFT.token.contract.totalSupply();

  console.log();
  console.log(`  - token: ${tokenName} (${tokenSymbol})`);
  console.log(`  - total supply: ${totalSupply}`);
  console.log(`  - owner: ${tokenOwner}`);
  console.log(`  - admin: ${tokenAdmin}`);
  console.log();

  // Show the initial token distribution

  let adminBalance   = await BATACOFT.token.contract.balanceOf(syndic.wallet.address);
  let anigailBalance = await BATACOFT.token.contract.balanceOf(anigail.wallet.address);
  let bernardBalance = await BATACOFT.token.contract.balanceOf(bernard.wallet.address);
  let cynthiaBalance = await BATACOFT.token.contract.balanceOf(cynthia.wallet.address);
  let douniaBalance  = await BATACOFT.token.contract.balanceOf(dounia.wallet.address);
  let elyesBalance   = await BATACOFT.token.contract.balanceOf(elyes.wallet.address);
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

  await BATACOFT.token.contract.connect(syndic.wallet.account).setWhitelist(anigail.wallet.address, true);
  await BATACOFT.token.contract.connect(syndic.wallet.account).transfer(anigail.wallet.address, anigail.shares);

  await BATACOFT.token.contract.connect(syndic.wallet.account).setWhitelist(bernard.wallet.address, true);
  await BATACOFT.token.contract.connect(syndic.wallet.account).transfer(bernard.wallet.address, bernard.shares);

  await BATACOFT.token.contract.connect(syndic.wallet.account).setWhitelist(cynthia.wallet.address, true);
  await BATACOFT.token.contract.connect(syndic.wallet.account).transfer(cynthia.wallet.address, cynthia.shares);

  await BATACOFT.token.contract.connect(syndic.wallet.account).setWhitelist(dounia.wallet.address, true);
  await BATACOFT.token.contract.connect(syndic.wallet.account).transfer(dounia.wallet.address, dounia.shares);

  await BATACOFT.token.contract.connect(syndic.wallet.account).setWhitelist(elyes.wallet.address, true);
  await BATACOFT.token.contract.connect(syndic.wallet.account).transfer(elyes.wallet.address, elyes.shares);

  // Show the initial token distribution after tantiem shares calculation

  adminBalance   = await BATACOFT.token.contract.balanceOf(syndic.wallet.address);
  anigailBalance = await BATACOFT.token.contract.balanceOf(anigail.wallet.address);
  bernardBalance = await BATACOFT.token.contract.balanceOf(bernard.wallet.address);
  cynthiaBalance = await BATACOFT.token.contract.balanceOf(cynthia.wallet.address);
  douniaBalance  = await BATACOFT.token.contract.balanceOf(dounia.wallet.address);
  elyesBalance   = await BATACOFT.token.contract.balanceOf(elyes.wallet.address);
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

  // Create and retrieve the latest AG meeting
  
  const votingStartTime = getDateTimestamp(Date.now()) + 120; // +120 value is hight enought to avoid time synchronisation problems between harhat chain and local env.
  await BATACOFT.contract.connect(syndic.wallet.account).createMeeting(votingStartTime);
  const meeting = await hre.ethers.getContractAt("AGMeeting", await BATACOFT.contract.connect(syndic.wallet.account).getLatestMeeting()); 
  console.log(`> Latest AG meeting contract: ${meeting.target} owned by ${ await meeting.owner() }`);
  console.log();

  // Fetch meeting timeline

  const meetingTimeline = await meeting.getMeetingTimeline();
  console.log(`  - meeting creation time  : ${getTimestampDate(meetingTimeline.created)}`);
  console.log(`  - unlock period duration : ${Number(meetingTimeline.lockup) - Number(meetingTimeline.created)} sec. to submit resolutions/amendments`);
  console.log(`  - resol.lockup time      : ${getTimestampDate(meetingTimeline.lockup)}`);
  console.log(`  - voting start time      : ${getTimestampDate(meetingTimeline.voteStart)}`);
  console.log(`  - voting end time        : ${getTimestampDate(meetingTimeline.voteEnd)}`);
  console.log();
  
  // Submit some resolutions

  await meeting.connect(syndic.wallet.account).createResolution("Approbation des comptes", "Le syndic SIMPLE COMME SYNDIC sollicite l'approbation intégrale des comptes de charge de l'exercice 2022 clos le 31 décembre, adressés à chaque copropriétaire");
  console.log(`  - submitted syndic resolution 'Approbation des comptes'`);

  await meeting.connect(syndic.wallet.account).createResolution("Désignation du syndic", "Le syndic SIMPLE COMME SYNDIC demande de le désigner comme syndic pour un montant annuel de EUR 2,400.-. Début de contrat au 01/01/2024 - Fin de contrat au 31/12/2024");
  console.log(`  - submitted syndic resolution 'Désignation du syndic'`);

  await meeting.connect(dounia.wallet.account).createResolution("Acquisition d’un garage privé", "Bonjour, nous souhaiterions que la copropriété fasse l’acquisition du garage privée mitoyen à l’immeuble dont mon mari est déjà propriétaire. Merci.");
  console.log(`  - submitted dounia resolution 'Acquisition d’un garage privé'`);

  // Amend some resolutions

  await meeting.connect(syndic.wallet.account).amendResolution(Number(await meeting.getResolutionCount())-1, "le syndic tient à vous informer qu’en cas d’adoption, les quote-parts de chaque copropriétaire ferait l’objet d’une modification prenant en compte les tantièmes du garage au sein de la copropriété");
  console.log(`  - syndic amended dounia's resolution 'Acquisition d’un garage privé'`);

  // Show all meeting resolutions and amendments

  const getVoteType = (value) => value === 0 ? "Undetermined" : value === 1 ? "AbsoluteMajority" : value === 2 ? "Unanimity" : "ERROR";

  const amendments = [];
  const amendmentCount = Number(await meeting.getAmendementCount());
  
  for(let i = 0; i < amendmentCount; ++i) {
    const amendment = await meeting.getAmendment(i);
    amendments.push(amendment);
  }

  const resolutionCount = Number(await meeting.getResolutionCount());
  console.log();
  console.log(`> Resolutions summary: `);
  console.log();

  for(let i = 0; i < resolutionCount; ++i) {

    const resolution = await meeting.getResolution(i);
    const resolutionAmendments = amendments.filter(amendment => amendment.resolutionID == i);
    console.log(`  - ${resolution.author}: ${resolution.title} [${getVoteType(Number(resolution.voteType))}] -> ${resolution.description}`);

    for(let j = 0; j < resolutionAmendments.length; ++j) {
      const amendment = resolutionAmendments[j];
      console.log(`    * ${amendment.author}: ${amendment.description}`);
    }
  }

  // Let syndic assign the vote type of each resolution

  console.log();
  console.log(`> Vote types assignations: `);
  console.log();

  for(let i = 0; i < resolutionCount; ++i) {
    await meeting.connect(syndic.wallet.account).assignResolutionVoteType(i, 1);
    const resolution = await meeting.getResolution(i);
    console.log(`  - syndic changed vote type of resolution '${resolution.title}' from '${getVoteType(0)}'. to '${getVoteType(Number(resolution.voteType))}'`);
  }


  // DO NOT REMOVE
  console.log();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

