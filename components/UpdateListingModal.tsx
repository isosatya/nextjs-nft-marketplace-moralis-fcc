import { useState } from "react"
import { Modal, Input, useNotification } from "web3uikit"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketPlace.json"
import { ethers } from "ethers"
import { error } from "console"

export const UpdateListingModal = function ({
    nftAddress,
    tokenId,
    isVisible,
    marketplaceAddress,
    onClose,
}) {
    const dispatch = useNotification()

    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState("0")
    console.log("priceToUpdateListingWith --->", priceToUpdateListingWith)

    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1)

        dispatch({
            type: "success",
            message: "Listing updated!",
            title: "Listing updated - please refresh (and move blocks)",
            position: "topR",
        })
        onClose && onClose()
        setPriceToUpdateListingWith("0")
    }

    const { runContractFunction: udpateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
        },
    })

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                udpateListing({
                    onError: (error) => console.log(error),
                    onSuccess: handleUpdateListingSuccess,
                })
            }}
        >
            <Input
                label="Update listing price in L1 Currency (ETH)"
                name="New listing price"
                type="number"
                onChange={(event) => {
                    setPriceToUpdateListingWith(event.target.value)
                }}
            ></Input>
        </Modal>
    )
}
