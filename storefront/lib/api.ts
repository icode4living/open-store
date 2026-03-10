import type { Product } from '@/components/ui';

const MOCK_PRODUCTS_RESPONSE = {
  data: {
    products: [
      { id: '4fc49557-02c3-4d5b-848b-1c075c3c5b72', slug: 'long-sleve', name: 'Long Sleeve', shortDescription: 'Men fitted longsleeve', salePrice: 12000, costPrice: 7500, mainImageURL: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80', galleryImages: [], stockStatus: 'instock', status: 'publish', shippingClass: { id: 'd83734ad', name: 'Ibadan Delivery', slug: 'ibadan-delivery' }, description: '<p>Premium quality long sleeve shirt crafted for comfort and style.</p><ul><li>100% cotton</li><li>Machine washable</li><li>Available in all sizes</li></ul>' },
      { id: '8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a', slug: 't-shirt', name: 'Polo T-Shirt', shortDescription: 'Polo t-shirt for men', salePrice: 5000, costPrice: 4855, mainImageURL: 'https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frziyyzydojr/b/mysalescat-image/o/product/8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a/22e83083-1a59-4456-b052-3d5f631aebb2.jpg', galleryImages: [{ url: 'https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/frziyyzydojr/b/mysalescat-image/o/product/8e0d7e1b-c50a-40ee-ac2b-733ed8ada54a/e010a0e9-594a-4a38-8f93-7f6e4fd80670.jpg', productID: '8e0d7e1b' }], stockStatus: 'instock', status: 'publish', shippingClass: null, description: '' },
      { id: '858554fe-537f-419a-8435-d24d2572565d', slug: 'jacket', name: 'Men Jacket', shortDescription: 'Premium fitted jacket', salePrice: 25000, costPrice: 18000, mainImageURL: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&q=80', galleryImages: [], stockStatus: 'instock', status: 'publish', shippingClass: null, description: '' },
      { id: 'c3871ebe-b373-44a9-8b07-1b285d00b194', slug: 'women-gown', name: 'Women Gown', shortDescription: 'Best gown for women', salePrice: 6000, costPrice: 4000, mainImageURL: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=80', galleryImages: [], stockStatus: 'instock', status: 'publish', shippingClass: null, description: '' },
      { id: '7b9d85fd-fe3a-4363-aa77-306ca5da4612', slug: 'young-mens-shirt', name: 'Young Men Shirt', shortDescription: 'Casual shirt for young men', salePrice: 8000, costPrice: 5500, mainImageURL: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80', galleryImages: [], stockStatus: 'instock', status: 'publish', shippingClass: null, description: '' },
      { id: 'eb5457f2-e8d3-44a3-b9c2-f2e0ad3b41e8', slug: 'women-dress', name: 'Women Dress', shortDescription: 'Elegant dress for women', salePrice: 9500, costPrice: 7000, mainImageURL: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&q=80', galleryImages: [], stockStatus: 'instock', status: 'publish', shippingClass: null, description: '' },
      { id: 'e59f9343-82c6-4fe4-a8a6-f26bb55afdc8', slug: 'women-original-gown', name: 'Original Gown', shortDescription: 'Original gown for women', salePrice: 10000, costPrice: 5000, mainImageURL: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80', galleryImages: [], stockStatus: 'instock', status: 'publish', shippingClass: null, description: '' },
      { id: '13acf5cc-5ec5-469e-8933-3b9e1e379bfb', slug: 'men-polo', name: 'Men Polo', shortDescription: 'Polo shirt for men', salePrice: 10000, costPrice: 10500, mainImageURL: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500&q=80', galleryImages: [], stockStatus: 'instock', status: 'publish', shippingClass: null, description: '' },
    ],
  },
};

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || '/api/graphql';
const REST_ENDPOINT    = process.env.NEXT_PUBLIC_API_URL     || '/api';

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL error: ${res.statusText}`);
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_token') ?? '';
}

export const api = {
  /* ── Products ── */
  async getProducts(): Promise<typeof MOCK_PRODUCTS_RESPONSE> {
    // Replace with real call:
    // return gql(`query { products { id slug name ... } }`);
    await new Promise((r) => setTimeout(r, 600)); // simulate latency
    return MOCK_PRODUCTS_RESPONSE;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    await new Promise((r) => setTimeout(r, 400));
    const found = MOCK_PRODUCTS_RESPONSE.data.products.find((p) => p.slug === slug);
    if (!found) throw new Error('Product not found');
    return found as unknown as Product;
  },

  /* ── Cart (GraphQL) ── */
  async addToCart(productID: string, quantity: number) {
    // return gql(`mutation AddToCart($productID: ID!, $quantity: Int!) { addToCart(productID: $productID, quantity: $quantity) { id items { productID quantity } } }`, { productID, quantity });
    await new Promise((r) => setTimeout(r, 400));
    return { data: { addToCart: { id: 'cart-1', items: [{ productID, quantity }] } } };
  },

  async getCart() {
    // return gql(`query Mycart { myCart { id items { productID quantity product { id name mainImageURL } } } }`);
    await new Promise((r) => setTimeout(r, 300));
    return { data: { myCart: { id: 'cart-1', items: [] } } };
  },

  async updateCartItem(itemID: string, quantity: number) {
    // return gql(`mutation UpdateCartItem($itemID: ID!, $quantity: Int!) { updateCartItem(itemID: $itemID, quantity: $quantity) { id items { productID quantity } } }`, { itemID, quantity });
    await new Promise((r) => setTimeout(r, 300));
    return { data: { updateCartItem: { id: 'cart-1', items: [] } } };
  },

  /* ── Customer & Address ── */
  async createCustomer(data: { email: string; first_name: string; last_name: string; phone: string }) {
    const res = await fetch(`${REST_ENDPOINT}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async createAddress(input: { firstName: string; lastName: string; city: string; addressLine1: string; customerID: string }) {
    return gql(
      `mutation createAddress($input: CreateAddressInput!) { createAddress(input: $input) { id firstName lastName city addressLine1 customer { firstName lastName phone } } }`,
      { input }
    );
  },
}