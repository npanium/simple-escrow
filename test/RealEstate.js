const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

describe("RealEstate", () => {
  let realEstate, escrow;
  let deployer, seller;
  let nftID = 1;
  let purchasePrice = ether(100);
  let escrowAmount = ether(20);

  beforeEach(async () => {
    //Setup accounts
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    seller = deployer;
    buyer = accounts[1];
    inspector = accounts[2];
    lender = accounts[3];

    //Load contracts
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    //Deploy contracts
    realEstate = await RealEstate.deploy();
    escrow = await Escrow.deploy(
      realEstate.address,
      nftID,
      purchasePrice,
      escrowAmount,
      seller.address,
      buyer.address,
      inspector.address,
      lender.address
    );

    //Seller approves NFT
    transaction = await realEstate
      .connect(seller)
      .approve(escrow.address, nftID);

    await transaction.wait();
  });

  describe("Deployment", () => {
    it("sends an NFT to the seller / deployer", async () => {
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);
    });
  });

  describe("Selling Real Estate", () => {
    let balance, transaction;

    it("executes a successful transaction", async () => {
      //expects seller to be the nft owner before the sale
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

      //Check escrow balance
      balance = await escrow.getBalance();
      console.log("Escrow balance: ", ethers.utils.formatEther(balance));

      //Buyer deposits earnest
      transaction = await escrow
        .connect(buyer)
        .depositEarnest({ value: ether(20) });
      await transaction.wait();
      console.log("Buyer deposits the escrow amount");

      //Check escrow balance
      balance = await escrow.getBalance();
      console.log("Escrow balance: ", ethers.utils.formatEther(balance));
      //finalise the sale
      transaction = await escrow.connect(buyer).finalizeSale();
      await transaction.wait();
      console.log("Buyer finalises the sale");

      //expects buyer to be the nft owner after the sale
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);
    });
  });
});
