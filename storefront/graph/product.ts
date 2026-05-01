import { gql } from "@apollo/client";
export const GET_PRODUCT = gql`
query Products{
    products{
        edges{
         node{
         id
        name
         saleAmount
        regularAmount
        costAmount
        shortDescription
        mainImageURL
        slug
            }
        }
      
    }
}
`;

export const GET_PRODUCT_BY_SLUG = gql`
query ProductBySlug($slug:String!){
    productBySlug(slug:$slug){
        id
        name
         stockQuantity
        stockStatus
        description
        saleAmount
        regularAmount
        costAmount
        mainImageURL

        galleryImages{
            url
            productID
        }
        shippingClass{
            id
            name
            extraCost
            slug

        }
    }
}
`
export const PRODUCT_SEARCH =  gql`
query ProductSearch($search:String){
    productSearch(search:$search){
        id
        name
        slug
        shortDescription
        salePrice
        regularPrice
        mainImageURL
        
    }
}
`;