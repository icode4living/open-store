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

export interface ProductsByStoreResponse {
  data: {
    productsByStore: Product[];
  };
}