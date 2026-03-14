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
  shortDescription?: string;
  shippingClass?: ShippingClass | null;
  salePrice?: number;
  costPrice: number;
  galleryImages?: GalleryImage[];
}
//
export interface ProductConnection{
  edges:[
    {
      node:Product
    }
  ]
}
//
export interface ProductsResponse {
  data: ProductConnection
}

export interface ProductBySlug{
  productBySlug:Product
}
export interface ProductBySlugResponse{
  data:ProductBySlug
}