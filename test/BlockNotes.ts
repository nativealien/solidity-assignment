import { expect } from "chai";
import { AddressLike, ContractTransactionResponse, Typed } from "ethers";
import { ethers } from "hardhat";
import { BlockNotes } from "../typechain-types";

describe("BlockNotes", function () {
  let BlockNotes, blockNotes: BlockNotes & { deploymentTransaction(): ContractTransactionResponse; };
  let owner, addr1: any, addr2: any;

  beforeEach(async function () {
    BlockNotes = await ethers.getContractFactory("BlockNotes");
    [owner, addr1, addr2]  = await ethers.getSigners()
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

  // Shared notes...

  it("should allow user to share notes with other users", async () => {
    await blockNotes.createNote("Shared note", 0);
    await blockNotes.shareWith(1, addr1);
    const note = await blockNotes.connect(addr1).getNote(1);
    expect(note).to.equal("Shared note")
  })

  it("should not share with unauthorized users", async () => {
    await blockNotes.createNote("Shared note", 0);
    await blockNotes.shareWith(1, addr1);

    await expect(blockNotes.connect(addr2).getNote(1))
        .to.rejectedWith("Not authorized to read the note")
  })

  it("should be availible to all users if public", async () => {
    await blockNotes.createNote("Public note", 2);
    const msg1 = await blockNotes.connect(addr1).getNote(1)
    const msg2 = await blockNotes.connect(addr2).getNote(1)

    expect(msg1 && msg2).to.equal("Public note")
  })

  // Change and delete...

  it("should allow the owner to delete the note", async () => {
    await blockNotes.createNote("Note to delete", 0);
    await blockNotes.deleteNote(1);
    await expect(blockNotes.getNote(1)).to.rejectedWith("Note does not exist")
  })

  it("should allow user to change visibility", async () => {
    await blockNotes.createNote("Note to change", 0);
    await blockNotes.changeVisibility(1, 2);

    const msg1 = await blockNotes.connect(addr1).getNote(1)
    const msg2 = await blockNotes.connect(addr2).getNote(1)

    expect(msg1 && msg2).to.equal("Note to change")
  })

});