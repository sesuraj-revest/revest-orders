export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  hsn_code: string | null;
  quantity: number;
  unit_price: string; // numeric
  tax_rate: string;
  tax_amount: string;
  line_total: string;
  created_at: Date;
}
