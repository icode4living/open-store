
export interface Category {
  id: string;
  name: string;
  slug: string;
  imageURL: string;
}
export interface CategoryConnection{
  edges:[
    {
      node:Category
    }
  ]
}

export interface CategoryResponse{
  data: CategoryConnection
}