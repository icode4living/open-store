## Modern store front for fashion and cosmetics business
A modern luxury store front with responsive and dynamic ui for fashion and cometics
## 1.0 Principles
- All components must be reusable
- use Tailwind version 4.3 (pure css) 
- use `var` for the styles
- The styles should work with theme config (`theme-config.json`) for dynamic theme rendering
- All screen must be mobile responsive
- use mock data API lib will be handled by the internal team
## 1.0 Component
1. Button: 

    ```ts
    export interface ButtonProps{
    title: string;
    action:()=>void;
    variant: 'solid' | 'outline' | 'disabled';
    size: 'sm' | 'lg';
    classes?: string;
    loading?: boolean;
    }
    ```
2. Product Card
    - `Wishlist button` at the top right conner
3. Input component
    - number | text | email | search
4. Banner - store banner
    size: hero | sm | lg
5. Card

## 1.1 Pages
1. Home page
2. Category page -> `category/[slug]/page.tsx`
3. Product detail page -> `product/[slug]page.tsx`:
 Displays product detail and should support safe html rendering of the `description`
4. Cat Page
5. Checkout page
6. Not found
7. Blog (headless wordpress) :
   - blog -> Blog details
   - blog -> `blog/[slug]`
8. Auth:
  - Signup -> support Google login and Email using next auth
  - Signin -> support Google login and Email using next auth
  - Reset Pass
9. Profile
   - My Orders page: for tracking order
   - Whichlist page
   - Shipping Address: display customer address
   - Security: change Passsword page
10. For loading dynamic theme config
## 2.0 Workflow
* Page load:
 1. Cache `theme` config and load styles if no theme config is found use default 
* Checkout: stepper
 1. Confirm items
 2. User info
 3. Payment - user can apply coupon here

## 2.1 API Sample response
1. Product:
```ts
{
    "data": {
        "products": [
            {
                "id": "4fc49557-02c3-4d5b-848b-1c075c3c5b72",
                "slug": "long-sleve",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "publish",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Men fitted longsleeve",
                "salePrice": 12000,
                "costPrice": 7500,
                "galleryImages": [],
                "shippingClass": {
                    "id": "d83734ad-a6dc-4a6a-b618-2e46bb0d36c8",
                    "name": "ibadan delivery",
                    "slug": "ibadan-delivery"
                },
                "name": "long sleeve"
            },
            {
                "id": "8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a",
                "slug": "t-shirt",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frziyyzydojr/b/mysalescat-image/o/product/8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a/22e83083-1a59-4456-b052-3d5f631aebb2.jpg",
                "description": "",
                "shortDescription": "Pollo t-shirt for men",
                "salePrice": 5000,
                "costPrice": 4855.99,
                "galleryImages": [
                    {
                        "url": "https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frziyyzydojr/b/mysalescat-image/o/product/8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a/22e83083-1a59-4456-b052-3d5f631aebb2.jpg",
                        "productID": "8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a"
                    },
                    {
                        "url": "https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frziyyzydojr/b/mysalescat-image/o/product/8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a/e010a0e9-594a-4a38-8f93-7f6e4fd80670.jpg",
                        "productID": "8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a"
                    },
                    {
                        "url": "https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frziyyzydojr/b/mysalescat-image/o/product/8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a/5cd802fc-abec-4264-9b39-b444e162fb05.jpg",
                        "productID": "8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a"
                    }
                ],
                "shippingClass": null,
                "name": "Tshirt"
            },
            {
                "id": "858554fe-537f-419a-8435-d24d2572565d",
                "slug": "jacket",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Men fitted longsleeve",
                "salePrice": 5000,
                "costPrice": 4855.99,
                "galleryImages": [],
                "shippingClass": null,
                "name": "jacket"
            },
            {
                "id": "7b9d85fd-fe3a-4363-aa77-306ca5da4612",
                "slug": "young-mens-shirt",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Men shirt",
                "salePrice": 300,
                "costPrice": 1000,
                "galleryImages": [],
                "shippingClass": null,
                "name": "Mens shirt"
            },
            {
                "id": "c3871ebe-b373-44a9-8b07-1b285d00b194",
                "slug": "women-gown",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Best Gown for women",
                "salePrice": 6000,
                "costPrice": 4000,
                "galleryImages": [],
                "shippingClass": null,
                "name": "Women gown"
            },
            {
                "id": "8a32281a-e700-4b4e-8d08-d9106a11ab1c",
                "slug": "women-gowns",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Best Gown for women",
                "salePrice": 6000,
                "costPrice": 4000,
                "galleryImages": [],
                "shippingClass": null,
                "name": "Women gown"
            },
            {
                "id": "eb5457f2-e8d3-44a3-b9c2-f2e0ad3b41e8",
                "slug": "women-dress",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Best Gown for women",
                "salePrice": 6000,
                "costPrice": 4000,
                "galleryImages": [],
                "shippingClass": null,
                "name": "Women gown"
            },
            {
                "id": "e59f9343-82c6-4fe4-a8a6-f26bb55afdc8",
                "slug": "Women-original-gown",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Original gown for women",
                "salePrice": 10000,
                "costPrice": 5000,
                "galleryImages": [],
                "shippingClass": null,
                "name": "Orignal gown for women"
            },
            {
                "id": "13acf5cc-5ec5-469e-8933-3b9e1e379bfb",
                "slug": "men-polo",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Polo shirt for men",
                "salePrice": 10000,
                "costPrice": 10500,
                "galleryImages": [],
                "shippingClass": null,
                "name": "men polo"
            },
            {
                "id": "51a65de2-c5de-40e5-a384-9497b30b75bb",
                "slug": "men-polo-2",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Polo shirt for men",
                "salePrice": 10000,
                "costPrice": 10500,
                "galleryImages": [],
                "shippingClass": null,
                "name": "men polo"
            },
            {
                "id": "ef74efc4-30c0-4075-b94f-caca4c58ca96",
                "slug": "men-polo-3",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Polo shirt for men",
                "salePrice": 10000,
                "costPrice": 10500,
                "galleryImages": [],
                "shippingClass": null,
                "name": "men polo"
            },
            {
                "id": "d325d7e6-af2a-414d-82f8-cd35e8980050",
                "slug": "men-polo-4",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Polo shirt for men",
                "salePrice": 10000,
                "costPrice": 10500,
                "galleryImages": [],
                "shippingClass": null,
                "name": "men polo"
            },
            {
                "id": "5e4568ce-c0c7-441a-82f4-4de873752e85",
                "slug": "men-polo-6",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Polo shirt for men",
                "salePrice": 10000,
                "costPrice": 10500,
                "galleryImages": [],
                "shippingClass": null,
                "name": "men polo"
            },
            {
                "id": "9778e5a3-509d-44a7-b008-fc314d3103b4",
                "slug": "men-polo-8",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Polo shirt for men",
                "salePrice": 10000,
                "costPrice": 10500,
                "galleryImages": [],
                "shippingClass": null,
                "name": "men polo"
            },
            {
                "id": "e7dbf3e8-8056-4806-8255-614b71f14ae0",
                "slug": "men-polo-9",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "",
                "description": "",
                "shortDescription": "Polo shirt for men",
                "salePrice": 10000,
                "costPrice": 10500,
                "galleryImages": [],
                "shippingClass": null,
                "name": "men polo"
            },
            {
                "id": "d89cd899-a78d-4d7d-94d4-d910165e0647",
                "slug": "men-polo-10",
                "stockQuantity": 0,
                "stockStatus": "instock",
                "status": "draft",
                "mainImageURL": "https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frziyyzydojr/b/mysalescat-image/o/product/d89cd899-a78d-4d7d-94d4-d910165e0647/cee049fc-063d-4467-be35-735eb255bbf4.jpg",
                "description": "",
                "shortDescription": "Polo shirt for men",
                "salePrice": 10000,
                "costPrice": 10500,
                "galleryImages": [
                    {
                        "url": "https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frziyyzydojr/b/mysalescat-image/o/product/d89cd899-a78d-4d7d-94d4-d910165e0647/cee049fc-063d-4467-be35-735eb255bbf4.jpg",
                        "productID": "d89cd899-a78d-4d7d-94d4-d910165e0647"
                    }
                ],
                "shippingClass": null,
                "name": "men polo"
            }
        ]
    }
}
```
2. Create Address
 * Flow:
  1. Create Customer:
    ```ts 
    {
    "email":"samuelsamafolabi@outlook.com",
    "first_name": "Afolabi",
    "last_name":"Samuel",
    "phone":"09036771120"
    }
    ```
    Response:
    ```ts  
    {
    "id": "7b6569df-e637-4529-b0d7-ffca33a0e4f0",
    "email": "samuelsamafolabi@outlook.com",
    "first_name": "Afolabi",
    "last_name": "Samuel",
    "is_guest": true,
    "cart_id": "5ae8097a-4f8a-4992-8885-01eac3da4738"
    }
    ```
  2. Create Address
    ```graphql
    mutation createAddress($input: CreateAddressInput!){
    createAddress(input:$input){
        id
        firstName,
        lastName,
        city,
        addressLine1,
        customer{
        firstName,
        lastName,
        phone
        }
    }
    }
    ```
    Response:
    ```ts
    {
    "data": {
        "createAddress": {
            "id": "acc0ae5d-569b-4e8e-b2ad-6961fb97d38a",
            "firstName": "Afolabi",
            "lastName": "Samuel",
            "city": "Ibadan",
            "addressLine1": "6 Liberty road Ibadan",
            "customer": {
                "firstName": "Afolabi",
                "lastName": "Samuel",
                "phone": "09036771120"
            }
        }
    }
    }
    ```
3. Cart
 * Add cart:
 ```graphql
 mutation AddToCart(
    $productID: ID!
    $quantity: Int!
    ){
    addToCart(
    productID:  $productID
    quantity:  $quantity
    ){
        id
        storeID
        items{
            productID
            quantity
        }
    }
    }
 ```
 Response:
 ```ts
 {
    "data": {
        "addToCart": {
            "id": "09396665-8360-4237-a091-d22f312cf174",
            "storeID": "c4a78e61-f3c9-4243-a130-3bf153eedddb",
            "items": [
                {
                    "productID": "d89cd899-a78d-4d7d-94d4-d910165e0647",
                    "quantity": 2
                }
            ]
        }
    }
    }
 ```
 * Get Item from cart:
  ```graphql
  
    query Mycart{
        myCart{
            id
            storeID
            items{
                productID
                quantity
                product{
                id
                name
                mainImageURL
                }
                
            }
        }
    }
  ```
  Response:
  ```ts

  ```
* Update Cart
 ```graphql
 mutation UpdateCartItem($itemID: ID!, $quantity: Int!){
    updateCartItem(
        itemID: $itemID,
        quantity: $quantity
    ){
        
      id
        storeID
        items{
            productID
            quantity
        
    }
    }
}
 ```
 
 




 