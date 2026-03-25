import { ethers } from "hardhat";

async function main() {
  const AirHockey = await ethers.getContractFactory("AirHockey");
  const airHockey = await AirHockey.deploy();
  await airHockey.waitForDeployment();

  const address = await airHockey.getAddress();
  console.log("AirHockey deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
