const hre = require("hardhat");

async function main() {
  // const initialCount = 0;

  // const Counter = await hre.ethers.getContractFactory("Counter");
  // const counter = await Counter.deploy(initialCount);

  // await counter.waitForDeployment();

  // const address = await counter.getAddress();
  // console.log(`Counter deployed to: ${address}`);

  // ----------------------------------------------------

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Erc20Token = await hre.ethers.getContractFactory("Erc20Token");
  const token = await Erc20Token.deploy(
    "SYNK Coin", // name
    "SYNK", // symbol
    "1000000", // initialSupply
    deployer.address, // initialOwner
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token deployed to:", tokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
