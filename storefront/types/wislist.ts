import { Product } from "./product";

interface WishListItem{
    id:string;
    addedAt:string;
    product: Product;
}
export interface Wishlist{
    id:string;
    items: WishListItem[]

}

export interface AddToWishlist{
    addToWishlist:{
        id:string
    }
}

export interface MyWishlist{
myWishlist:Wishlist
}