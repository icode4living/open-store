import { gql } from "@apollo/client";

const CREATE_WISHLIST = gql `mutation AddToWishlist($productID: ID!){
    addToWishlist(productID: $productID){
        id
    }
}`;

const GET_WISHLIST = gql `
query MyWishList{
    myWishlist{
        id
        items{
            id
            addedAt
            product{
            name
            salePrice
            mainImageURL
            }
        }
    }
}
`;
export {
    CREATE_WISHLIST,
    GET_WISHLIST
}