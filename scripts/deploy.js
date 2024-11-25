const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {

  const Pills = await ethers.getContractFactory("Pills");
  const pills = await Pills.deploy();

  await pills.deployed();
  const data = `
Pills Token Address   : ${pills.address}
=============================================
`;
  fs.appendFileSync("mockAddress.txt", data);
  console.log(data);


  try {
    await hre.run("verify:verify", {
      address: pills.address,
      contract: "contracts/Pills.sol:Pills",
    });
  } catch (error) {
    console.error(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
