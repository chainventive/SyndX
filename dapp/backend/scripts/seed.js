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

  // Contrat Syndx -> http://193.70.112.124:3000/ -> 0x7f99D751BB451E37D49e6BFc89BB1390cE48818A
  const syndxContractAddress = "0x5cD48B97f5F92f666db53A7567F83Bc2D41A79E2"; // Contrat Syndx -> http://193.70.112.124:3000/

  const coproperties = [

    { name: 'ALYRA',   tokenIso: 'AGA',  syndicAddress: '0x50E63053B087a44B6AfB2D68bc18b68bf4F0C118' },
    { name: 'DEMO',  tokenIso: 'DMO', syndicAddress: '0xd510962D041Dc1fBbb1f2c12253Fb48312FcaA2b' },
    
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