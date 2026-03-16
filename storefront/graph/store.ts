import { gql } from "@apollo/client";

export const GET_STORE = gql `query Store{
    stores{  
        id
        name
        slug
        currency
        theme
    }
    }
`