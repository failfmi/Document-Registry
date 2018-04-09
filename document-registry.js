$(document).ready(function () {
    const IPFS = window.IpfsApi('localhost', '5001');
    const Buffer = IPFS.Buffer;
    const documentRegistryContractAddress = "0x80a493a0c1a29b765747d33a2032402a75d73d3a";
    const documentRegistryContractABI = [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "hash",
                    "type": "string"
                }
            ],
            "name": "add",
            "outputs": [
                {
                    "name": "dateAdded",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "index",
                    "type": "uint256"
                }
            ],
            "name": "getDocument",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                },
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getDocumentsCount",
            "outputs": [
                {
                    "name": "length",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ];

    $('#linkHome').click(function () {
        showView("viewHome")
    });
    $('#linkSubmitDocument').click(function () {
        showView("viewSubmitDocument")
    });
    $('#linkGetDocuments').click(function () {
		$('#viewGetDocuments div').remove();
        showView("viewGetDocuments");
        viewGetDocuments();
    });
    $('#documentUploadButton').click(uploadDocument);

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function () {
            $("#loadingBox").show()
        },
        ajaxStop: function () {
            $("#loadingBox").hide()
        }
    });

    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();
    }

    function showInfo(message) {
        $('#infoBox>p').html(message);
        $('#infoBox').show();
        $('#infoBox>header').click(function () {
            $('#infoBox').hide();
        });
    }

    function showError(errorMsg) {
        $('#errorBox>p').html("Error: " + errorMsg);
        $('#errorBox').show();
        $('#errorBox>header').click(function () {
            $('#errorBox').hide();
        });
    }

    function uploadDocument() {
        if ($('#documentForUpload')[0].files.length === 0) {
            return showError("Please select a file to upload.");
        }
        let fileReader = new FileReader();
        fileReader.onload = function () {
            if (typeof web3 === 'undefined')
                return showError("Please install MetaMask to access the Ethereum Web3 API from your Web browser.");
            let fileBuffer = Buffer.from(fileReader.result);

            let contract = web3.eth.contract(documentRegistryContractABI).at(documentRegistryContractAddress);
            IPFS.files.add(fileBuffer, (err, result) => {
                if (err)
                    return showError(err);
                if (result) {
                    let ipfsHash = result[0].hash;
                    contract.add(ipfsHash, function (err, txHash) {
                        if (err)
                            return showError("Smart contract call failed: " + err);
                        showInfo(`Document ${ipfsHash} <b>successfully added</b> to the registry. Transaction hash: ${txHash}`);
                    })
                }
            })
        };
        fileReader.readAsArrayBuffer($('#documentForUpload')[0].files[0]);
    }

    function viewGetDocuments() {
        if (typeof web3 === 'undefined')
            return showError("Please install MetaMask to access the Ethereum Web3 API from your Web browser.");

        let contract = web3.eth.contract(documentRegistryContractABI).at(documentRegistryContractAddress);
        contract.getDocumentsCount(function (err, result) {
            console.log(result);
            if (err)
                return showError("Smart contract failed: " + err);
            let documentsCount = result.toNumber();
            console.log(documentsCount);
            if (documentsCount > 0) {
                let html = $('<div>');
                for (let i = 0; i < documentsCount; i++) {
                    contract.getDocument(i, function (err, result) {
                        if (err)
                            return showError("Smart contract call failed: " + err);
                        console.log(result);
                        let ipfsHash = result[0];
                        let contractPublishDate = result[1];
                        let div = $('<div>');
                        let url = "https://ipfs.io/ipfs/" + ipfsHash;

                        let displayDate = new Date(contractPublishDate * 1000).toLocaleString();
                        div
                            .append($(`<p>Document published on: ${displayDate}</p>`))
                            .append($(`<img src="${url}" />`));
                        html.append(div);
                    })
                }
                html.append('</div>');
                $('#viewGetDocuments').append(html);
            }
            else {
                $('#viewGetDocuments').append('<div> No documents in the document registry.</div>');
            }
        });
    }
});


