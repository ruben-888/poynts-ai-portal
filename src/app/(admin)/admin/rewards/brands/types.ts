export interface Brand {
  id: string | number;
  name: string;
  display_name: string;
  description?: string;
  image?: string;
  tag?: string;
  key?: string;
  itemCountsByProvider?: {
    tango: number;
    blackhawk: number;
    amazon: number;
    tremendous: number;
  };
}

export interface BrandsResponse {
  data: Brand[];
  error?: string;
}