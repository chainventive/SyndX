// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");


async function main() {
  console.log(); 
  // DO NOT REMOVE

  const syndxContractAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";

  const coproperties = [
    { name: 'COPRO1', tokenIso: 'CP1', syndicAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
    { name: 'COPRO2', tokenIso: 'CP2', syndicAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
    { name: 'COPRO3', tokenIso: 'CP3', syndicAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
  ];

  // Load signers according to accounts provided in hardhat configs

  const [ owner ] = await hre.ethers.getSigners();

  // Get the deployed contract by its address

  console.log(`> Acquiring Syndx contract at address ${syndxContractAddress} ...`);

  const syndx = await hre.ethers.getContractAt("Syndx", syndxContractAddress);

  console.log();

  // Connect to it with syndx owner account and create 3 coproperties

  for(let coproperty of coproperties) {

    try {

      console.log(`> Creating ${ coproperty.name } ...`);

      await syndx.connect(owner).createCoproperty(coproperty.name, coproperty.tokenIso, coproperty.syndicAddress);
      
      console.log(`  - ${ coproperty.name } successfully created !`);
      console.log();

    }
    catch (error) {

      console.log(`  - Failed to create ${ coproperty.name }. Reason: ${ error }`);
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