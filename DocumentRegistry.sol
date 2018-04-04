pragma solidity ^0.4.18;

contract DocumentRegistry {

    struct Document {
        string hash;
        uint256 dateAdded;
    }

    address contractOwner;
    Document[] private documents;

    modifier onlyOwner() {
        require(contractOwner == msg.sender);
        _;
    }

    function DocumentRegistry() public {
        contractOwner = msg.sender;
    }

    function add(string hash) public onlyOwner returns (uint dateAdded) {
        dateAdded = block.timestamp;
        documents.push(Document(hash, dateAdded));
    }

    function getDocumentsCount() public view returns (uint length) {
        length = documents.length;
    }

    function getDocument(uint index) public view returns (string, uint) {
        Document memory document = documents[index];
        return (document.hash, document.dateAdded);
    }

}