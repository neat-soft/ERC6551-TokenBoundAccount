import { useState, useEffect } from "react";
import NFTGrid from "../components/NFT/NFTGrid";
import styles from "../styles/Main.module.css";
export default function IndexLayout(address) {
    const [nfts, setNfts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
   
    return (
        <div className={styles.container}>
            <h1>Index</h1>
        </div>
    )
}