import { gql } from "@apollo/client";


export const GET_ODERS = gql`
query CustomerOrders($customerID: ID){
  customerOrders(customerID: $customerID){
id
status
total
createdAt
ublinvoiceID
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
export const ORDER_DETAIL = gql `
query MyOrder($id:ID!){
    myOrder(id:$id){
        id
status
total
ublInvoiceID
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