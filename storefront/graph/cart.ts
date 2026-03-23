import { gql } from "@apollo/client";

export const ADD_TO_CART = gql `
mutation AddToCart(
    $productID: ID!
    $quantity: Int!
){
    addToCart(
productID:  $productID
quantity:  $quantity
    ){
    id
    storeID
    items{
         productID
        quantity
        }
    }
}
`;

export const GET_CART = gql `
    query Mycart{
        myCart{
            id
            storeID
            items{
            productID
            quantity
            product{
            id
            name
            regularPrice
            salePrice
            mainImageURL
            }
                
            }
        }
    }
`;
export const UPDATE_CART = gql `

mutation UpdateCartItem($itemID: ID!, $quantity: Int!){
    updateCartItem(
        itemID: $itemID,
        quantity: $quantity
        ){
        id
        storeID
        items{
            productID
            quantity
            product{
            id
            name
            regularPrice
            salePrice
            mainImageURL
            }
    }
        }
}
`;

export const CLEAR_CART = gql `
mutation ClearCart{
    clearCart{
        id
        storeID
        items{
            productID
            quantity
            product{
            id
            name
            regularPrice
            salePrice
            mainImageURL
            }
    }
        }
}
`;
export const REMOVE_CART_ITEM = gql `
mutation RemoveFromCart($itemID: ID!){
    removeFromCart(itemID:$itemID){
id
        storeID
        items{
            productID
            quantity
            product{
            id
            name
            regularPrice
            salePrice
            mainImageURL
            }
    }
    }
}
`;