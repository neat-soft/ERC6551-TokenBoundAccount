import React from "react";
import Skeleton from "../Skeleton/Skeleton";
import NFT from "./NFT";
import styles from "../../styles/Main.module.css";

// NFTGrid component shows a grid of the connected wallet's owned NFTs.
export default function NFTGrid({
  isLoading,
  nfts,
  emptyText = "No owned NFTS.",
}) {
  return (
    <div className={styles.nftGridContainer}>
      {isLoading ? (
        [...Array(4)].map((_, index) => (
          <div key={index} className={styles.nftContainer}>
            <Skeleton key={index} width={"100%"} height="312px" />
          </div>
        ))
      ) : nfts && nfts.length > 0 ? (
        nfts.map((nft, index) => (
          <a
            href={`/token/${nft?.token_address}/${nft?.token_id}`}
            key={nft?.token_address}
            className={styles.nftContainer}
          >
            <NFT nft={nft} />
          </a>
        ))
      ) : (
        <p>{emptyText}</p>
      )}
    </div>
  );
}
