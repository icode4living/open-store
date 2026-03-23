export interface Store{
    id:string;
    name:string;
    slug:string;
    currency:string;
    theme:unknown;
}
export interface StoreResponse{
    
        stores:Store[]

}