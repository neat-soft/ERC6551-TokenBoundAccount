import { useState, useEffect } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { keccak256, toUtf8Bytes } from "ethers";
import axios from "axios";
import Grid from "@mui/material/Grid";
import { API_URL } from "../const";
import SnackbarUtils from "../utils/SnackbarUtils";
import { registryABI } from "../contract/Registry";
import { accountABI } from "../contract/Account";
import { implementation, factoryAddress } from "../const";
import CircularIndeterminate from "../components/Loader";
import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from "@mui/material/Dialog";
import { DialogTitle, DialogContent } from "@mui/material";
import EtherICon from "../images/ether.png";
import "./Token.css";
const Web3 = require("web3");
const alchemyConfig = {
    apiKey: "aD0TwthJhlJ1oZi91vnabibGPCkdz9_4",
    network: Network.ETH_GOERLI,
};
const alchemy = new Alchemy(alchemyConfig);
export default function TokenLayout() {
    const [web3, setWeb3] = useState(null);
    const [nft, setNft] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingTokenList, setLoadingTokenList] = useState(false);
    const [deployingTBA, setDeployingTBA] = useState(false);
    const [sendingToken, setSendingToken] = useState(false);
    const [assets, setAssets] = useState([]);
    const [nfts, setNfts] = useState([]);
    const [isTBADeployed, setIsTBADeployed] = useState(false);
    const [showWithdrawDlg, setShowWithdrawDlg] = useState(false);
    const [withdrawAmount, setWithdarwAmount] = useState(1);
    const [withdrawAddress, setWithdarwAddress] = useState("0x8a5c1768EA7000a0fF29560cfa48602684931fFb");
    const [isNFTOwner, setIsNFTOwner] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedNFT, setSelectedNft] = useState(null);
    const [showTransferNFTDlg, setShowTransferNFTDlg] = useState(false);
    const [tba, setTba] = useState(null);
    const [canUseWallet, setCanUseWallet] = useState(false);
    let path = window.location.pathname.split("/");
    let tokenId = path[path.length - 1];
    let address = path[path.length - 2];
    let { ethereum } = window;
    useEffect(() => {
        const loadWeb3 = async () => {
            if (ethereum) {
                const web3 = new Web3(ethereum);
                try {
                    setWeb3(web3);
                } catch (error) {
                    console.error(error);
                }
            } else if (window.web3) {
                const web3 = new Web3(window.web3.currentProvider);
                setWeb3(web3);
            } else {
                console.error("No web3 provider detected");
            }
        };
        loadWeb3();
    }, []);

    useEffect(() => {
        getTBA();
    }, [web3]);
    useEffect(() => {
        getNFTDetail();
    }, [window.location]);
    const getNFTDetail = async () => {
        setIsLoading(true);
        axios
            .get(`${API_URL}/token/${address}/${tokenId}`)
            .then((response) => {
                setNft(response?.data?.data);
                const owner = response?.data?.data?.owner_of;
                if (
                    owner &&
                    ethereum.selectedAddress &&
                    owner.toLowerCase() == ethereum.selectedAddress.toLowerCase()
                ) {
                    setIsNFTOwner(true);
                } else {
                    setIsNFTOwner(false);
                }
                if (
                    response &&
                    response.data &&
                    response.data.data &&
                    response.data.data.metadata
                ) {
                    const mtData = JSON.parse(response.data.data.metadata);

                    setMetadata(mtData);
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
                SnackbarUtils.error(err.message);
                setIsLoading(false);
            });
    };
    const ellipsisAddress = (address) => {
        if (address) {
            return (
                address.substring(0, 5) +
                "..." +
                address.substring(address.length - 4, address.length)
            );
        } else {
            return "";
        }
    };
    const getTBA = async () => {
        try {
            if (web3) {
                const contractInstance = new web3.eth.Contract(registryABI, factoryAddress);
                const chainId = await web3.eth.getChainId();
                const res = await contractInstance.methods
                    .account(implementation, chainId, address, tokenId, 0)
                    .call();
                if (res) {
                    setTba(res);
                    const code = await web3.eth.getCode(res);
                    if (code == "0x") {
                        setIsTBADeployed(false);
                    } else {
                        setIsTBADeployed(true);
                        getTokenList(res);
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    };
    const getTokenList = async (tba) => {
        setLoadingTokenList(true);
        if (!tba) {
            setLoadingTokenList(false);
            return;
        }
        let ethBalance = await web3.eth.getBalance(tba);
        ethBalance = ethBalance / Math.pow(10, 18);
        ethBalance = ethBalance.toFixed(3);
        const balances = await alchemy.core.getTokenBalances(tba);
        const nftList = await alchemy.nft.getNftsForOwner(tba);
        const nonZeroBalances = balances.tokenBalances.filter((token) => {
            return (
                token.tokenBalance !== "0" &&
                token.tokenBalance !==
                    "0x0000000000000000000000000000000000000000000000000000000000000000"
            );
        });
        let nfts = [];
        for (let nft of nftList.ownedNfts) {
            nfts.push({
                name: nft.contract.name,
                symbol: nft.contract.symbol,
                balance: nft.balance,
                address: nft.contract.address,
                image: nft.media && nft.media.length > 0 ? nft.media[0].gateway : null,
                tokenId: nft.tokenId
            });
        }
        console.log(nfts);
        let tokens = [];
        tokens.push({
            balance: ethBalance,
            name: "Goerli Ether",
            symbol: "ETH",
            logo: null,
            decimals: 18,
            address: "0x0000000000000000000000000000000000000000",
        });
        for (let token of nonZeroBalances) {
            
            // Get balance of token
            let balance = token.tokenBalance;
            // Get metadata of token
            const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
            console.log(metadata)
            // Compute token balance in human-readable format
            balance = balance / Math.pow(10, metadata.decimals);
            balance = balance.toFixed(3);
            // Print name, balance, and symbol of token
            tokens.push({
                balance: balance,
                name: metadata.name,
                symbol: metadata.symbol,
                logo: metadata.logo,
                decimals: metadata.decimals,
                address: token.contractAddress,
            });
        }
        setAssets(tokens);
        setNfts(nfts);
        setLoadingTokenList(false);
    };
    const deployTBA = async () => {
        try {
            if (web3) {
                const contractInstance = new web3.eth.Contract(registryABI, factoryAddress);
                const chainId = await web3.eth.getChainId();
                setDeployingTBA(true);
                const res = await contractInstance.methods
                    .createAccount(
                        implementation,
                        chainId,
                        address,
                        tokenId,
                        0,
                        keccak256(toUtf8Bytes("hello TBA!"))
                    )
                    .send({ from: ethereum.selectedAddress });
                console.log(res);
                getTBA();
                setDeployingTBA(false);
            }
        } catch (e) {
            console.log(e);
            SnackbarUtils.error(e);
            setDeployingTBA(false);
        }
    };
    const onClickUseWallet = async () => {
        try {
            if (!ethereum.selectedAddress) {
                SnackbarUtils.error("Please unlock your account");
                setAssets([]);
                return;
            }
            const accountContractInstance = new web3.eth.Contract(accountABI, tba);
            const owner = await accountContractInstance.methods.owner().call();
            if (
                owner &&
                ethereum.selectedAddress &&
                owner.toLowerCase() != ethereum.selectedAddress.toLowerCase()
            ) {
                SnackbarUtils.error("You are not owner of this NFT");
                setAssets([]);
                return;
            } else {
                setCanUseWallet(true);
            }
        } catch (e) {
            console.log(e);
            SnackbarUtils.error(e);
            setAssets([]);
            setCanUseWallet(false);
        }
    };
    const withdraw = async (asset) => {
        setSelectedAsset(asset);
        setShowWithdrawDlg(true);
    };
    const transferNFT = (nft) => {
        setSelectedNft(nft);
        setShowTransferNFTDlg(true);
    };
    const confirmWithdraw = async () => {
        try {
            if (!withdrawAddress || withdrawAddress == "") {
                SnackbarUtils.warning("Please input withdraw address");
                return;
            }
            if (!withdrawAmount || withdrawAmount <= 0) {
                SnackbarUtils.warning("Please input withdraw amount");
                return;
            }
            if (!selectedAsset) {
                SnackbarUtils.warning("Please select correct asset.");
                return;
            }
            setSendingToken(true);
            if (selectedAsset.balance < withdrawAmount) {
                SnackbarUtils.error(
                    `You don't have enough balance of ${selectedAsset.name}. Please input correct amount.`
                );
                return;
            }
            const signature = {
                inputs: [
                    { internalType: "address", name: "to", type: "address" },
                    { internalType: "uint256", name: "amount", type: "uint256" },
                ],
                name: "transfer",
                type: "function",
                outputs: [{ internalType: "bool", name: "", type: "bool" }],
            };
            // Generate byte code
            // const value = web3.utils.toWei(withdrawAmount.toString(), "ether");
            let value = Number(withdrawAmount * Math.pow(10, selectedAsset.decimals));
            value = web3.utils.toBN(value).toString();
            // return
            const byteCode = web3.eth.abi.encodeFunctionCall(signature, [withdrawAddress, value]);
            const accountContractInstance = new web3.eth.Contract(accountABI, tba);
            if (selectedAsset.symbol == "ETH") {
                const res = await accountContractInstance.methods
                .executeCall(withdrawAddress, web3.utils.toWei(withdrawAmount, 'ether'), keccak256(toUtf8Bytes("")))
                .send({ from: ethereum.selectedAddress });
            } else {
                const res = await accountContractInstance.methods
                .executeCall(selectedAsset.address, 0, byteCode)
                .send({ from: ethereum.selectedAddress });
            }
            
            SnackbarUtils.success("Withdraw completed");
            getTokenList(tba);
            setShowWithdrawDlg(false);
            setSendingToken(false);
        } catch (e) {
            SnackbarUtils.warning(e);
            console.log(e);
            getTokenList(tba);
            setShowWithdrawDlg(false);
            setSendingToken(false);
        }
    };
    const confirmTransferNFT = async () => {
        try {
            if (!withdrawAddress || withdrawAddress == "") {
                SnackbarUtils.warning("Please input withdraw address");
                return;
            }
            if (!withdrawAmount || withdrawAmount <= 0) {
                SnackbarUtils.warning("Please input withdraw amount");
                return;
            }
            if (!selectedNFT) {
                SnackbarUtils.warning("Please select correct asset.");
                return;
            }
            setSendingToken(true);
            if (selectedNFT.balance < withdrawAmount) {
                SnackbarUtils.error(
                    `You don't have enough balance of ${selectedNFT.name}. Please input correct amount.`
                );
                return;
            }
            const signature = {
                inputs: [
                    { internalType: "address", name: "from", type: "address" },
                    { internalType: "address", name: "to", type: "address" },
                    { internalType: "uint256", name: "tokenId", type: "uint256" },
                ],
                name: "transferFrom",
                type: "function",
                outputs: [],                
            };
            // Generate byte code
            const value = web3.utils.toWei(withdrawAmount.toString(), "ether");
            const byteCode = web3.eth.abi.encodeFunctionCall(signature, [tba, withdrawAddress, selectedNFT.tokenId]);

            
            const accountContractInstance = new web3.eth.Contract(accountABI, tba);
            // const res = await accountContractInstance.methods.token().send({from: ethereum.selectedAddress})
            const res = await accountContractInstance.methods
                .executeCall(selectedNFT.address, 0, byteCode)
                .send({ from: ethereum.selectedAddress });
            SnackbarUtils.success("Transfer completed");
            getTokenList(tba);
            setShowTransferNFTDlg(false);
            setSendingToken(false);
        } catch (e) {
            SnackbarUtils.warning(e);
            console.log(e);
            setSendingToken(false);
            getTokenList(tba);
            setShowTransferNFTDlg(false);
        }
    };
    const closeWithdrawDlg = () => {
        setShowWithdrawDlg(false);
    };
    const closeTransferNFTDlg = () => {
        setShowTransferNFTDlg(false);
    };
    const onChangeWithdrawAmount = (e) => {
        setWithdarwAmount(e.target.value);
    };
    const onChangeWithdrawAddress = (e) => {
        setWithdarwAddress(e.target.value);
    };
    return (
        <div className="container">
            <h1>NFT Details</h1>
            {isLoading ? (
                <CircularIndeterminate />
            ) : (
                <Grid container spacing={2}>
                    <Dialog
                        open={showWithdrawDlg}
                        onClose={closeWithdrawDlg}
                        className="withdarw-dlg"
                    >
                        <DialogContent className="withdarw-dlg-content">
                            <DialogTitle>Withdraw</DialogTitle>
                            <div>
                                <label>Amount:</label>
                                <input
                                    onChange={onChangeWithdrawAmount}
                                    type="number"
                                    value={withdrawAmount}
                                ></input>
                            </div>
                            <div>
                                <label>Address:</label>
                                <input
                                    onChange={onChangeWithdrawAddress}
                                    value={withdrawAddress}
                                ></input>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <LoadingButton
                                    className="btn-confirm"
                                    loading={sendingToken}
                                    fullWidth
                                    loadingPosition="start"
                                    startIcon={<span></span>}
                                    onClick={confirmWithdraw}
                                >
                                    Confirm
                                </LoadingButton>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        open={showTransferNFTDlg}
                        onClose={closeTransferNFTDlg}
                        className="withdarw-dlg"
                    >
                        <DialogContent className="withdarw-dlg-content">
                            <DialogTitle>Transfer</DialogTitle>
                            <div>
                                <label>Amount:</label>
                                <input
                                    onChange={onChangeWithdrawAmount}
                                    type="number"
                                    value={withdrawAmount}
                                ></input>
                            </div>
                            <div>
                                <label>Address:</label>
                                <input
                                    onChange={onChangeWithdrawAddress}
                                    value={withdrawAddress}
                                ></input>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <LoadingButton
                                    className="btn-confirm"
                                    loading={sendingToken}
                                    fullWidth
                                    loadingPosition="start"
                                    startIcon={<span></span>}
                                    onClick={confirmTransferNFT}
                                >
                                    Confirm
                                </LoadingButton>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Grid xs={6}>
                        <img style={{ width: "90%" }} src={metadata?.image} />
                        <p className="tokenName">{metadata?.name}</p>
                    </Grid>
                    <Grid xs={6}>
                        <div className="tokenDetails">
                            <div className="detail-header">
                                <a
                                    className="exploer"
                                    target="blank"
                                    href={`https://goerli.etherscan.io/address/${tba}`}
                                >
                                    <div>
                                        <span>{ellipsisAddress(tba)}</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2.5"
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                            ></path>
                                        </svg>
                                    </div>
                                </a>
                                {tba &&
                                    isNFTOwner &&
                                    (isTBADeployed ? (
                                        <button className="btn-primary" onClick={onClickUseWallet}>
                                            Use Wallet
                                        </button>
                                    ) : (
                                        <LoadingButton
                                            className="btn-purple"
                                            loading={deployingTBA}
                                            fullWidth
                                            loadingPosition="start"
                                            startIcon={<span></span>}
                                            onClick={deployTBA}
                                        >
                                            Deploy Account
                                        </LoadingButton>
                                    ))}
                            </div>
                            <div className="detail-body">
                                {loadingTokenList ? (
                                    <CircularIndeterminate />
                                ) : (
                                    <div style={{ position: "relative" }}>
                                        <p>ASSETS</p>
                                        <div className="assets-header">
                                            <span>Portfolio</span>
                                            <span>Name</span>
                                            <span>Symbol</span>
                                            <span>Balance</span>
                                        </div>
                                        <hr></hr>
                                        {/* {sendingToken && <CircularIndeterminate />} */}

                                        {assets.map((asset, index) => (
                                            <div className="assets" key={`assets_${index}`}>
                                                <span>
                                                    <img src={EtherICon}></img>
                                                </span>
                                                <span>{asset.name}</span>
                                                <span>{asset.symbol}</span>
                                                <span>{asset.balance}</span>
                                                {canUseWallet && (
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => withdraw(asset)}
                                                    >
                                                        Withdraw
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {nfts.map((nft, index) => (
                                            <div className="assets" key={`nfts_${index}`}>
                                                <span>
                                                    <img src={nft.image}></img>
                                                </span>
                                                <span>{nft.name}</span>
                                                <span>{nft.symbol}</span>
                                                <span>{nft.balance}</span>
                                                {canUseWallet && (
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => transferNFT(nft)}
                                                    >
                                                        Transfer
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Grid>
                </Grid>
            )}
        </div>
    );
}
