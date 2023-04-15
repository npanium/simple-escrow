const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter", () => {
  let counter;

  beforeEach(async () => {
    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy("My counter", 1);
  });

  describe("Deployment", () => {
    it("Stores the initial count", async () => {
      expect(await counter.count()).to.equal(1);
    });
    it("Stores the initial name", async () => {
      expect(await counter.name()).to.equal("My counter");
    });
  });

  describe("Counting", () => {
    let transaction;

    it("reads the count from the 'count' public variable", async () => {
      expect(await counter.count()).to.equal(1);
    });
    it("reads the count from the 'getCount()' function", async () => {
      expect(await counter.getCount()).to.equal(1);
    });

    it("Increments the count", async () => {
      transaction = await counter.increment();
      await transaction.wait();
      expect(await counter.count()).to.equal(2);

      transaction = await counter.increment();
      await transaction.wait();
      expect(await counter.count()).to.equal(3);
    });
    it("Decrements the count", async () => {
      transaction = await counter.decrement();
      await transaction.wait();
      expect(await counter.count()).to.equal(0);

      //Cannot decrement below 0
      await expect(counter.decrement()).to.be.reverted;
    });

    //Name tests
    it("reads the count from the 'name' public variable", async () => {
      expect(await counter.name()).to.equal("My counter");
    });
    it("reads the count from the 'getName()' function", async () => {
      expect(await counter.getName()).to.equal("My counter");
    });

    it("Updates the name", async () => {
      transaction = await counter.setName("New name");
      await transaction.wait();
      expect(await counter.name()).to.equal("New name");
    });
  });
});
