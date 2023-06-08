import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import  MetamaskIcon from './images/metamask-icon.png'
import { DialogTitle, DialogContent} from "@mui/material";
import Close from "@mui/icons-material/Close";
import { SnackbarProvider, closeSnackbar } from "notistack";
import SnackbarUtils from './utils/SnackbarUtils'
import { SnackbarUtilsConfigurator } from "./utils/SnackbarUtils";
import { BrowserRouter } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import RouterContainer from "./Routes";
import './App.css';
const Web3 = require("web3");

function App() {
    const [web3, setWeb3] = useState(null);
    const [haveMetaMask, setHaveMetaMask] = useState("");
    const [accountAddress, setAccountAddress] = useState(null);
    const [showWalletChoiceDlg, setShowWalletChoiceDlg] = useState(false);
    const openWalletChoiceDlg = () => {
        setShowWalletChoiceDlg(true)
    }
    const closeWalletChoiceDlg = () => {
        setShowWalletChoiceDlg(false)
    }
    let { ethereum } = window;
    
    useEffect(() => {
        const loadWeb3 = async () => {
          if (ethereum) {
            const web3 = new Web3(ethereum);
            try {
              setWeb3(web3);
              setShowWalletChoiceDlg(false)
            } catch (error) {
              console.error(error);
            }
          } else if (window.web3) {
            const web3 = new Web3(window.web3.currentProvider);
            setWeb3(web3);
            setShowWalletChoiceDlg(false)
          } else {
            console.error('No web3 provider detected');
          }
        };
        loadWeb3();
      }, []);
    
      useEffect(() => {
        connectWallet();
      }, [web3]);
    const connectWallet = async() => {
        try {
            if (!web3 || !ethereum.isMetaMask) {
                setHaveMetaMask(false);
            } else {
                if (web3 && accountAddress == null) {
                    await ethereum.request({ method: "eth_requestAccounts" });
                    const accounts = await web3.eth.getAccounts();
                    setAccountAddress(accounts[0]);
                    setShowWalletChoiceDlg(false)
                    
                }
            }
        } catch (error) {
            if (error.code == "-32002") {
                SnackbarUtils.error(
                    "Already processing connect to wallet. Please unlock your wallet."
                );
            } else {
                SnackbarUtils.error(
                    "Error occured while connecting wallet. Please unlock your wallet first."
                );
            }
        }
    }
   
    return (
        <BrowserRouter>
            <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{ horizontal: "right", vertical: "top" }}
                action={(snackbarId) => (
                    <IconButton onClick={() => closeSnackbar(snackbarId)}>
                        <Close htmlColor="white" />
                    </IconButton>
                )}
            >
                <SnackbarUtilsConfigurator />
                <div className="App">
                <header className="App-header">
                    {
                    accountAddress ? 
                        <a className="btn-primary" href={`/wallet/${accountAddress}`}>
                            My NFTs
                        </a>
                        : <a className="btn-primary" onClick={openWalletChoiceDlg}>Connect Wallet</a>
                    }
                </header>
                <div>
                    <Dialog
                        open={showWalletChoiceDlg}
                        onClose={closeWalletChoiceDlg}
                        className="wallet-choice-dlg"
                    >
                    <DialogContent className="wallet-choice-dlg-content">
                        <DialogTitle>
                            Connect Wallet
                        </DialogTitle>
                        <button className="wallet" onClick={connectWallet}>
                            <span>MetaMask</span>
                            <div>
                                <img src={MetamaskIcon}/>
                            </div>
                        </button>
                    </DialogContent>   
                    </Dialog>
                   
                    <RouterContainer/>
                </div>
            </div>
            </SnackbarProvider>
        </BrowserRouter>
        
       
    );
}

export default App;
