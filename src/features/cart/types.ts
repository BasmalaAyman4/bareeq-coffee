export type CartLine = {
  key: string;
  id: string;
  quantity: number;
  variant_id: string | null;
  modifier_ids: string[];
};
export type CartState = {
  cart: CartLine[];
  notice: string;
  setCart: (cart: CartLine[]) => void;
  setNotice: (notice: string) => void;
  clear: () => void;
};
