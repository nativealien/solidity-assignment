// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract BlockNotes {
    enum Visibility { Private, Shared, Public }
    
    struct Note {
        string content;
        address owner;
        bool exists;
        Visibility visibility;
        mapping(address => bool) sharedWith;
    }

    mapping(uint256 => Note) private notes;
    uint256 private noteCount;

    event NoteCreated(uint256 _noteId, string _content, address _owner, Visibility _visibility);

    modifier onlyOwner(uint256 _noteId) {
        require(msg.sender == notes[_noteId].owner, "Not the owner of this note");
        _;
    }

    modifier noteExist(uint256 _noteId) {
        require(_noteId > 0 && 
                _noteId <= noteCount && 
                notes[_noteId].exists == true, "Note does not exist");
        _;
    }

    constructor() {
        noteCount = 0;
    }

    function createNote(string memory _content, Visibility _visibility) public {
        require(bytes(_content).length > 0, "The note cant be empty");

        noteCount++;
        notes[noteCount].content = _content;
        notes[noteCount].owner = msg.sender;
        notes[noteCount].exists = true;
        notes[noteCount].visibility = _visibility;

        emit NoteCreated(noteCount, _content, msg.sender, _visibility);
    }

    function getNote(uint256 _noteId) public 
        noteExist(_noteId)
        view returns (string memory) {

        require(msg.sender == notes[_noteId].owner || 
                notes[_noteId].sharedWith[msg.sender] == true || 
                notes[_noteId].visibility == Visibility.Public, "Not authorized to read the note");

        return notes[_noteId].content;
    }

    function shareWith(uint256 _noteId, address _user) public 
        onlyOwner(_noteId) 
        noteExist(_noteId) {

        notes[_noteId].sharedWith[_user] = true;
    }

    function deleteNote(uint256 _noteId) public 
        onlyOwner(_noteId) 
        noteExist(_noteId) {

        delete notes[_noteId];
    }

    function changeVisibility(uint256 _noteId, Visibility newVisibility) public 
        onlyOwner(_noteId) 
        noteExist(_noteId) {

        notes[_noteId].visibility = newVisibility;
    }
}