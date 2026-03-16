import { gql } from "@apollo/client";

export const CREATE_ADDRESS = gql `mutation createAddress($input: CreateAddressInput!){
    createAddress(input:$input){
        id
        firstName,
        lastName,
        city,
        addressLine1,
        
    }
}`;

export const GET_ADDRESS = gql `
query CustomerAddreses($customerID: UUID!){
    customerAddresses(customerID: $customerID){
    id
    firstName
    lastName
    city
    addressLine1
    postalCode
    country
    state
    
}
}
`