const hre = require("hardhat");

async function main() {
  const initialCount = 0;

  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = await Counter.deploy(initialCount);

  await counter.waitForDeployment();

  const address = await counter.getAddress();
  console.log(`Counter deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
