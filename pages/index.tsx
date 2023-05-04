import Image from "next/image"
import { Inter } from "next/font/google"
import styles from "@/styles/Home.module.css"
import { NFTBox } from "@/components/NFTBox"
import { useMoralis } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEM from "@/constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import GraphExample from "./graphExample"

// Recently listed NFTs (how?):
// we will index the emmited events oof-chain and then read from our database
// setup a server to listen to those events to be fired , and we will add them to a database query
// THE GRAPH does this in a descentralized way
// MORALIS does this in a centralized way and comes with many features

// we will read from a database that has all the mapping in an easier to read data structure

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketPlace[0]

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEM)

    if (listedNfts) {
        // console.log("fechted data", listedNfts.activeItems[0])
        const nft = listedNfts.activeItems[0]

        console.log("nft.Address", nft.nftAddress)
    }

    return (
        <>
            <div className="container mx-auto">
                <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
                <div className="flex flex-wrap">
                    {loading ? (
                        <div>fetching...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            // console.log("fechted data", nft)
                            const { price, nftAddress, id, seller } = nft

                            return (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={id}
                                    marketplaceAddress={marketplaceAddress!}
                                    seller={seller}
                                    key={`${nftAddress}${id}`}
                                />
                            )
                        })
                    )}
                </div>
                <div>{GraphExample()}</div>
            </div>
        </>
    )
}

/* <NFTBox
price={price}
nftAddress={nftAddress}
tokenId={id}
marketplaceAddress={marketplaceAddress!}
seller={seller}
key={`${nftAddress}${id}`}
/> */

// {isWeb3Enabled ? (
//     loading || !listedNfts ? (
//         <div>Fetching...</div>
//     ) : (
//         listedNfts.activeItems.map((nft) => {
//             console.log("fechted data", nft)
//             const { price, nftAddress, tokenId, seller } = nft

//             return (
//                 <NFTBox
//                     price={price}
//                     nftAddress={nftAddress}
//                     tokenId={tokenId}
//                     marketplaceAddress={marketplaceAddress}
//                     seller={seller}
//                     key={`${nftAddress}${tokenId}`}
//                 />
//             )
//         })
//     )
// ) : (
//     <div>Web3 Currently Not Enabled</div>
// )}
