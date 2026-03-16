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
    addressLine1:string,
    addressLine2?: string,
    city: string, 
    postal:string, 
    country:string, 
    customerID:string

}
export interface GetAddressResponse{
    data:{
        customerAddresses:Address[]
    }
}
export interface CreateAddressResponse{
    data:{
        createAddress: Address
    }
}