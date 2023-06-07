import { useState, useEffect } from "react";

import axios from "axios";
import { API_URL } from "../const";
import NFTGrid from "../components/NFT/NFTGrid";
import SnackbarUtils from '../utils/SnackbarUtils'
import styles from "../styles/Main.module.css";
export default function WalletLayout() {
    const [nfts, setNfts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    let path = window.location.pathname.split('/')
    let address = path[path.length - 1]
    const getNFTs = async () => {
        setIsLoading(true)
        axios.get(API_URL + '/wallet/' + address).then((response) => {
            setNfts(response?.data?.data)
            setIsLoading(false)
        })
        .catch(err => {
            console.log(err)
            SnackbarUtils.error(
                err.message
            );
            setIsLoading(false)
        }); 
    }
    useEffect(() => {
        getNFTs();
    }, [window.location]);
    return (
        <div className={styles.container}>
            <h1>Your NFTs</h1>
            <NFTGrid
                nfts={nfts}
                isLoading={isLoading}
                emptyText={
                    "Looks like you don't own any NFTs."
                }
            />
        </div>
    )
}