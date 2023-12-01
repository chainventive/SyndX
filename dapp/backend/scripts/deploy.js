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

  // Distribute governance token to property owners

  console.log(`> Perform token distribution according to property owners shares ...`);
  console.log();

  const txTransfer1 = await governanceToken.connect(_syndic).setWhitelist(_anigail.address, true);
  const txTransfer2 = await governanceToken.connect(_syndic).setWhitelist(_bernard.address, true);
  const txTransfer3 = await governanceToken.connect(_syndic).setWhitelist(_cynthia.address, true);
  const txTransfer4 = await governanceToken.connect(_syndic).setWhitelist(_dounia.address, true);
  const txTransfer5 = await governanceToken.connect(_syndic).setWhitelist(_elyes.address, true); 
  await txTransfer5.wait(); 

  const txTransfer6  = await governanceToken.connect(_syndic).transfer(_anigail.address, 2000);
  const txTransfer7  = await governanceToken.connect(_syndic).transfer(_bernard.address, 2000);
  const txTransfer8  = await governanceToken.connect(_syndic).transfer(_cynthia.address, 2000);
  const txTransfer9  = await governanceToken.connect(_syndic).transfer(_dounia.address,  2000);
  const txTransfer10 = await governanceToken.connect(_syndic).transfer(_elyes.address,  2000);
  await txTransfer10.wait();

  syndicGovernanceTokenBalance = await governanceToken.balanceOf(_syndic);
  anigailGovernanceTokenBalance = await governanceToken.balanceOf(_anigail);
  bernardGovernanceTokenBalance = await governanceToken.balanceOf(_bernard);
  cynthiaGovernanceTokenBalance = await governanceToken.balanceOf(_cynthia);
  douniaGovernanceTokenBalance = await governanceToken.balanceOf(_dounia);
  elyesGovernanceTokenBalance = await governanceToken.balanceOf(_elyes);

  totalGovernanceDistributedTokens = syndicGovernanceTokenBalance
                                   + anigailGovernanceTokenBalance
                                   + bernardGovernanceTokenBalance
                                   + cynthiaGovernanceTokenBalance
                                   + douniaGovernanceTokenBalance
                                   + elyesGovernanceTokenBalance;

  console.log(`> Final governance token distribution:`);
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

  // Force local chain to mine a bloc to updates his timestamp and limit desynchronisation with local environnement
  if (hre.network.name == 'hardhat' || hre.network.name == 'localhost') await hre.network.provider.send("evm_mine");

  // Create a new coproperty assembly

  console.log(`> Creating a new general assembly ...`);
  console.log();

  const now = (await ethers.provider.getBlock("latest")).timestamp;
  const timespanFromNowAndVoteStartTime = (hre.network.name == 'hardhat' || hre.network.name == 'localhost') ? 60 : 120;
  const votetartTime = now + timespanFromNowAndVoteStartTime;

  const txGeneralAssembly = await coproperty.connect(_syndic).createGeneralAssembly(votetartTime);
  await txGeneralAssembly.wait();

  const generalAssemblyContractAddress = await coproperty.getLastestGeneralAssembly();
  const generalAssembly = await hre.ethers.getContractAt("GeneralAssembly", generalAssemblyContractAddress);

  const generalAssemblyTimeline = await generalAssembly.getTimeline();
  const unlockedTimespan = Number(generalAssemblyTimeline.lockup) - Number(generalAssemblyTimeline.created);
  console.log(`  - meeting creation time  : ${getTimestampDate(generalAssemblyTimeline.created)}`);
  console.log(`  - unlock period duration : ${unlockedTimespan} sec. to submit resolutions/amendments`);
  console.log(`  - resol.lockup time      : ${getTimestampDate(generalAssemblyTimeline.lockup)}`);
  console.log(`  - voting start time      : ${getTimestampDate(generalAssemblyTimeline.voteStart)}`);
  console.log(`  - voting end time        : ${getTimestampDate(generalAssemblyTimeline.voteEnd)}`);
  console.log();

  // Submit general assembly resolutions

  console.log(`> Submitting resolutions ...`);
  console.log();

  const title1 = "Approbation des comptes";
  const description1 = "Le syndic SIMPLE COMME SYNDIC sollicite l'approbation intégrale des comptes de charge de l'exercice 2022 clos le 31 décembre, adressés à chaque copropriétaire";
  const tx12 = await generalAssembly.connect(_syndic).createResolution(title1, description1);
  console.log(`  - created syndic resolution 'Approbation des comptes'`);

  const title2 = "Désignation du syndic";
  const description2 = "Le syndic SIMPLE COMME SYNDIC demande de le désigner comme syndic pour un montant annuel de EUR 2,400.-. Début de contrat 01/01/2024 - Fin de contrat 31/12/2024";
  const tx13 = await generalAssembly.connect(_syndic).createResolution(title2, description2);
  console.log(`  - created syndic resolution 'Désignation du syndic'`);

  const title3 = "Acquisition d’un garage privé";
  const description3 = "Bonjour, nous souhaiterions que la copropriété fasse l’acquisition du garage privée mitoyen à l’immeuble dont mon mari est déjà propriétaire";
  const tx14 = await generalAssembly.connect(_dounia).createResolution(title3, description3);
  console.log(`  - created dounia resolution 'Acquisition d’un garage privé'`);

  await tx14.wait(); // wait that the latest submitted resolution tx was mined to continue

  console.log();
  console.log(`> Amending the latest resolution ...`);
  console.log();

  const latestResolutionId = Number(await generalAssembly.getResolutionCount()) - 1;
  const amendmentDescription = "le syndic tient à vous informer qu’en cas d’adoption, les quote-parts de chaque copropriétaire ferait l’objet d’une modification prenant en compte les tantièmes du garage au sein de la copropriété";
  const tx15 = await generalAssembly.connect(_syndic).createAmendment(latestResolutionId, amendmentDescription);
  
  await tx15.wait(); // wait that the submitted amendment tx was mined to continue

  console.log(`  - syndic amended dounia's resolution 'Acquisition d’un garage privé'`);
  console.log(); 

  // Summarize all meeting resolutions and amendments

  console.log(`> Fetch all resolutions and amendments ...`);

  const amendments = [];
  const amendmentCount = Number(await generalAssembly.getAmendmentCount());

  for(let i = 0; i < amendmentCount; ++i) {

      const amendment = await generalAssembly.getAmendment(i);
      amendments.push(amendment);
  }

  const resolutionCount = Number(await generalAssembly.getResolutionCount());

  console.log();
  console.log(`> Resolutions summary: `);
  console.log();

  for(let i = 0; i < resolutionCount; ++i) {

    const resolution = await generalAssembly.getResolution(i);
    const resolutionAmendments = amendments.filter(amendment => amendment.resolutionID == i);
    const resolutionVoteType = getVoteType(Number(resolution.voteType));
        
    console.log(`  - ${resolution.author}: ${resolution.title} [${resolutionVoteType}] -> ${resolution.description}`);
    
    for(let j = 0; j < resolutionAmendments.length; ++j) {

      const amendment = resolutionAmendments[j];
      console.log(`    * ${amendment.author}: ${amendment.description}`);
    }
  }

  // Let the syndic assign the vote type of each resolution

  console.log();
  console.log(`> Simulate vote types assignations by the syndic ... `);
  console.log();

  let tx16;
  for(let i = 0; i < resolutionCount; ++i) {

      const newVoteType = i==0 ? (1) : (i==1 ? (2) : (i==2 ? (3) : (0)));
      tx16 = await generalAssembly.connect(_syndic).setResolutionVoteType(i, newVoteType);
  }

  await tx16.wait(); // wait that the latest vote type assignation tx was mined before fetching all resolutions again to checks if right changes are done

  for(let i = 0; i < resolutionCount; ++i) {

      const resolution = await generalAssembly.getResolution(i);
      const resolutionVoteType = getVoteType(Number(resolution.voteType));
      console.log(`  - syndic changed vote type of resolution '${resolution.title}' from '${getVoteType(0)}' to '${resolutionVoteType}'`);
  }


  // Simulate votes

  console.log();
  console.log(`> Wait the opening of the voting session scheduled ${getTimestampDate(generalAssemblyTimeline.voteStart)} ... `);
  console.log();

  let latestBlockTimeStamp = 0;
  while(latestBlockTimeStamp < Number(generalAssemblyTimeline.voteStart))
  {
      if (hre.network.name == 'hardhat' || hre.network.name == 'localhost') await hre.network.provider.send("evm_mine");

      latestBlockTimeStamp = (await ethers.provider.getBlock("latest")).timestamp;
      console.log(`  - latest block time: ${getTimestampDate(Number(latestBlockTimeStamp))}`);
      await wait(15); // wait approx. 1 block
  }
  
  console.log();
  console.log(`> It's time to vote, it is: ${dateToShortDateTime(new Date())}`);

  // Set votes for resolutionID 0
  console.log();
  console.log('  - voting for resolution #0 ...');
  console.log();

  const resolution0 = 0;
  const txAnigail0 = await generalAssembly.connect(_anigail).vote(resolution0, true);
  await txAnigail0.wait();
  console.log('    * anigail voted yes');
  const txBernard0 = await generalAssembly.connect(_bernard).vote(resolution0, true);
  await txBernard0.wait();
  console.log('    * bernard voted yes');
  const txCynthia0 = await generalAssembly.connect(_cynthia).vote(resolution0, true);
  await txCynthia0.wait();
  console.log('    * cynthia voted yes');
  const txDounia0 = await generalAssembly.connect(_dounia).vote(resolution0, true);
  await txDounia0.wait();
  console.log('    * dounia voted yes');
  const txElyes0 = await generalAssembly.connect(_elyes).vote(resolution0, true);
  await txElyes0.wait();
  console.log('    * elyes voted yes');

  // Set votes for resolutionID 1
  console.log();
  console.log('  - voting for resolution #1 ...');
  console.log();

  const resolution1 = 1;
  const txAnigail1 = await generalAssembly.connect(_anigail).vote(resolution1, true);
  await txAnigail1.wait();
  console.log('    * anigail voted yes');
  const txBernard1 = await generalAssembly.connect(_bernard).vote(resolution1, true);
  await txBernard1.wait();
  console.log('    * bernard voted yes');
  const txCynthia1 = await generalAssembly.connect(_cynthia).vote(resolution1, true);
  await txCynthia1.wait();
  console.log('    * cynthia voted yes');
  const txDounia1 = await generalAssembly.connect(_dounia).vote(resolution1, true);
  await txDounia1.wait();
  console.log('    * dounia voted yes');
  const txElyes1 = await generalAssembly.connect(_elyes).vote(resolution1, true);
  await txElyes1.wait();
  console.log('    * elyes voted yes');

  // Set votes for resolutionID 2
  console.log();
  console.log('  - voting for resolution #2 ...');
  console.log();

  const resolution2 = 2;
  const txAnigail2 = await generalAssembly.connect(_anigail).vote(resolution2, true);
  await txAnigail2.wait();
  console.log('    * anigail voted yes');
  const txBernard2 = await generalAssembly.connect(_bernard).vote(resolution2, true);
  await txBernard2.wait();
  console.log('    * bernard voted yes');
  const txCynthia2 = await generalAssembly.connect(_cynthia).vote(resolution2, true);
  await txCynthia2.wait();
  console.log('    * cynthia voted yes');
  const txDounia2 = await generalAssembly.connect(_dounia).vote(resolution2, true);
  await txDounia2.wait();
  console.log('    * dounia voted yes');
  const txElyes2 = await generalAssembly.connect(_elyes).vote(resolution2, true);
  await txElyes2.wait();
  console.log('    * elyes voted yes');

  //


  // DO NOT REMOVE
  console.log();
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
