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

    // ##############################################################################
    // Events...
    event NoteCreated(uint256 _noteId, string _content, address _owner, Visibility _visibility);
    event NoteShared(uint256 _noteId, address _sharedWidth);
    event NoteVisibilityChanged(uint256 _noteId, Visibility _visibility);
    event NoteDeleted(uint256 _noteId);

    // ##############################################################################
    // Custom errors... 
    error NoteDoesNotExist(uint256 _noteId);
    error UnauthorizedAccess(uint256 _noteId, address _caller);

    // ##############################################################################
    // Modifiers...
    modifier onlyOwner(uint256 _noteId) {
        require(msg.sender == notes[_noteId].owner, "Not the owner of this note");
        _;
    }

    modifier onlyAuthorized(uint256 _noteId) {
        if(  msg.sender != notes[_noteId].owner &&  notes[_noteId].sharedWith[msg.sender] == false && notes[_noteId].visibility != Visibility.Public) {
            revert UnauthorizedAccess(_noteId, msg.sender);
        }
        _;
    }

    modifier noteExist(uint256 _noteId, uint _noteCount) {
        if(!notes[_noteId].exists){
            revert NoteDoesNotExist(_noteId);
        }
        assert(_noteId <= _noteCount); // Assertion check
        _;
    }

    // ##############################################################################
    constructor() {
        noteCount = 0;
    }

    function createNote(string memory _content, Visibility _visibility) 
        public 
    {
        require(bytes(_content).length > 0, "The note cant be empty");

        noteCount++;
        notes[noteCount].content = _content;
        notes[noteCount].owner = msg.sender;
        notes[noteCount].exists = true;
        notes[noteCount].visibility = _visibility;

        emit NoteCreated(noteCount, _content, msg.sender, _visibility);
    }

    function getNote(uint256 _noteId) 
        public 
        noteExist(_noteId, noteCount)
        onlyAuthorized(_noteId)
        view 
        returns (string memory) 
    {
        return notes[_noteId].content;
    }

    function shareWith(uint256 _noteId, address _user) public 
        onlyOwner(_noteId) 
        noteExist(_noteId, noteCount) 
    {
        notes[_noteId].sharedWith[_user] = true;
        emit NoteShared(_noteId, _user);
    }

    function deleteNote(uint256 _noteId) public 
        onlyOwner(_noteId) 
        noteExist(_noteId, noteCount) 
    {
        notes[_noteId].exists = false;
        delete notes[_noteId];
        emit NoteDeleted(_noteId);
    }

    function changeVisibility(uint256 _noteId, Visibility _newVisibility) public 
        onlyOwner(_noteId) 
        noteExist(_noteId, noteCount) 
    {
        notes[_noteId].visibility = _newVisibility;
        emit NoteVisibilityChanged(_noteId, _newVisibility);
    }

    // ##############################################################################
    receive() external payable {
        (bool success, ) = msg.sender.call{value: msg.value}("");
        require(success, "Failed to refund Ether");
    }
}