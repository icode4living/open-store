import { ShippingClass } from "./shipping";
interface GalleryImage{
    url:string;
    productID: string;
}
interface Product {
  id: string;
  name: string;
  slug?: string;
  stockQuantity?:number;
   stockStatus?: "instock" | "outofstock" | "onbackorder";
  status?: "pending" | "draft" | "private" | "publish";
  mainImageURL?: string | null;
  description?: string | null;
  regularPrice?:number;
  shortDescription?: string;
  shippingClass?: ShippingClass | null;
  salePrice?: number;
  costPrice?: number;
  galleryImages?: GalleryImage[];
}
//

export interface ProductConnection {
  products: Product[];
}

export interface ProductsResponse {
  
    products: { 
      edges: Array<{
        node: Product;
      }>;
  
  };
}

export interface ProductsByCategoryResponse{
  
    productByCategory: { 
      edges: Array<{
        node: Product;
      }>;
    
  };
}

export interface ProductBySlugResponse{
  productBySlug:Product
}

export interface ProductSearchResponse{

    productSearch:Product[]
  
}