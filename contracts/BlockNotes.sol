// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract BlockNotes {
    enum Visibility { Private, Shared, Public }
    
    struct Note {
        string content;
        address owner;
        Visibility visibility;
    }

    mapping(uint256 => Note) private notes;
    uint256 private noteCount;

    constructor() {
        noteCount = 0;
    }

    function createNote(string memory _content, Visibility visibility) public {
        require(bytes(_content).length > 0, "The note cant be empty");
        noteCount++;
        notes[noteCount] = Note(_content, msg.sender, visibility);
    }

    function getNote(uint256 _id) public view returns (string memory) {
        require(_id > 0 && _id <= noteCount, "Note does not exist");
        return notes[_id].content;
    }
}