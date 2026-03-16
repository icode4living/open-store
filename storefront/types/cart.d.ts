import { Product } from "./product";
export interface CartItem{
     productID: string;
    quantity: number
    product?:Product
}
export interface Cart{
    id: string; //cart ID
    storeID?: string;
    items?: CartItem[]
}

export interface AddToCartResponse{
    data:{
        addToCart: Cart
    }
}
export interface GetCartResponse{
    data:{
    myCart:Cart
    }
}

export interface UpdateCartResponse{
    data:{
        updateCartItem:Cart
    }
}