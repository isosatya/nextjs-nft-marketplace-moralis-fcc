import Head from "next/head"
import Image from "next/image"
import { Inter } from "next/font/google"
import styles from "@/styles/Home.module.css"
import { Form, useNotification } from "web3uikit"
import { ethers } from "ethers"
import nftMarketplaceAbi from "../constants/NftMarketPlace.json"
import nftAbi from "../constants/BasicNft.json"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"

export default function Home() {
    const { chainId } = useMoralis()
    const chainString: string = chainId ? parseInt(chainId).toString() : "31337"
    const dispatch = useNotification()

    // NOT SURE IF THIS WILL PRODUCE AN ERROR --> networkMapping[chainString].
    const marketplaceAddress: string = networkMapping[chainString].NftMarketPlace[0]

    // @ts-ignore
    const { runContractFunction } = useWeb3Contract()

    async function approveAndList(data) {
        console.log("Aproving....")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("executing handleApproveSuccess function ")
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: () => handleListSuccess(),
            onError: (error) => console.log(error),
        })
    }

    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT Listed!",
            position: "topR",
        })
    }

    return (
        <>
            <div className={styles.container}>
                <Form
                    onSubmit={approveAndList}
                    data={[
                        {
                            name: "NFT Address",
                            type: "text",
                            value: "",
                            key: "nftAddress",
                        },
                        {
                            name: "Token ID",
                            type: "number",
                            value: "",
                            key: "tokenId",
                        },
                        {
                            name: "Price (in ETH)",
                            type: "number",
                            value: "",
                            key: "price",
                        },
                    ]}
                    title={"Sell your NFT!"}
                    id={"Main Form"}
                ></Form>
            </div>
        </>
    )
}
