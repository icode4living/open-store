
export interface Category {
  id: string;
  name: string;
  slug: string;
  imageURL: string;
}
export interface CategoryConnection{
  categories: Category[]
}

export interface CategoryResponse{
  data:{
    categories: Array<{
      node: Category;
    }>;
  };
}