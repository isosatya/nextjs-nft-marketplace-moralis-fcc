import { useQuery, gql } from "@apollo/client"

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

const GraphExample = function () {
    const { loading, error, data } = useQuery(GET_ACTIVE_ITEM)
    // console.log("GraphExample", data)
    return <div>hiiii from the graph!!!</div>
}

export default GraphExample
