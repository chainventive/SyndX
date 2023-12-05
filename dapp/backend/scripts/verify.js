// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
require("@nomicfoundation/hardhat-toolbox");

// Place address and args of contracts to be veriyed here 
const _contracts = [

    { name: 'Syndx'           , address: '0x9f05E7430fac1F6Bb70458F705aCF657053fD9C9' , args: ['0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625', 7287] },
    { name: 'TokenFactory'    , address: '0xC7eec847D4bb069a314cbF0FEF62dA7124dB7fbd' , args: ['0x9f05E7430fac1F6Bb70458F705aCF657053fD9C9'] },

    { name: 'Coproperty'      , address: '', args: ['COPRO_NAME', 'SYNDIC_ADDR', 'GOV_TOKEN_ADDR'] },
    { name: 'GovernanceToken' , address: '', args: ['TOKEN_ISO', 'TOKEN_NAME', 'TOKEN_SYMBOL', 'TOKEN_ADMIN_ADDR', 'OWNER_ADDR'] },
    { name: 'VoteToken'       , address: '', args: ['OWNER_ADDR', 'GOV_TOKEN_ADDR', 'TOKEN_ADMIN_ADDR', 'TOKEN_NAME', 'TOKEN_SYMBOL'] },
    
];

async function main() {
    console.log(); // DO NOT REMOVE

    console.log();
    console.log(`# CONTRACTS VERIFICATION WITH ETHERSCAN`);
    console.log();

    /* Check Network */
    const environnement = (hre.network.name == 'hardhat' || hre.network.name == 'localhost') ? ('local env') : ('live env');
    console.log(`> Network: ${ hre.network.name } (${ environnement })`);
    console.log();

    /* Check Provided Contracts */
    const contracts = _contracts.filter(c => c.address.length > 0);
    if (contracts.length <= 0) {

        console.log(`> No contract provided !`);
        console.log();

    }

    /* Verify */
    for(let contract of contracts) {

        console.log(`> Verifying contract '${ contract.name }' at address ${ contract.address } ...`);
        console.log();

        await hre.run("verify:verify", {
            address: contract.address,
            constructorArguments: contract.args,
        });

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
