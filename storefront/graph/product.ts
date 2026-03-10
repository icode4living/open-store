import { gql } from "@apollo/client";
export const GET_PRODUCT = gql`
query Products{
   id
   slug
   name
   shortDescription
   salePrice
   costPrice
   mainImageURL
   galleryImages
   stockStatus
   status
}
`;
