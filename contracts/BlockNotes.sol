// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract BlockNotes {
    enum Visibility { Private, Shared, Public }
    
    struct Note {
        string content;
        address owner;
        Visibility visibility;
        mapping(address => bool) sharedWith;
    }

    mapping(uint256 => Note) private notes;
    uint256 private noteCount;

    constructor() {
        noteCount = 0;
    }

    function createNote(string memory _content, Visibility _visibility) public {
        require(bytes(_content).length > 0, "The note cant be empty");

        noteCount++;
        notes[noteCount].content = _content;
        notes[noteCount].owner = msg.sender;
        notes[noteCount].visibility = _visibility;
    }

    function getNote(uint256 _noteId) public view returns (string memory) {
        require(_noteId > 0 && _noteId <= noteCount, "Note does not exist");
        return notes[_noteId].content;
    }

    function shareWith(uint256 _noteId, address _user) public {
        require(msg.sender == notes[_noteId].owner, "Not the owner");
        notes[_noteId].sharedWith[_user] = true;
    }

    function isNoteSharedWith(uint256 _noteId, address _user) public view returns (bool) {
        require(_noteId > 0 && _noteId <= noteCount, "Note does not exist");
        return notes[_noteId].sharedWith[_user];
    }
}