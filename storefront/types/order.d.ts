export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "offline" | "stripe" | "paystack" | "paypal" | string;

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  store_id: string;
  status: OrderStatus;
  total: number;
  tax_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  is_cod: boolean;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  created_at: string; // ISO 8601 Date String
}

export interface GetOrderItem{
  id:string;
  qty: number;
  subtotal:number;
  productImage:string;
  productName: string;
}

export interface CustomerOrders{
  id:string;
  status:OrderStatus
  total:number;
  createdAt:string;
  ublinvoiceID:string;// use has order number
  items:GetOrderItem[]
}



export interface MyOrderResponse{

    myOrder:CustomerOrders
  
}
