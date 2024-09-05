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

  it("should create a note with visibility", async () => {
    await blockNotes.createNote("Private note", 0);
    const noteContent = await blockNotes.getNote(1);
    expect(noteContent).to.equal("Private note");
  })

  it("should not accept empty note", async () => {
    await expect(blockNotes.createNote("", 0))
        .to.be.rejectedWith("The note cant be empty");
  })

  it("should raise error on non existant message", async () => {
    await expect(blockNotes.getNote(99))
        .to.be.rejectedWith("Note does not exist");
  })

});