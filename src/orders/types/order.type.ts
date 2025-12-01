export interface Order {
  id: string;
  user_id: string;
  country_code: string;
  status: string;
  subtotal: number;
  tax_total: number;
  grand_total: number;
  created_at: Date;
  updated_at: Date;
}
