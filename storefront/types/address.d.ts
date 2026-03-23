export interface Address{
    id: string;
    firstName: string;
    lastName: string;
    city: string;
    addressLine1:string;
    postalCode: string;
    country?: string;
    state?: String;
}
export interface AddressInput{
    firstName:string, 
    lastName: string, 
    email:string,
    phone: string;
    addressLine1:string,
    addressLine2?: string,
    city: string, 
    state: string,
    postalCode:string, 
    country:string, 
    customerID:string

}
export interface GetAddressResponse{
   
        customerAddresses:Address[]
    
}
export interface CreateAddressResponse{
    
        createAddress: Address

}