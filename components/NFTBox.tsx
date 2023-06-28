import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketPlace.json"
import nftAbi from "../constants/BasicNft.json"
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import { UpdateListingModal } from "./UpdateListingModal"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const separatorLength = separator.length
    const charsToShow = strLen - separatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)

    return (
        fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
    )
}

export const NFTBox = function ({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)
    const dispatch = useNotification()

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi, // provided via --> "../constants/BasicNft.json"
        contractAddress: nftAddress, // provided properly and address in Sepolia is: 0x2dec7530742c2c0039f8c466afffb6e39f171d8b
        functionName: "tokenURI", // name of the function in BasicNft.sol
        params: {
            tokenId: tokenId, // provided via event, eventhough it is not relevant because --> function tokenURI(uint256 /*tokenId*/)
        },
    })

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    async function updateUI() {
        // const tokenURI =
        //     "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
        const tokenURI = await getTokenURI()

        console.log(`The TokenURI is ${tokenURI}`)

        if (tokenURI) {
            // We will use IPFS Gateway: a server that will return IPFS files from a "normal" URL
            // NOT SURE WHY REPLACE GIVES ERROR, tokenURI IS RETURNING A STRING BY DEFINITION!!!!
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")

            // await to fetch, then await to convert to json
            const tokenURIResponse = await (await fetch(requestURL)).json()

            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")

            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
        }
        // get the tokenURI
        // using the image tag from the tokenURI, get the image
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    // seller (from the contract) === account (from the account connect to metamask)
    //                    --> it is owned by the same person, there is no seller
    // seller == undefined --> ??
    const isOwnedByUser = seller === account || seller === undefined
    const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15)

    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: handleBuyItemSuccess,
              })
    }

    const handleBuyItemSuccess = async (tx) => {
        await tx.wait(1)

        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item bought!",
            position: "topR",
        })
    }

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owened by {formattedSellerAddress}
                                    </div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height={200}
                                        width={200}
                                        alt=""
                                    ></Image>
                                    <div className="font-bold">
                                        {ethers.utils.formatUnits(price, "ether")} ETH
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading... </div>
                )}
            </div>
        </div>
    )
}
