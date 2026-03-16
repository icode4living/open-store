import { gql } from "@apollo/client";


export const GET_ODERS = gql`
query CustomerOrders($customerID: ID){
  customerOrders(customerID: $customerID){
id
status
total
items{
  id
  productImage
  qty
  subtotal
  productName
}
  }
}
`