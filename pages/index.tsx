import Image from "next/image"
import { Inter } from "next/font/google"
import styles from "@/styles/Home.module.css"

// Recently listed NFTs (how?):
// we will index the emmited events oof-chain and then read from our database
// setup a server to listen to those events to be fired , and we will add them to a database query
// THE GRAPH does this in a descentralized way
// MORALIS does this in a centralized way and comes with many features

// we will read from a database that has all the mapping in an easier to read data structure

export default function Home() {
    return (
        <>
            <main>HIIIIIII</main>
        </>
    )
}
