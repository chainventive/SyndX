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

  // Deploy the Chainlink VRF Coordinator Mock

  const BASE_FEE = "100000000000000000";
  const GAS_PRICE_LINK = "1000000000";

  const VRFCoordinatorV2MockFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
  const VRFCoordinatorV2Mock = await VRFCoordinatorV2MockFactory.deploy(BASE_FEE, GAS_PRICE_LINK);
  console.log(`> VRFCoordinatorV2Mock contract: ${ VRFCoordinatorV2Mock.target }`);
  console.log();

  // Create the chainlink VRF subscription

  let transaction = await VRFCoordinatorV2Mock.connect(_admin).createSubscription();
  let transactionReceipt = await transaction.wait(1);

  // Fund the subscription
  const fundAmount = "1000000000000000000";
  const subscriptionId = transactionReceipt.logs[0].args[0];
  await VRFCoordinatorV2Mock.connect(_admin).fundSubscription(subscriptionId, fundAmount);

  // Deploy Syndx contract and link it with the chainlink VRF coordinator

  const syndx = await hre.ethers.deployContract("Syndx", [VRFCoordinatorV2Mock.target]);
  await syndx.waitForDeployment();

  console.log(`> Syndx contract: ${ syndx.target }`);
  console.log();

  // Add the Syndx contract as consumer of the chainlink VRF subscription

  const txAddConsumer = await VRFCoordinatorV2Mock.connect(_admin).addConsumer(subscriptionId, syndx.target);
  await txAddConsumer.wait(1);

  // Deploy the token factory contract

  const tokenFactory = await hre.ethers.deployContract("TokenFactory", [syndx.target]);
  await tokenFactory.waitForDeployment();

  console.log(`> TokenFactory contract: ${ tokenFactory.target }`);
  console.log();

  // Associate the token factory contract to the syndx contract

  const txSetTokenFactory = await syndx.setTokenFactory(tokenFactory.target);
  await txSetTokenFactory.wait();

  console.log(`  - TokenFactory successfully linked with Syndx contract`);
  console.log();

  // Create a coproperty contract for BATACOFT

  const copropertyName = "BATACOFT";
  const copropertyTokenISO = "BATA";

  const txCoproperty = await syndx.createCoproperty(copropertyName, copropertyTokenISO, _syndic.address);
  await txCoproperty.wait();
  
  const copropertyAddress = await syndx.coproperties(copropertyName);
  const coproperty = await hre.ethers.getContractAt("Coproperty", copropertyAddress);

  console.log(`> Coproperty contract: ${ coproperty.target }`);
  console.log();

  const governanceTokenAddress = await coproperty.governanceToken();
  const governanceToken = await hre.ethers.getContractAt("GovernanceToken", governanceTokenAddress);
  const governanceTokenName = await governanceToken.name();
  const governanceTokenSymbol = await governanceToken.symbol();
  const governanceTokenSupply = await governanceToken.totalSupply();

  const governanceTokenAdministrator = await governanceToken.administrator();
  const governanceTokenOwner= await governanceToken.owner();

  console.log(`> Governance token contract: ${ governanceToken.target }`);
  console.log();
  console.log(`  - token: ${governanceTokenName} (${governanceTokenSymbol})`);
  console.log(`  - fixed supply: ${governanceTokenSupply} ${governanceTokenSymbol}`);
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

  const txTransfer6  = await governanceToken.connect(_syndic).addPropertyOwner(_anigail.address, 2000);
  const txTransfer7  = await governanceToken.connect(_syndic).addPropertyOwner(_bernard.address, 2000);
  const txTransfer8  = await governanceToken.connect(_syndic).addPropertyOwner(_cynthia.address, 2000);
  const txTransfer9  = await governanceToken.connect(_syndic).addPropertyOwner(_dounia.address,  2000);
  const txTransfer10 = await governanceToken.connect(_syndic).addPropertyOwner(_elyes.address,  2000);
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

  const GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP = 180;
  const GENERAL_ASSEMBLY_LOCKUP_DURATION = 30;

  const now = (await ethers.provider.getBlock("latest")).timestamp;
  const votetartTime = now + GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP + GENERAL_ASSEMBLY_LOCKUP_DURATION + 30;

  const txGeneralAssembly = await coproperty.connect(_syndic).createGeneralAssembly(votetartTime);
  await txGeneralAssembly.wait();

  const generalAssemblyContractAddress = await coproperty.getLastestGeneralAssembly();
  const generalAssembly = await hre.ethers.getContractAt("GeneralAssembly", generalAssemblyContractAddress);

  console.log(`> General assembly contract: ${ generalAssembly.target }`);
  console.log();

  const generalAssemblySyndic = await generalAssembly.syndic();
  console.log(`  - syndic address         : ${generalAssemblySyndic}`);

  const voteTokenContractAddress = await generalAssembly.voteToken();
  const voteToken = await hre.ethers.getContractAt("VoteToken", voteTokenContractAddress);
  console.log(`  - vote token contract    : ${voteToken.target}`);

  const voteTokenSymbol = await voteToken.symbol();
  console.log(`  - vote token symbol      : ${voteTokenSymbol}`);

  const generalAssemblyTimeline = await generalAssembly.getTimeline();
  const unlockedTimespan = Number(generalAssemblyTimeline.lockup) - Number(generalAssemblyTimeline.created);
  console.log(`  - meeting creation time  : ${getTimestampDate(generalAssemblyTimeline.created)}`);
  console.log(`  - unlock period duration : ${unlockedTimespan} sec. to submit resolutions/amendments`);
  console.log(`  - resol.lockup time      : ${getTimestampDate(generalAssemblyTimeline.lockup)}`);
  console.log(`  - voting start time      : ${getTimestampDate(generalAssemblyTimeline.voteStart)}`);
  console.log(`  - voting end time        : ${getTimestampDate(generalAssemblyTimeline.voteEnd)}`);
  console.log();

  // Claims of vote tokens

  console.log(`> Claiming vote tokens ...`);
  console.log();

  const anigailClaim = await voteToken.connect(_anigail).claimVoteTokens();
  await anigailClaim.wait();
  const anigailVoteTokenBalance = await voteToken.balanceOf(_anigail.address);
  console.log(`  - anigail claimed and received ${anigailVoteTokenBalance} ${voteTokenSymbol} tokens to vote`);

  const bernardClaim = await voteToken.connect(_bernard).claimVoteTokens();
  await bernardClaim.wait();
  const bernardVoteTokenBalance = await voteToken.balanceOf(_bernard.address);
  console.log(`  - bernard claimed and received ${bernardVoteTokenBalance} ${voteTokenSymbol} tokens to vote`);

  const cynthiaClaim = await voteToken.connect(_cynthia).claimVoteTokens();
  await cynthiaClaim.wait();
  const cynthiaVoteTokenBalance = await voteToken.balanceOf(_cynthia.address);
  console.log(`  - cynthia claimed and received ${cynthiaVoteTokenBalance} ${voteTokenSymbol} tokens to vote`);

  const douniaClaim = await voteToken.connect(_dounia).claimVoteTokens();
  await douniaClaim.wait();
  const douniaVoteTokenBalance = await voteToken.balanceOf(_dounia.address);
  console.log(`  - dounia claimed and received ${douniaVoteTokenBalance} ${voteTokenSymbol} tokens to vote`);

  const elyesClaim = await voteToken.connect(_elyes).claimVoteTokens();
  await elyesClaim.wait();
  const elyesVoteTokenBalance = await voteToken.balanceOf(_elyes.address);
  console.log(`  - elyes claimed and received ${elyesVoteTokenBalance} ${voteTokenSymbol} tokens to vote`);

  console.log();

  // Submit general assembly resolutions

  console.log(`> Submitting resolutions ...`);
  console.log();

  const title1 = "Approbation des comptes";
  const description1 = "Le syndic SIMPLE COMME SYNDIC sollicite l'approbation intégrale des comptes de charge de l'exercice 2022 clos le 31 décembre, adressés à chaque copropriétaire";
  const tx12 = await generalAssembly.connect(_syndic).createResolution(title1, description1);
  await tx12.wait();
  console.log(`  - created syndic resolution 'Approbation des comptes'`);

  const title2 = "Désignation du syndic";
  const description2 = "Le syndic SIMPLE COMME SYNDIC demande de le désigner comme syndic pour un montant annuel de EUR 2,400.-. Début de contrat 01/01/2024 - Fin de contrat 31/12/2024";
  const tx13 = await generalAssembly.connect(_syndic).createResolution(title2, description2);
  await tx13.wait();
  console.log(`  - created syndic resolution 'Désignation du syndic'`);

  const title3 = "Acquisition d’un garage privé";
  const description3 = "Bonjour, nous souhaiterions que la copropriété fasse l’acquisition du garage privée mitoyen à l’immeuble dont mon mari est déjà propriétaire";
  const tx14 = await generalAssembly.connect(_dounia).createResolution(title3, description3);
  await tx14.wait();
  console.log(`  - created dounia resolution 'Acquisition d’un garage privé'`);

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
      if (hre.network.name == 'hardhat' || hre.network.name == 'localhost') {
        await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(generalAssemblyTimeline.voteStart)]);
        await hre.network.provider.send("evm_mine");
      }

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
  const txBernard1 = await generalAssembly.connect(_bernard).vote(resolution1, false);
  await txBernard1.wait();
  console.log('    * bernard voted yes');
  const txCynthia1 = await generalAssembly.connect(_cynthia).vote(resolution1, true);
  await txCynthia1.wait();
  console.log('    * cynthia voted yes');
  //const txDounia1 = await generalAssembly.connect(_dounia).vote(resolution1, true);
  //await txDounia1.wait();
  console.log('    * dounia abstained');
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
  const txBernard2 = await generalAssembly.connect(_bernard).vote(resolution2, false);
  await txBernard2.wait();
  console.log('    * bernard voted yes');
  //const txCynthia2 = await generalAssembly.connect(_cynthia).vote(resolution2, true);
  //await txCynthia2.wait();
  console.log('    * cynthia abstained');
  const txDounia2 = await generalAssembly.connect(_dounia).vote(resolution2, true);
  await txDounia2.wait();
  console.log('    * dounia voted yes');
  const txElyes2 = await generalAssembly.connect(_elyes).vote(resolution2, false);
  await txElyes2.wait();
  console.log('    * elyes voted yes');

  console.log();
  console.log(`> All votes have been submitted !`);
  console.log();

  // Wait the end of the voting session

  console.log(`> Wait the voting session end scheduled ${getTimestampDate(generalAssemblyTimeline.voteEnd)} ... `);
  console.log();

  latestBlockTimeStamp = 0;
  while(latestBlockTimeStamp < Number(generalAssemblyTimeline.voteEnd))
  {
      if (hre.network.name == 'hardhat' || hre.network.name == 'localhost') {
        await hre.network.provider.send("evm_setNextBlockTimestamp", [Number(generalAssemblyTimeline.voteEnd)]);
        await hre.network.provider.send("evm_mine");
      }

      await wait(15); // wait approx. 1 block

      latestBlockTimeStamp = (await ethers.provider.getBlock("latest")).timestamp;
      console.log(`  - latest block time: ${getTimestampDate(Number(latestBlockTimeStamp))}`);
  }

  // Request a tibreaker number

  console.log();
  console.log(`> Asking for tiebreaker number through Chainlink VRF service ...`);
  console.log();

  generalAssembly.connect(_syndic).requestTiebreaker();

  // In local environnement the Chainlink VRF mock must be triggered manually as there is no real newtork behind
  if (hre.network.name == 'hardhat' || hre.network.name == 'localhost') {
    const requestID = 1;
    await VRFCoordinatorV2Mock.fulfillRandomWords(requestID, syndx.target);
  }

  let tiebreaker = 0;
  while(tiebreaker <= 0)
  {
      console.log(`  - VRF request pending ...`);

      await wait(15); // wait approx. 1 block
      
      tiebreaker = Number(await generalAssembly.tiebreaker());
  }

  console.log();
  console.log(`> Tiebreak number received: ${tiebreaker}`);
  console.log();

  // Show the final votes results

  console.log(`> It's time to checks results, it is: ${dateToShortDateTime(new Date())}`);
  console.log();

  for(let i = 0; i < resolutionCount; ++i) {

    const resolution = await generalAssembly.getResolution(i);
    const voteType = getVoteType(Number(resolution.voteType));

    try {

        const voteResult = await generalAssembly.getVoteResult(i);
        const yesVoteShares = Number(voteResult.yesShares);
        const noVoteShares = Number(voteResult.noShares);
        const blankVoteShares = 10000 - (yesVoteShares + noVoteShares);
        const totalVoteShares = yesVoteShares + noVoteShares + blankVoteShares;
        const yesVoteCount = Number(voteResult.yesCount);
        const noVoteCount = Number(voteResult.noCount);

        console.log(`  - resolution #${i} '${resolution.title}' [${voteType}]`);
        console.log();
        console.log(`    * total shares: ${totalVoteShares}`);
        console.log(`    * yes shares  : ${yesVoteShares}`);
        console.log(`    * no shares   : ${noVoteShares}`);
        console.log(`    * blank shares: ${blankVoteShares}`);
        console.log(`    * yes count   : ${yesVoteCount}`);
        console.log(`    * no count    : ${noVoteCount}`);
        console.log(`    * equality    : ${voteResult.equality}`);
        console.log(`    * tiebreaker  : ${voteResult.tiebreaker}`);
        console.log(`    * approved    : ${voteResult.approved}`);

        console.log();
    }
    catch (err) {

        console.log(`  - resolution #${i} '${ resolution.title }' [${ voteType }] => ERROR: ${err}`);
        console.log();
    }

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
