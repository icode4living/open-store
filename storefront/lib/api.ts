import { GET_PRODUCT, GET_PRODUCT_BY_SLUG, PRODUCT_SEARCH } from '@/graph/product';
import { GET_CATEGORIES, GET_PRODUCT_BY_CATEGORY } from '@/graph/category';
import { Customer } from '@/types/customer';
import { CREATE_ADDRESS, GET_ADDRESS } from '@/graph/address';
import { Address, AddressInput, CreateAddressResponse, GetAddressResponse } from '@/types/address';
import { ProductBySlugResponse, ProductConnection,
   ProductsByCategoryResponse, ProductSearchResponse, ProductsResponse,
    type Product  } from '@/types/product';
import { CustomerOrders, GetOrderItem, GetOrderResponse, MyOrderResponse, Order, OrderDetail } from '@/types/order';
// Cart 
import { Cart, AddToCartResponse, GetCartResponse, UpdateCartResponse, RemoveFromCartResponse, ClearCartResponse } from '@/types/cart';
import { GET_CART, UPDATE_CART, ADD_TO_CART, REMOVE_CART_ITEM, CLEAR_CART } from '@/graph/cart';
// libraries
import { createApolloClient } from './appolloClient';
import { RestClient } from './restClient';
import { GET_ODERS, ORDER_DETAIL } from '@/graph/order';
import { Store, StoreResponse } from '@/types/store';
import { GET_STORE } from '@/graph/store';
import { Category, CategoryResponse } from '@/types/category';
import { Console } from 'console';
import { AddToWishlist, MyWishlist, Wishlist } from '@/types/wislist';
import { CREATE_WISHLIST, GET_WISHLIST } from '@/graph/wishlist';

const restClient = new RestClient({
  baseURL : process.env.NEXT_PUBLIC_API_URL || "",
  headers: {
    'Content-Type': 'application/json',
  }
})


export const api = {
 /* ── Products ── */
 /**
  * 
  * @returns @interface Product
  */
async getProducts(): Promise<Product[]> {
  try {
    const client = createApolloClient();
    
    const { data, error: gqlError } = await client.query<ProductsResponse>({
      query: GET_PRODUCT,
      fetchPolicy: 'network-only',
    });

    if (gqlError) return new Error(gqlError.message);
//console.log(data?.products)
    // Extract the nodes from the edges array
    const products = data?.products?.edges?.map(edge => edge.node) || [];

    return products;
  } catch (e) {
    // Standardizing error handling
    throw new Error(e instanceof Error ? e.message : String(e));
  }
},
// list categories

async getCategories(): Promise<Category[]> {
  try {
    const client = createApolloClient();
    
    const { data, error: gqlError } = await client.query<CategoryResponse>({
      query: GET_CATEGORIES,
      fetchPolicy: 'network-only',
    });

    if (gqlError) return new Error(gqlError.message);
//console.log(data?.products)
    // Extract the nodes from the edges array
    const categories = data?.categories.edges.map(edge => edge.node) || [];

    return categories;
  } catch (e) {
    // Standardizing error handling
    throw new Error(e instanceof Error ? e.message : String(e));
  }
},
// Get user store config
async getStore(): Promise<Store> {
  try {
    const client = createApolloClient();
    
    const { data, error: gqlError } = await client.query<StoreResponse>({
      query: GET_STORE,
      fetchPolicy: 'network-only',
    });

    if (gqlError) return new Error(gqlError.message);

    // Extract the nodes from the edges array
    const store = data?.stores[0]

    return store;
  } catch (e) {
    // Standardizing error handling
    throw new Error(e instanceof Error ? e.message : String(e));
  }
},
/**
 * 
 * @param slug 
 * @returns @interface Product[]
 */
  async getProductBySlug(slug: string): Promise<Product> {
    try{
    const client = createApolloClient();
 const { data, error: gqlError } = await client.query<ProductBySlugResponse>({
      query: GET_PRODUCT_BY_SLUG,
      variables:{slug:slug},
      fetchPolicy: 'network-only',
    });
  //  console.log("product data", data)
        if (gqlError) return new Error(gqlError.message);
const product = data?.productBySlug
return product
    }
    catch(e){
    throw new Error(e instanceof Error ? e.message : String(e));

    }
  },
  /**
   * 
   * @param query 
   * @returns @interface Product[]
   */
  async productSearch(query:string): Promise<Product[] > {
   try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.query<ProductSearchResponse>({
      query: PRODUCT_SEARCH,
      variables:{search:query},
      fetchPolicy: 'network-only',
    });
        if (gqlError) return new Error(gqlError.message);
    const resp = data?.data?.productSearch
    return resp

   }catch(e){
          throw new Error(e instanceof Error ? e.message : String(e));

   }
  },
  /**
   * 
   * @param slug 
   * @returns @interface Product
   */
async getProductByCategory(slug:string): Promise<Product[]> {
  try {
    const client = createApolloClient();
    
    const { data, error: gqlError } = await client.query<ProductsByCategoryResponse>({
      query: GET_PRODUCT_BY_CATEGORY,
      variables:{slug:slug},
      fetchPolicy: 'network-only',
    });
    console.log("Category:", data )
    if (gqlError) return new Error(gqlError.message);

    // Extract the nodes from the edges array
    const products = data?.productByCategory?.edges?.map(edge => edge.node) || [];

    return products;
  } catch (e) {
    // Standardizing error handling
    throw new Error(e instanceof Error ? e.message : String(e));
  }
},
  /* ── Cart (GraphQL) ── */
  /**
   * 
   * @param productID 
   * @param quantity 
   * @returns @interface Cart
   */
  async addToCart(productID: string, quantity: number): Promise<Cart > {
     try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.mutate<AddToCartResponse>({
  mutation: ADD_TO_CART,
  variables:{productID:productID, quantity:quantity}
});
//console.log("data",data)
    if (gqlError) return new Error(gqlError.message);
    const cart = data?.data?.addToCart
    return cart
     }catch(e){
          throw new Error(e instanceof Error ? e.message : String(e));

     }
  },
/**
 * 
 * @returns @interface Cart
 */
  async getCart(): Promise<Cart > {
   try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.query<GetCartResponse>({
      query: GET_CART,
      fetchPolicy: 'network-only',
    });
    console.log("data:", data)
        if (gqlError) return new Error(gqlError.message);
    const cart = data?.myCart
return cart
   }catch(e){
    console.error(e)
          throw new Error(e instanceof Error ? e.message : String(e));

   }
  },

  /**
   * 
   * @param itemID 
   * 
   * @param quantity 
   * @returns @interface Cart
   */
  async updateCartItem(itemID: string, quantity: number): Promise<Cart> {
    try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.mutate<UpdateCartResponse>({
  mutation: UPDATE_CART,
  variables:{itemID:itemID, quantity:quantity}
});
    if (gqlError) return new Error(gqlError.message);
    const cart = data?.updateCartItem
    return cart
     }catch(e){
          throw new Error(e instanceof Error ? e.message : String(e));

     }
  
  },
  /**
   * 
   * @param itemID 
   * @returns @interface Cart
   */
  async removeFromCart(itemID: string): Promise<Cart> {
    try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.mutate<RemoveFromCartResponse>({
  mutation: REMOVE_CART_ITEM,
  variables:{itemID:itemID}
});
    if (gqlError) return new Error(gqlError.message);
    const cart = data?.removeFromCart
    return cart
     }catch(e){
          throw new Error(e instanceof Error ? e.message : String(e));

     }
  
  },
  /**
   * 
   * @returns @interface Cart
   */
  async clearCart(): Promise<Cart> {
    try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.mutate<ClearCartResponse>({
  mutation: CLEAR_CART,
});
    if (gqlError) return new Error(gqlError.message);
    const cart = data?.clearCart
    return cart
     }catch(e){
          throw new Error(e instanceof Error ? e.message : String(e));

     }
  
  },
  /* ── Customer ── */
  /**
   * 
   * @param customer 
   * @returns @interface Customer
   */
  async createGuestCustomer(customer:Customer): Promise<Customer | undefined> {
   try{
const result = await restClient.post<Customer>('/customers/guest',{
  data:{
    customer
  }
});
return result
   }catch(e){
    
    throw new Error(e instanceof Error ? e.message : String(e));

   }
  },
/**
 * 
 * @param email 
 * @param password 
 * @returns @interface Customer
 */
  async registerCustomer (email: string, password: string): Promise<Customer | undefined> {
   try{
const result = await restClient.post<Customer>('/customers/register',{
  data:{
    email,
    password
  }
});
return result
   }catch(e){
    console.error("Customer error: ", e)
    throw new Error(e instanceof Error ? e.message : String(e));

   }
  },
  async login (email: string, password: string): Promise<Customer> {
   try{
const result = await restClient.post<Customer>('/customers/login',{
  data:{
    email,
    password
  }
});
return result
   }catch(e){
    
    throw new Error(e instanceof Error ? e.message : String(e));

   }
  },

/** Address */
/**
 * 
 * @param address @interface AddressInput
 * @returns @interface Address
 */
  async createAddress(address:AddressInput): Promise<Address> {
    try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.mutate<CreateAddressResponse>({
  mutation: CREATE_ADDRESS,
  variables:{input:{
    firstName: address.firstName,
    lastName: address.lastName,
    //email: address.email,
    addressLine1: address.addressLine1,
    ...(address.addressLine2 !=null &&{ addressLine2: address.addressLine2}),
    city: address.city,
    postalCode: address.postalCode,
    country: address.country,
    customerID: address.customerID

  }}
});
    if (gqlError) return new Error(gqlError.message);
    const resp = data?.createAddress
    return resp
     }catch(e){
      console.error(e)
          throw new Error(e instanceof Error ? e.message : String(e));

     }
  
  },
/**
 * 
 * @param customerID 
 * @returns @interface Address[]
 */

    async getAddress(customerID:string): Promise<Address[] > {
   try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.query<GetAddressResponse>({
      query: GET_ADDRESS,
      variables:{customerID:customerID},
      fetchPolicy: 'network-only',
    });
        if (gqlError) return new Error(gqlError.message);
    const resp = data?.customerAddresses
    return resp

   }catch(e){
          throw new Error(e instanceof Error ? e.message : String(e));

   }
  },
  /* Wishlist */
/**Add to wishlist
 * 
 * @param productId 
 * @returns @type string
 */
    async addToWishList(productId:string): Promise<String> {
    try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.mutate<AddToWishlist>({
  mutation: CREATE_WISHLIST,
  variables:{productID:productId}
});
    if (gqlError) return new Error(gqlError.message);
    const id = data?.addToWishlist.id
    return id
     }catch(e){
          throw new Error(e instanceof Error ? e.message : String(e));

     }
  
  },
  /**
   * Get Wishlist
   * 
   * @returns @interface MyWishlist
   */
 async getWishlist(): Promise<Wishlist> {
   try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.query<MyWishlist>({
      query: GET_WISHLIST,
      fetchPolicy: 'network-only',
    });
        if (gqlError) return new Error(gqlError.message);
    const resp = data?.myWishlist
    return resp

   }catch(e){
          throw new Error(e instanceof Error ? e.message : String(e));

   }
  },

  /* Checkout & Orders */
  /**
   * 
   * @param email 
   * @param paymentMethod 
   * @returns @interface Order
   */
async checkout (email: string, paymentMethod: string): Promise<Order | undefined> {
    console.log("resp: ",{
      email,
      paymentMethod
    })

  try{
const result = await restClient.post<Order>('/orders/checkout',{
  data:{
   "customer_email": email,
    "payment_method": paymentMethod
  }
});

return result
   }catch(e){
    console.error("Checkout Error: ", e?.message)
    throw new Error(e instanceof Error ? e.message : String(e));

   }
  },

//order
/**
 * 
 * @param customerID 
 * @returns @interface CustomerOrder[]
 */
    async getOrders(customerID:string): Promise<CustomerOrders[] > {
   try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.query<GetOrderResponse>({
      query: GET_ODERS,
      variables:{customerID:customerID},
      fetchPolicy: 'network-only',
    });
        if (gqlError) return new Error(gqlError.message);
    const resp = data?.customerOrders
    return resp

   }catch(e){
          throw new Error(e instanceof Error ? e.message : String(e));

   }
  },
  /**
   * Get order detail
   * @param orderId 
   * @returns @interface MyOrder
   */
async orDetail(orderId:string): Promise<CustomerOrders> {
   try{
    const client = createApolloClient();
const { data, error: gqlError } = await client.query<MyOrderResponse>({
      query: ORDER_DETAIL,
      variables:{id:orderId},
      fetchPolicy: 'network-only',
    });
        if (gqlError) return new Error(gqlError.message);
    const resp = data?.myOrder
    return resp

   }catch(e){
          throw new Error(e instanceof Error ? e.message : String(e));

   }
  },

}

