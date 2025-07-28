export type ProductAttributeValue = string | object | string[] | number | null;

export interface ProductAttribute {
  key: string;
  value: ProductAttributeValue;
}

export interface Product {
  id: string;
  skuId: string;
  updatedAt: number;
  createdAt: number;
  attributes: ProductAttribute[];
}
