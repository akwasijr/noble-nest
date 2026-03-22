import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { OrderWithItems, Order } from '../types/database'

// Demo orders for when Supabase isn't configured
const DEMO_ORDERS: OrderWithItems[] = [
  {
    id: '1', order_number: 'NN-A1B2C3', status: 'pending',
    customer_name: 'Ama Mensah', customer_phone: '024 123 4567',
    delivery_area: 'East Legon', delivery_address: '15 Boundary Rd, East Legon',
    order_notes: 'Please call before delivery', payment_method: 'mtn', payment_ref: 'TXN12345678',
    subtotal: 750, delivery_fee: 30, total: 780,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    order_items: [{ id: '1a', order_id: '1', item_type: 'box', item_name: 'The Deluxe', item_price: 750, quantity: 1 }],
  },
  {
    id: '2', order_number: 'NN-D4E5F6', status: 'confirmed',
    customer_name: 'Kwame Boateng', customer_phone: '055 987 6543',
    delivery_area: 'Cantonments', delivery_address: '3 Oxford St, Cantonments',
    order_notes: null, payment_method: 'vodafone', payment_ref: 'VOD87654321',
    subtotal: 1400, delivery_fee: 30, total: 1430,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    order_items: [{ id: '2a', order_id: '2', item_type: 'box', item_name: 'The Luxe', item_price: 1400, quantity: 1 }],
  },
  {
    id: '3', order_number: 'NN-G7H8I9', status: 'delivered',
    customer_name: 'Efua Asante', customer_phone: '020 555 1234',
    delivery_area: 'Labone', delivery_address: '8 La Rd, Labone, Accra',
    order_notes: 'Gift wrap please', payment_method: 'mtn', payment_ref: 'MTN99887766',
    subtotal: 445, delivery_fee: 30, total: 475,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    order_items: [
      { id: '3a', order_id: '3', item_type: 'box', item_name: 'The Essentials', item_price: 400, quantity: 1 },
      { id: '3b', order_id: '3', item_type: 'product', item_name: 'Diapers', item_price: 45, quantity: 1 },
    ],
  },
]

export function useOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setOrders(DEMO_ORDERS)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
    } else {
      setOrders((data as OrderWithItems[]) || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    if (!isSupabaseConfigured()) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o))
      return { error: null }
    }
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (!error) fetchOrders()
    return { error }
  }

  const getOrder = (id: string) => orders.find(o => o.id === id) || null

  return { orders, loading, fetchOrders, updateOrderStatus, getOrder }
}
