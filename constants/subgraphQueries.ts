import { gql } from "@apollo/client"

const GET_ACTIVE_ITEM = gql`
    {
        activeItems(first: 5, where: { buyer: null }) {
            id
            buyer
            seller
            nftAddress
            price
        }
    }
`

export default GET_ACTIVE_ITEM
