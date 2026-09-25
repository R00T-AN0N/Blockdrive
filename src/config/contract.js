
export const CONTRACT_ADDRESS = "0x01dE343f12A89898Cc97f4D9AEae1217907592De";

export const CONTRACT_ABI = 
[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "fileId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "cid",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isPublic",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "allowedViewers",
				"type": "address[]"
			}
		],
		"name": "FileRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "cid",
				"type": "string"
			}
		],
		"name": "getFileByCID",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "cidOut",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			},
			{
				"internalType": "address[]",
				"name": "allowedViewers",
				"type": "address[]"
			},
			{
				"internalType": "bool",
				"name": "isPublic",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "fileId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "hasAccess",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextFileId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "cid",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isPublic",
				"type": "bool"
			},
			{
				"internalType": "address[]",
				"name": "allowedViewers",
				"type": "address[]"
			}
		],
		"name": "registerFile",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "cids",
				"type": "string[]"
			},
			{
				"internalType": "bool[]",
				"name": "isPublicList",
				"type": "bool[]"
			},
			{
				"internalType": "address[][]",
				"name": "allowedViewersList",
				"type": "address[][]"
			}
		],
		"name": "registerFilesBatch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]