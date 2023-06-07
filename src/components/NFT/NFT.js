import React from "react";
import styles from "./NFT.module.css";


// Each NFT component shows the NFT image, name, and token ID.
export default function NFTComponent({ nft }) {
    const metadata = JSON.parse(nft.metadata)
    return (
        <>
        <p className={styles.nftTokenId}>Token ID #{nft?.token_id}</p>
        <p className={styles.nftName}>{nft?.metadata?.name}</p>
        <img src={metadata?.image}/>
        </>
    );
}
