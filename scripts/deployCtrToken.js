const hre = require('hardhat');

async function main() {
    const CtrToken = await hre.ethers.getContractFactory("CtrToken");
    const token = await CtrToken.deploy();
    await token.deployed();
    console.log("CtrToken deployed to:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
