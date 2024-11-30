const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const dev = '0xf8322f15c27C286Ed433Ad7DAEaeBCd96451561a'
  // const dev = '0xBBFA8D04a8AC96613189f12FFf810E706075A9a3'
  const Pills = await ethers.getContractFactory("Pills");
  const pills = await Pills.deploy(dev);

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
      constructorArguments: [dev],
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
