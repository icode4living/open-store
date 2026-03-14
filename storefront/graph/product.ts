import { gql } from "@apollo/client";
export const GET_PRODUCT = gql`
query Products{
    products{
        edges{
         node{
         id
        name
        salePrice
        regularPrice
        costPrice
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
        regularPrice
        salePrice
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
