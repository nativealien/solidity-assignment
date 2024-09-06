import { expect } from "chai";
import { ContractTransactionResponse } from "ethers";
import { ethers } from "hardhat";
import { BlockNotes } from "../typechain-types";

describe("BlockNotes:", function () {
  let blockNotes: BlockNotes & { deploymentTransaction(): ContractTransactionResponse; };
  let owner: any, addr1: any, addr2: any;

  beforeEach( async function () {
    const BlockNotes = await ethers.getContractFactory("BlockNotes");
    [owner, addr1, addr2] = await ethers.getSigners();

    blockNotes = await BlockNotes.deploy();
  });

  // ##############################################################################
  // createNote function...
  describe("createNote function:", () => {

    it("should create a note", async () => {
      await blockNotes.createNote("First note", 0)
      const [note] = await blockNotes.getNote(1)
      expect(note).to.be.equal("First note")
    })

    it("should reject empty note", async () => {
      await expect(blockNotes.createNote("", 0))
        .to.be.rejectedWith("The note cant be empty");
    })

    it("should create a note with visibility private", async () => {
      await blockNotes.createNote("First private note", 0)
      const [note, visibility] = await blockNotes.getNote(1)
      expect(visibility).to.be.equal(0)
    })

    it("should create a note with visibility shared", async () => {
      await blockNotes.createNote("First shared note", 1)
      const [note, visibility] = await blockNotes.getNote(1)
      expect(visibility).to.be.equal(1)
    })

    it("should create a note with visibility public", async () => {
      await blockNotes.createNote("First note", 2)
      const [note, visibility] = await blockNotes.getNote(1)
      expect(visibility).to.be.equal(2)
    })

    it("should emit NoteCreated event upon note creation", async () => {
      await expect(blockNotes.createNote("Note created", 0))
        .to.emit(blockNotes, "NoteCreated")
        .withArgs(1, "Note created", owner.getAddress(), 0)
    })

  })

  // ##############################################################################
  // getNote function...
  describe("getNote function:", () => {

    beforeEach( async () => {
      await blockNotes.createNote("Private note to get", 0)
      await blockNotes.createNote("Shared note to get", 1)
      await blockNotes.createNote("Public note to get", 2)
    })

    it("should not be possible to get non existing notes", async () => {
      await expect(blockNotes.getNote(99))
        .to.revertedWithCustomError(blockNotes, "NoteDoesNotExist")
    })

    it("should allow user to get private note", async () => {
      const [note] = await blockNotes.getNote(1)
      expect(note).to.be.equal("Private note to get")
    })

    it("should allow user to get shared note", async () => {
      const [note] = await blockNotes.getNote(2)
      expect(note).to.be.equal("Shared note to get")
    })

    it("should allow user to get public note", async () => {
      const [note] = await blockNotes.getNote(3)
      expect(note).to.be.equal("Public note to get")
    })

    it("should not allow unauthorized users to get private notes", async () => {
      await expect(blockNotes.connect(addr1).getNote(1))
        .to.revertedWithCustomError(blockNotes, "UnauthorizedAccess")
    })

    it("should not allow un-shared users to get private notes", async () => {
      await expect(blockNotes.connect(addr1).getNote(2))
        .to.revertedWithCustomError(blockNotes, "UnauthorizedAccess")
    })

  })

  // ##############################################################################
  // shareWidth function...
  describe("shareWith function:", () => {
    beforeEach( async () => {
      await blockNotes.createNote("Shared note", 1)
    })

    it("should not be possible to share non existing notes", async () => {
      await expect(blockNotes.shareWith(99, addr1))
        .to.revertedWithCustomError(blockNotes, "NoteDoesNotExist")
    })

    it("should allow user to share notes", async () => {
      await blockNotes.shareWith(1, addr1)
      const [note] = await blockNotes.connect(addr1).getNote(1)
      expect(note).to.be.equal("Shared note")
    })


    it("should not allow not shared users to get note", async () => {
      await blockNotes.shareWith(1, addr1)
      await expect(blockNotes.connect(addr2).getNote(1))
        .to.revertedWithCustomError(blockNotes, "UnauthorizedAccess")
    })

    it("shouldnt let non owners to share a note", async () => {
      await expect(blockNotes.connect(addr2).shareWith(1, addr1))
        .to.rejectedWith("Not the owner of this note")

    })

    it("should emit NoteShared event upon note shareing", async () => {
      await expect(blockNotes.shareWith(1, addr1))
        .to.emit(blockNotes, "NoteShared")
        .withArgs(1, addr1)
    })
  })

  // ##############################################################################
  // deleteNote function...
  describe("deleteNote function:", async () => {

    beforeEach( async () => {
      await blockNotes.createNote("Note to deletet", 0)
    })

    it("should not be possible to delete non existing notes", async () => {
      await expect(blockNotes.deleteNote(99))
        .to.revertedWithCustomError(blockNotes, "NoteDoesNotExist")
    })

    it("should allow the user to delete a note", async () => {
      await blockNotes.deleteNote(1)
      await expect(blockNotes.getNote(1))
        .to.revertedWithCustomError(blockNotes, "NoteDoesNotExist")
    })

    it("should only let owner delete note", async () => {
      await expect(blockNotes.connect(addr1).deleteNote(1))
        .to.be.rejectedWith("Not the owner of this note")
    })

    it("should emit NoteShared event upon note shareing", async () => {
      await expect(blockNotes.deleteNote(1))
        .to.emit(blockNotes, "NoteDeleted")
        .withArgs(1)
    })

  })

  // ##############################################################################
  // deleteNote function...
  describe("changeVisibility function:", async () => {
    beforeEach( async () => {
      await blockNotes.createNote("Note to change", 0)
    })

    it("should not be possible to change visibility on non existing notes", async () => {
      await expect(blockNotes.changeVisibility(99, 1))
        .to.revertedWithCustomError(blockNotes, "NoteDoesNotExist")
    })

    it("should allow the user to change from private to shared", async () => {
      await blockNotes.changeVisibility(1, 1)
      const [note, visibility] = await blockNotes.getNote(1)
      expect(visibility).to.be.equal(1)
    })

    it("should allow the user to change from shared to public", async () => {
      await blockNotes.changeVisibility(1, 1)
      await blockNotes.changeVisibility(1, 2)
      const [note, visibility] = await blockNotes.getNote(1)
      expect(visibility).to.be.equal(2)
    })

    it("should not allow other users than owner to change visibility", async () => {
      await expect(blockNotes.connect(addr1).changeVisibility(1, 1))
        .to.rejectedWith("Not the owner of this note")
    })
  })

  describe("receive function:", async () => {

    it("should refund ether sent to contract", async () => {
      const sendValue = ethers.parseEther("1.0");

      const contractBalanceBefore = await ethers.provider.getBalance(blockNotes.getAddress());
      const senderBalanceBefore = await ethers.provider.getBalance(addr1.getAddress());

      const tx = await addr1.sendTransaction({
          to: blockNotes.getAddress(),
          value: sendValue,
      });

      const receipt = await tx.wait();

      const gasUsed = receipt.gasUsed; 
      const gasPrice = tx.gasPrice;
      const gasCost = BigInt(gasPrice * gasUsed);

      const contractBalanceAfter = await ethers.provider.getBalance(blockNotes.getAddress());
      const senderBalanceAfter = await ethers.provider.getBalance(addr1.getAddress());

      expect(contractBalanceAfter).to.equal(contractBalanceBefore);
      expect(senderBalanceAfter).to.equal(senderBalanceBefore - gasCost);
    })
  })

})