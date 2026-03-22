export interface Product {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  in_stock: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BoxTier {
  id: string
  slug: string
  name: string
  price: number
  tag: string | null
  closed_image: string | null
  open_image: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BoxItem {
  id: string
  box_tier_id: string
  label: string
  category: 'baby' | 'mum'
  sort_order: number
}

export interface Order {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  customer_name: string
  customer_phone: string
  delivery_area: string
  delivery_address: string
  order_notes: string | null
  payment_method: string | null
  payment_ref: string | null
  subtotal: number
  delivery_fee: number
  total: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  item_type: 'product' | 'box'
  item_name: string
  item_price: number
  quantity: number
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export interface BoxTierWithItems extends BoxTier {
  box_items: BoxItem[]
}

export interface Database {
  public: {
    Tables: {
      products: { Row: Product; Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Product, 'id'>> }
      box_tiers: { Row: BoxTier; Insert: Omit<BoxTier, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<BoxTier, 'id'>> }
      box_items: { Row: BoxItem; Insert: Omit<BoxItem, 'id'>; Update: Partial<Omit<BoxItem, 'id'>> }
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Order, 'id'>> }
      order_items: { Row: OrderItem; Insert: Omit<OrderItem, 'id'>; Update: Partial<Omit<OrderItem, 'id'>> }
    }
  }
}
