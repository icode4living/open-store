import { gql } from "@apollo/client";

export const GET_PRODUCT_BY_CATEGORY = gql`
# The slug is category slug
query ProductByCategory($slug: String!){
    productByCategory(slug:$slug){
        edges{
            node{
              id
        name
         stockQuantity
        stockStatus
        shortDescription
        regularPrice
        salePrice  
            }
        }
        }
    }
`

export const GET_CATEGORIES = gql `
query Categories{
    categories{
        edges{
        node{
        id
        name
        imageURL
        slug
        }
        }
    }
}
`