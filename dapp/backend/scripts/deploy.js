// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const { SYNDX } = require('../data/syndx');
const { getDateTimestamp, getTimestampDate, dateToShortDateTime, wait } = require('../helpers/time');

const getVoteType = (value) => value === 0 ? "Undetermined" : value === 1 ? "Unanimity" : value === 2 ? "SimpleMajority" : value === 3 ? "AbsoluteMajority" : "ERROR";

async function main() {

    // Load signers to manipulate contracts

    const [ _admin, _syndic, _anigail, _bernard, _cynthia, _dounia, _elyes ] = await hre.ethers.getSigners();
    console.log();

    // Deploy Syndx

    const enableChainlinkVRF = true;

    const syndx = await hre.ethers.deployContract("SyndxFactory", [1]);
    await syndx.waitForDeployment();
    console.log(`> Syndx contract: ${ syndx.target } (managed by SyndX)`);
    console.log();

    // Deploy the BATACOFT coproperty

    const batacoftName = 'BATACOFT';
    const batacoftTokenName = 'synBATA';
    const batacoftTokenSymbol = 'BATA';
    const batacoft = await hre.ethers.deployContract("Coproperty", [syndx.target, batacoftName, batacoftTokenName, batacoftTokenSymbol, _syndic.address]);
    await batacoft.waitForDeployment();
    console.log(`> Coproperty contract: ${ batacoft.target } (managed by SyndX)`);
    console.log();

    // Get the coproperty token contract and its details

    const synToken = await hre.ethers.getContractAt("SynToken", await batacoft.token());
    console.log(`> Coproperty token contract: ${synToken.target}`);
    console.log();

    const tokenName = await synToken.name();
    const tokenSymbol = await synToken.symbol();
    console.log(`  - token: ${tokenName} (${tokenSymbol})`);

    const totalSupply = await synToken.totalSupply();
    console.log(`  - total supply: ${totalSupply}`);

    const tokenOwner = await synToken.owner();
    console.log(`  - owner: ${tokenOwner}`);

    const tokenAdmin = await synToken.admin();
    console.log(`  - admin: ${tokenAdmin}`);
    console.log();

    // Show the initial coproperty token distribution

    console.log(`> Initial token distribution:`);
    console.log();

    let adminBalance = await synToken.balanceOf(_syndic);
    console.log(`  - syndic  init. balance: ${adminBalance}`);

    let anigailBalance = await synToken.balanceOf(_anigail);
    console.log(`  - anigail init. balance: ${anigailBalance}`);

    let bernardBalance = await synToken.balanceOf(_bernard);
    console.log(`  - bernard init. balance: ${bernardBalance}`);

    let cynthiaBalance = await synToken.balanceOf(_cynthia);
    console.log(`  - cynthia init. balance: ${cynthiaBalance}`);

    let douniaBalance = await synToken.balanceOf(_dounia);
    console.log(`  - dounia  init. balance: ${douniaBalance}`);

    let elyesBalance = await synToken.balanceOf(_elyes);
    console.log(`  - elyes   init. balance: ${elyesBalance}`);

    let totalDistributed = adminBalance + anigailBalance + bernardBalance + cynthiaBalance + douniaBalance + elyesBalance;
    console.log();
    console.log(`  = TOTAL DISTRIB. ${totalDistributed}`);
    console.log();

    // Perfom token distribution according to tantiem shares calculation

    console.log(`> Perform token distribution according to property owners shares ...`);
    console.log();

    const tx1 = await synToken.connect(_syndic).setWhitelist(_anigail.address, true);
    const tx2 = await synToken.connect(_syndic).setWhitelist(_bernard.address, true);
    const tx3 = await synToken.connect(_syndic).setWhitelist(_cynthia.address, true);
    const tx4 = await synToken.connect(_syndic).setWhitelist(_dounia.address, true);
    const tx5 = await synToken.connect(_syndic).setWhitelist(_elyes.address, true); 

    await tx5.wait(); // only wait for the last tx to ensure all previous are mined before continuing

    const tx6 = await synToken.connect(_syndic).transfer(_anigail.address, 2000 /*1498*/);
    const tx7 = await synToken.connect(_syndic).transfer(_bernard.address, 2000 /*1493*/);
    const tx8 = await synToken.connect(_syndic).transfer(_cynthia.address, 2000 /*1788*/);
    const tx9 = await synToken.connect(_syndic).transfer(_dounia.address,  2000 /*1790*/);
    const tx10 = await synToken.connect(_syndic).transfer(_elyes.address,  2000 /*3431*/);

    await tx10.wait(); // only wait for the last tx to ensure all previous are mined before continuing

    // Show the initial token distribution after tantiem shares calculation

    console.log(`> Final token distribution:`);
    console.log();

    adminBalance   = await synToken.balanceOf(_syndic.address);
    console.log(`  - syndic  init. balance: ${adminBalance}`);

    anigailBalance = await synToken.balanceOf(_anigail.address);
    console.log(`  - anigail init. balance: ${anigailBalance}`);

    bernardBalance = await synToken.balanceOf(_bernard.address);
    console.log(`  - bernard init. balance: ${bernardBalance}`);

    cynthiaBalance = await synToken.balanceOf(_cynthia.address);
    console.log(`  - cynthia init. balance: ${cynthiaBalance}`);

    douniaBalance  = await synToken.balanceOf(_dounia.address);
    console.log(`  - dounia  init. balance: ${douniaBalance}`);

    elyesBalance   = await synToken.balanceOf(_elyes.address);
    console.log(`  - elyes   init. balance: ${elyesBalance}`);

    totalDistributed = adminBalance + anigailBalance + bernardBalance + cynthiaBalance + douniaBalance + elyesBalance;
    console.log();
    console.log(`  = TOTAL DISTRIB. ${totalDistributed}`);
    console.log();

    // Create a new AG meeting
    
    if (hre.network.name == 'hardhat' || hre.network.name == 'localhost') await hre.network.provider.send("evm_mine");

    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const timespanFromNowAndVoteStartTime = (hre.network.name == 'hardhat' || hre.network.name == 'localhost') ? 60 : 120;
    const votingStartTime = now + timespanFromNowAndVoteStartTime;
    console.log(`> Creating a new AG meeting ...`);
    console.log();

    const tx11 = await batacoft.connect(_syndic).createMeeting(votingStartTime);
    await tx11.wait();

    const meetingContractAddress = await batacoft.connect(_syndic).getLatestMeeting();
    const meeting = await hre.ethers.getContractAt("AGMeeting", meetingContractAddress); 
    console.log(`> Created a new AG meeting contract: ${meeting.target} owned by ${ await meeting.owner() }`);
    console.log();

    // Fetch meeting timeline

    const meetingTimeline = await meeting.getMeetingTimeline();
    console.log(`  - meeting creation time  : ${getTimestampDate(meetingTimeline.created)}`);
    console.log(`  - unlock period duration : ${Number(meetingTimeline.lockup) - Number(meetingTimeline.created)} sec. to submit resolutions/amendments`);
    console.log(`  - resol.lockup time      : ${getTimestampDate(meetingTimeline.lockup)}`);
    console.log(`  - voting start time      : ${getTimestampDate(meetingTimeline.voteStart)}`);
    console.log(`  - voting end time        : ${getTimestampDate(meetingTimeline.voteEnd)}`);
    console.log();

    // Submit resolutions

    console.log(`> Submitting resolutions ...`);
    console.log();

    const title1 = "Approbation des comptes";
    const description1 = "Le syndic SIMPLE COMME SYNDIC sollicite l'approbation intégrale des comptes de charge de l'exercice 2022 clos le 31 décembre, adressés à chaque copropriétaire";
    const tx12 = await meeting.connect(_syndic).createResolution(title1, description1);
    console.log(`  - created syndic resolution 'Approbation des comptes'`);

    const title2 = "Désignation du syndic";
    const description2 = "Le syndic SIMPLE COMME SYNDIC demande de le désigner comme syndic pour un montant annuel de EUR 2,400.-. Début de contrat 01/01/2024 - Fin de contrat 31/12/2024";
    const tx13 = await meeting.connect(_syndic).createResolution(title2, description2);
    console.log(`  - created syndic resolution 'Désignation du syndic'`);

    const title3 = "Acquisition d’un garage privé";
    const description3 = "Bonjour, nous souhaiterions que la copropriété fasse l’acquisition du garage privée mitoyen à l’immeuble dont mon mari est déjà propriétaire";
    const tx14 = await meeting.connect(_dounia).createResolution(title3, description3);
    console.log(`  - created dounia resolution 'Acquisition d’un garage privé'`);

    await tx14.wait(); // wait that the latest submitted resolution tx was mined to continue

    console.log();
    console.log(`> Amending the latest resolution ...`);
    console.log();

    const latestResolutionId = Number(await meeting.getResolutionCount()) - 1;
    const amendmentDescription = "le syndic tient à vous informer qu’en cas d’adoption, les quote-parts de chaque copropriétaire ferait l’objet d’une modification prenant en compte les tantièmes du garage au sein de la copropriété";
    const tx15 = await meeting.connect(_syndic).amendResolution(latestResolutionId, amendmentDescription);
    
    await tx15.wait(); // wait that the submitted amendment tx was mined to continue

    console.log(`  - syndic amended dounia's resolution 'Acquisition d’un garage privé'`);
    console.log();

    // Summarize all meeting resolutions and amendments

    console.log();
    console.log(`> Fetch all resolutions and amendments ...`);
    console.log();

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
        tx16 = await meeting.connect(_syndic).assignResolutionVoteType(i, newVoteType);
    }

    await tx16.wait(); // wait that the latest vote type assignation tx was mined before fetching all resolutions again to checks if right changes are done

    for(let i = 0; i < resolutionCount; ++i) {

        const resolution = await meeting.getResolution(i);
        const resolutionVoteType = getVoteType(Number(resolution.voteType));
        console.log(`  - syndic changed vote type of resolution '${resolution.title}' from '${getVoteType(0)}' to '${resolutionVoteType}'`);
    }

    // Simulate votes

    console.log();
    console.log(`> Wait the opening of the voting session scheduled ${getTimestampDate(meetingTimeline.voteStart)} ... `);
    console.log();

    let latestBlockTimeStamp = 0;
    while(latestBlockTimeStamp < Number(meetingTimeline.voteStart))
    {
        if (hre.network.name == 'hardhat' || hre.network.name == 'localhost') await hre.network.provider.send("evm_mine");

        latestBlockTimeStamp = (await ethers.provider.getBlock("latest")).timestamp;
        console.log(`  - latest block time: ${getTimestampDate(Number(latestBlockTimeStamp))}`);
        await wait(15); // wait approx. 1 block
    }
    
    console.log();
    console.log(`> It's time to vote, it is: ${dateToShortDateTime(new Date())}`);
    console.log();

    // Set votes for resolutionID 0
    console.log('  - voting for resolution #0 ...');
    console.log();

    const tx17 = await meeting.connect(_anigail).vote(0, true);
    await tx17.wait();
    console.log('    * anigail voted yes');

    const tx18 = await meeting.connect(_bernard).vote(0, true);
    await tx18.wait();
    console.log('    * bernard voted yes');

    const tx19 = await meeting.connect(_cynthia).vote(0, true);
    await tx19.wait();
    console.log('    * cynthia voted yes');

    const tx20 = await meeting.connect(_dounia).vote(0, true);
    await tx20.wait();
    console.log('    * dounia voted yes');

    const tx21 = await meeting.connect(_elyes).vote(0, true);
    await tx21.wait();
    console.log('    * elyes voted yes');

    // Set votes for resolutionID 1

    console.log();
    console.log('  - voting for resolution #1 ...');
    console.log();

    const tx22 = await meeting.connect(_anigail).vote(1, true);
    await tx22.wait();
    console.log('    * anigail voted yes');

    const tx23 = await meeting.connect(_bernard).vote(1, false);
    await tx23.wait();
    console.log('    * bernard voted no');

    const tx24 = await meeting.connect(_cynthia).vote(1, true);
    await tx24.wait();
    console.log('    * cynthia voted yes');

    //const tx25 = await meeting.connect(_dounia).vote(1, false);
    console.log('    * dounia abstained');

    const tx26 = await meeting.connect(_elyes).vote(1, true);
    await tx26.wait();
    console.log('    * elyes voted yes');
    
    // Set votes for resolutionID 
    
    console.log();
    console.log('  - voting for resolution #2 ...');
    console.log();

    const tx27 = await meeting.connect(_anigail).vote(2, true);
    await tx27.wait();
    console.log('    * anigail abstained');

    const tx28 = await meeting.connect(_bernard).vote(2, false);
    await tx28.wait();
    console.log('    * bernard voted no');

    //const tx29 = await meeting.connect(_cynthia).vote(2, true);
    console.log('    * cynthia abstained');

    const tx30 = await meeting.connect(_dounia).vote(2, true);
    await tx30.wait();
    console.log('    * dounia voted yes');

    const tx31 = await meeting.connect(_elyes).vote(2, false);
    await tx31.wait();
    console.log('    * elyes voted no');

    console.log();
    console.log(`> All votes have been submitted !`);

    // Fetch vote results

    console.log();
    console.log(`> Wait the voting session end scheduled ${getTimestampDate(meetingTimeline.voteEnd)} ... `);
    console.log();

    latestBlockTimeStamp = 0;
    while(latestBlockTimeStamp < Number(meetingTimeline.voteEnd))
    {
        if (hre.network.name == 'hardhat' || hre.network.name == 'localhost') await hre.network.provider.send("evm_mine");

        latestBlockTimeStamp = (await ethers.provider.getBlock("latest")).timestamp;
        console.log(`  - latest block time: ${getTimestampDate(Number(latestBlockTimeStamp))}`);
        await wait(15); // wait approx. 1 block
    }

    console.log();
    console.log(`> Asking for tiebreak number through Chainlink VRF service ...`);
    console.log();

    await meeting.tieBreak();

    let tieBreakNumber = 0;
    while(tieBreakNumber <= 0)
    {
        console.log(`  - VRF request pending ...`);
        console.log();

        await wait(15); // wait approx. 1 block
        
        tieBreakNumber = await syndx.getMeetingRandomNumber(meeting.target);
    }

    
    console.log(`> Tiebreak number received: ${tieBreakNumber}`);
    console.log();

    console.log(`> It's time to checks results, it is: ${dateToShortDateTime(new Date())}`);
    console.log();

    for(let i = 0; i < resolutionCount; ++i) {

        try {

            const resolution = await meeting.getResolution(i);
            const voteType   = getVoteType(Number(resolution.voteType));
            const voteResult = await meeting.getVoteResult(i);
            const yesVotes   = Number(voteResult.yesCount);
            const noVotes    = Number(voteResult.noCount);
            const blankVotes = 10000 - (yesVotes + noVotes);

            console.log(`  - resolution #${i} '${ resolution.title }' [${ voteType }] --> ${ voteResult.approved ? "APPROVED" : "REJECTED" } (YES:${yesVotes}, NO:${noVotes}, BLANK:${blankVotes})`);

            const tiebreakNumber = voteResult.tiebreak;
            console.log(`  - resolution #${i} tie break number: ${tiebreakNumber}`);
        }
        catch (err) {

            console.log(err);
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
  