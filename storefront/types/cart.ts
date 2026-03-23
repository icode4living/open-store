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
    
    myCart:Cart
    
}

export interface UpdateCartResponse{

        updateCartItem:Cart
    
}

export interface RemoveFromCartResponse{

        removeFromCart:Cart
    
}

export interface ClearCartResponse{

        clearCart:Cart
    
}



// ── Helpers ─────────────────────────────────────────────────────────────────
 
export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((acc, item) => {
    const price = item.product?.salePrice ?? 0;
    return acc + price * item.quantity;
  }, 0);
}
 
export function cartItemCount(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}
 
export const SHIPPING_THRESHOLD = 15000; // free shipping above this
 
export function shippingCost(subtotal: number): number {
  return subtotal >= SHIPPING_THRESHOLD ? 0 : 2000;
}
 
export function cartTotal(items: CartItem[], couponDiscount = 0): number {
  const sub = cartSubtotal(items);
  return sub - couponDiscount + shippingCost(sub);
}