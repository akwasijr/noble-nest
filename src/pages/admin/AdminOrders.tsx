import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../../hooks/useOrders'
import OrderStatusBadge from '../../components/admin/OrderStatusBadge'
import type { Order } from '../../types/database'
import { Search, Filter } from 'lucide-react'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminOrders() {
  const { orders, loading, updateOrderStatus } = useOrders()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      )
    }
    return true
  })

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-serif text-[#2c2825]">Orders</h1>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-5 border border-[#e8e2d9] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-60" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-serif text-[#2c2825]">Orders</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9791]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, or order number..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30 focus:border-[#b0925e] bg-white"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9791]" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30 focus:border-[#b0925e] bg-white appearance-none"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e8e2d9] px-5 py-16 text-center">
          <p className="text-[#9e9791]">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e8e2d9] divide-y divide-[#e8e2d9]">
          {filtered.map(order => (
            <div key={order.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <Link to={`/admin/orders/${order.id}`} className="min-w-0 flex-1 group">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#2c2825] group-hover:text-[#b0925e] transition-colors">
                      {order.order_number}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-[#2c2825] mt-1">{order.customer_name}</p>
                  <p className="text-xs text-[#9e9791] mt-0.5">
                    {order.delivery_area} · {order.customer_phone}
                  </p>
                  <p className="text-xs text-[#9e9791] mt-0.5">
                    {order.order_items.map(i => `${i.quantity}x ${i.item_name}`).join(', ')}
                  </p>
                </Link>

                <div className="text-right shrink-0 space-y-2">
                  <p className="font-semibold text-[#2c2825]">GH₵ {order.total.toLocaleString()}</p>
                  <p className="text-xs text-[#9e9791]">{new Date(order.created_at).toLocaleDateString()}</p>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                    className="text-xs px-2 py-1 rounded border border-[#e8e2d9] bg-[#faf8f5] focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30"
                  >
                    {STATUS_OPTIONS.filter(o => o.value !== 'all').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
