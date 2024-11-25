const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const provider = ethers.provider;
const utils = ethers.utils;
const BN = ethers.BigNumber;

const sevenDays = 7 * 24 * 60 * 60;

describe("Staking", function () {
  let owner, staker, client;
  let stakingOpen;
  let treasury;
  let rewardWallet;

  const reward_rate = 10;

  before(async function () {
    // Deploy the contract


    // Contracts are deployed using the first signer/account by default
    [owner, staker, ...client] = await ethers.getSigners();

    const StakingOpen = await ethers.getContractFactory("StakingOpen");
    stakingOpen = await StakingOpen.deploy(reward_rate);

    const Treasury = await ethers.getContractFactory("contracts/nativestaking/Treasury.sol:Treasury");
    const RewardWallet = await ethers.getContractFactory("contracts/nativestaking/RewardWallet.sol:RewardWallet");

    await stakingOpen.deployed();

    treasury = await Treasury.deploy(stakingOpen.address);
    rewardWallet = await RewardWallet.deploy(stakingOpen.address);

    await treasury.deployed();
    await rewardWallet.deployed();

    await stakingOpen.setTreasury(treasury.address);
    await stakingOpen.setRewardWallet(rewardWallet.address);

  });



  it("Should set the right owner", async function () {
    expect(await stakingOpen.owner()).to.equal(owner.address);
  });

  it("Should set the right treasury", async function () {
    expect(await stakingOpen.treasury()).to.equal(treasury.address);
  });

  it("Should set the right rewardWallet", async function () {
    expect(await stakingOpen.rewardWallet()).to.equal(rewardWallet.address);
  });

  it("Should set the right reward rate", async function () {
    const one_ether = utils.parseEther("100");
    expect(await stakingOpen.rewardRate()).to.equal(reward_rate);
    await rewardWallet.deposit({ value: one_ether });

  });

  it("Should can be staking", async function () {

    const amount = utils.parseEther("100");
    await stakingOpen.connect(staker).stake(amount, { value: amount });
    expect(await stakingOpen.stakingBalance(staker.address)).to.equal(amount);


    // get ether balance
    const treasuryBalance = await provider.getBalance(treasury.address);
    expect(treasuryBalance).to.equal(BN.from(amount));

    await stakingOpen.connect(staker).stake(amount, { value: amount });
    expect(await stakingOpen.stakingBalance(staker.address)).to.equal(amount.mul(2));
    await ethers.provider.send('evm_increaseTime', [sevenDays]);
    await ethers.provider.send('evm_increaseTime', [sevenDays]);
    await ethers.provider.send('evm_mine');
    await ethers.provider.send('evm_mine');
    await stakingOpen.connect(staker).stake(amount, { value: amount });
    expect(await stakingOpen.stakingBalance(staker.address)).to.equal(amount.mul(3));

  });



  it("Should can be withdraw", async function () {

    const amount = 100;
    await stakingOpen.connect(staker).unstake(amount);
    // expect(await stakingOpen.stakingBalance(staker.address)).to.equal(BN.from(0);

    // get ether balance
    // const treasuryBalance = await provider.getBalance(treasury.address);
    // expect(treasuryBalance).to.equal(BN.from(0));

  });


  it("Should can be withdraw reward", async function () {

    const rewardBalance = await provider.getBalance(rewardWallet.address);

    console.log(rewardBalance.toString());

    await ethers.provider.send('evm_increaseTime', [sevenDays]);
    await ethers.provider.send('evm_mine');

    const rewardBal = await stakingOpen.getTotalRewards(staker.address);
    const totalDeposit = await rewardWallet.totalDeposited();
    console.log(totalDeposit.toString());
    console.log(rewardBal.toString());

    expect(await stakingOpen.connect(staker).withdrawRewards()).to.not.be.reverted;


  });




});
