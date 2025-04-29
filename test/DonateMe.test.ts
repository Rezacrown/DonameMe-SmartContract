import { expect } from "chai";
import { ethers } from "hardhat";
import { DonateMe, DonateMe__factory } from "../typechain-types";

describe("DonateMe", function () {
  let donateMe: DonateMe;
  let owner: any;
  let donor1: any;
  let donor2: any;

  const COFFEE_PRICE = ethers.parseEther("0.0002");
  const HOTDOG_PRICE = ethers.parseEther("0.001");
  const CAVIAR_PRICE = ethers.parseEther("0.005");

  before(async function () {
    [owner, donor1, donor2] = await ethers.getSigners();
    const DonateMeFactory = await ethers.getContractFactory("DonateMe");
    donateMe = await DonateMeFactory.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await donateMe.owner()).to.equal(owner.address);
    });

    it("Should have 0 total donations initially", async function () {
      expect(await donateMe.totalAllDonation()).to.equal(0);
    });
  });

  describe("Donations", function () {
    it("Should reject donation from owner", async function () {
      await expect(
        donateMe.connect(owner).donate(0, "test", { value: COFFEE_PRICE })
      ).to.be.revertedWith("Owner can`t donate hismself");
    });

    it("Should reject zero amount donations", async function () {
      await expect(
        donateMe.connect(donor1).donate(0, "test", { value: 0 })
      ).to.be.revertedWith("Donation amount must be greater than 0");
    });

    it("Should accept Coffee tier donation (0.0002 ETH)", async function () {
      await expect(
        donateMe.connect(donor1).donate(0, "Coffee donation", {
          value: COFFEE_PRICE,
        })
      )
        .to.emit(donateMe, "DonationReceived")
        .withArgs(donor1.address, COFFEE_PRICE, "Coffee donation");

      expect(await donateMe.totalAllDonation()).to.equal(COFFEE_PRICE);
    });

    it("Should reject insufficient Coffee tier donation", async function () {
      await expect(
        donateMe.connect(donor1).donate(0, "test", {
          value: COFFEE_PRICE - BigInt(1),
        })
      ).to.be.revertedWith("Insufficient donation for tier");
    });

    it("Should accept Hotdog tier donation (0.001 ETH)", async function () {
      await expect(
        donateMe.connect(donor2).donate(1, "Hotdog donation", {
          value: HOTDOG_PRICE,
        })
      )
        .to.emit(donateMe, "DonationReceived")
        .withArgs(donor2.address, HOTDOG_PRICE, "Hotdog donation");

      expect(await donateMe.totalAllDonation()).to.equal(
        COFFEE_PRICE + HOTDOG_PRICE
      );
    });

    it("Should accept Caviar tier donation (0.005 ETH)", async function () {
      await expect(
        donateMe.connect(donor1).donate(2, "Caviar donation", {
          value: CAVIAR_PRICE,
        })
      )
        .to.emit(donateMe, "DonationReceived")
        .withArgs(donor1.address, CAVIAR_PRICE, "Caviar donation");

      expect(await donateMe.totalAllDonation()).to.equal(
        COFFEE_PRICE + HOTDOG_PRICE + CAVIAR_PRICE
      );
    });

    it("Should reject invalid tier", async function () {
      await expect(
        donateMe.connect(donor1).donate(4, "test", { value: COFFEE_PRICE })
      ).to.be.revertedWith("Tier Choses not found"); // Note: Matches contract's exact error message
    });

    it("Should track donation history per donor", async function () {
      const history = await donateMe.connect(donor1).getHistoryDonate();
      expect(history.length).to.equal(2); // Coffee and Caviar from donor1
      expect(history[0].tier).to.equal(0); // Coffee is first
      expect(history[1].tier).to.equal(2); // Caviar is second
    });
  });

  describe("Withdrawals", function () {
    it("Should reject non-owner withdrawals", async function () {
      await expect(
        donateMe.connect(donor1).withdrawRemainBalance("test")
      ).to.be.revertedWith("Only Owner can access");
    });

    it("Should allow owner to withdraw balance", async function () {
      const contractBalanceBefore = await ethers.provider.getBalance(
        donateMe.getAddress()
      );
      const ownerBalanceBefore = await ethers.provider.getBalance(
        owner.address
      );

      const tx = await donateMe
        .connect(owner)
        .withdrawRemainBalance("Withdrawal test");
      const receipt = await tx.wait();

      // Calculate gas cost (convert to BigInt first)
      const gasUsed = BigInt(receipt!.gasUsed) * receipt!.gasPrice;

      const contractBalanceAfter = await ethers.provider.getBalance(
        donateMe.getAddress()
      );
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(contractBalanceAfter).to.equal(0);
      expect(ownerBalanceAfter).to.equal(
        ownerBalanceBefore + contractBalanceBefore - gasUsed
      );

      await expect(tx)
        .to.emit(donateMe, "OwnerWithdraw")
        .withArgs(owner.address, contractBalanceBefore, "Withdrawal test");
    });
  });
});
