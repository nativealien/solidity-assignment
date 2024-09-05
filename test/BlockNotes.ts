import { expect } from "chai";
import { ContractTransactionResponse } from "ethers";
import { ethers } from "hardhat";
import { BlockNotes } from "../typechain-types";

describe("BlockNotes", function () {
  let BlockNotes, blockNotes: BlockNotes & { deploymentTransaction(): ContractTransactionResponse; };

  beforeEach(async function () {
    BlockNotes = await ethers.getContractFactory("BlockNotes");
    blockNotes = await BlockNotes.deploy();
  });

//   it("should start with a note count of 0", async () => {
//     const noteCount = await blockNotes.noteCount();
//     expect(noteCount).to.equal(0);
//   });

  it("should create a note with visibility", async () => {
    await blockNotes.createNote("Private note", 0);
    const noteContent = await blockNotes.getNote(1)
    expect(noteContent).to.equal("Private note", "Note content is incorrect")
  })

//   it("Should allow a user to create a note", async function () {
//     await blockNotes.createNote("First note");
//     const noteCount = await blockNotes.noteCount();
//     expect(noteCount).to.equal(1);

//     const note = await blockNotes.getNote(1);
//     expect(note).to.equal("First note");
//   });

//   it("Should return the correct note text", async function () {
//     await blockNotes.createNote("First note");
//     await blockNotes.createNote("Second note");

//     const firstNote = await blockNotes.getNote(1);
//     const secondNote = await blockNotes.getNote(2);

//     expect(firstNote).to.equal("First note");
//     expect(secondNote).to.equal("Second note");
//   });

//   it("Should fail if note doesnt exist", async function () {
//     await expect(blockNotes.getNote(999)).to.be.rejectedWith("Note does not exist.");
//   });


});