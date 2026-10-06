export type Variant = {
  id: string;
  product_id: string;
  name: string;
  name_ar?: string | null;
  price_minor: number;
  available: boolean;
};
export type Modifier = {
  id: string;
  name: string;
  name_ar?: string | null;
  price_minor: number;
  available: boolean;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  name_ar?: string | null;
  category_id: string;
  category: string;
  category_ar?: string | null;
  sourceCategory: string;
  description: string;
  description_ar?: string | null;
  price: number | null;
  price_minor: number | null;
  available: boolean;
  active: boolean;
  image: string | null;
  illustrative: boolean;
  variants: Variant[];
  modifiers: Modifier[];
};
export type Branch = {
  id: string;
  name: string;
  active: boolean;
  instapay_details: string | null;
  receipt_retention_days: number;
};
