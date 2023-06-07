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
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [deployingTBA, setDeployingTBA] = useState(false);
    const [sendingToken, setSendingToken] = useState(false);
    const [assets, setAssets] = useState([]);
    const [isTBADeployed, setIsTBADeployed] = useState(false);
    const [showWithdrawDlg, setShowWithdrawDlg] = useState(false);
    const [withdrawAmount, setWithdarwAmount] = useState(1);
    const [withdrawAddress, setWithdarwAddress] = useState(
        ""
    );
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [tba, setTba] = useState(null);
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
        getToken();
    }, [window.location]);
    const getToken = async () => {
        setIsLoading(true);
        axios
            .get(`${API_URL}/token/${address}/${tokenId}`)
            .then((response) => {
                setNft(response?.data?.data);
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
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
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
            console.log(tba);
            if (!ethereum.selectedAddress) {
                SnackbarUtils.error("Please unlock your account");
                setAssets([]);
                return;
            }
            const accountContractInstance = new web3.eth.Contract(accountABI, tba);
            const owner = await accountContractInstance.methods.owner().call();
            console.log(owner);
            if (owner.toLowerCase() != ethereum.selectedAddress.toLowerCase()) {
                SnackbarUtils.error("You are not owner of this NFT");
                setAssets([]);
                return;
            } else {
                setLoadingBalance(true);
                let ethBalance = await web3.eth.getBalance(tba);
                ethBalance = ethBalance / Math.pow(10, 18);
                ethBalance = ethBalance.toFixed(3);
                const balances = await alchemy.core.getTokenBalances(tba);
                // Remove tokens with zero balance
                console.log(balances)
                const nonZeroBalances = balances.tokenBalances.filter((token) => {
                    return token.tokenBalance !== "0" && token.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000";
                });
                let i = 1;
                let tokens = [];
                // tokens.push({
                //     balance: ethBalance,
                //     name: "Ether",
                //     symbol: "ETH",
                //     logo: "",
                // });
                for (let token of nonZeroBalances) {
                    // Get balance of token
                    let balance = token.tokenBalance;

                    // Get metadata of token
                    const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
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
                setLoadingBalance(false);
            }
        } catch (e) {
            console.log(e);
            SnackbarUtils.error(e);
            setAssets([]);
            setLoadingBalance(false);
        }
    };
    const withdraw = async (asset) => {
        console.log(asset);
        setSelectedAsset(asset);
        setShowWithdrawDlg(true);
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
            setSendingToken(true)
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
            const value = web3.utils.toWei(withdrawAmount.toString(), "ether");
            const byteCode = web3.eth.abi.encodeFunctionCall(signature, [withdrawAddress, value]);
            const accountContractInstance = new web3.eth.Contract(accountABI, tba);
            // const res = await accountContractInstance.methods.token().send({from: ethereum.selectedAddress})
            const res = await accountContractInstance.methods
                .executeCall(selectedAsset.address, 0, byteCode)
                .send({ from: ethereum.selectedAddress });
            console.log(res);
            SnackbarUtils.success("Withdraw completed");
            onClickUseWallet()
            setSendingToken(false)
        } catch (e) {
            SnackbarUtils.warning(e);
            console.log(e);
            setSendingToken(false)
        }
    };
    const closeWithdrawDlg = () => {
        setShowWithdrawDlg(false);
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
                                {/* <button className="btn-primary" onClick={confirmWithdraw}>
                                    Confirm
                                </button> */}
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
                                {isTBADeployed ? (
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
                                )}
                            </div>
                            <div className="detail-body">
                                <p>ASSETS</p>
                                <hr></hr>
                                {loadingBalance ? (
                                    <CircularIndeterminate />
                                ) : (
                                    <div style={{ position: "relative" }}>
                                        {/* {sendingToken && <CircularIndeterminate />} */}
                                        <div className="assets-header">
                                            <span>Name:</span>
                                            <span>Symbol:</span>
                                            <span>Balance:</span>
                                        </div>
                                        {assets.map((asset, index) => (
                                            <div className="assets" key={index}>
                                                <span>{asset.name}</span>
                                                <span>{asset.symbol}</span>
                                                <span>{asset.balance}</span>
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => withdraw(asset)}
                                                >
                                                    Withdraw
                                                </button>
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
