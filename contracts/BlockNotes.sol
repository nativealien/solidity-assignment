// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract BlockNotes {
    uint256 public noteCount;
    
    struct Note {
        uint256 id;
        string content;
    }

    mapping(uint256 => Note) public notes;

    constructor() {
        noteCount = 0;
    }

    function createNote(string memory _content) public {
        noteCount++;
        notes[noteCount] = Note(noteCount, _content);
    }

    function getNote(uint256 _id) public view returns (string memory) {
        require(_id > 0 && _id <= noteCount, "Note does not exist.");
        return notes[_id].content;
    }
}