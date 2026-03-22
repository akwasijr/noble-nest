import { useParams, Link, useNavigate } from 'react-router-dom'
import { useOrders } from '../../hooks/useOrders'
import OrderStatusBadge, { statusConfig } from '../../components/admin/OrderStatusBadge'
import type { Order } from '../../types/database'
import { ArrowLeft, Phone, MapPin, MessageCircle, CreditCard } from 'lucide-react'

const STATUS_FLOW: Order['status'][] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { orders, loading, updateOrderStatus } = useOrders()
  const navigate = useNavigate()

  const order = orders.find(o => o.id === id)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="bg-white rounded-xl p-6 border border-[#e8e2d9] animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-[#9e9791] mb-4">Order not found</p>
        <Link to="/admin/orders" className="text-[#b0925e] hover:underline text-sm">Back to orders</Link>
      </div>
    )
  }

  const handleStatusChange = async (status: Order['status']) => {
    await updateOrderStatus(order.id, status)
  }

  const whatsappUrl = `https://wa.me/${order.customer_phone.replace(/\s/g, '').replace(/^0/, '233')}`

  return (
    <div className="space-y-5 max-w-3xl">
      <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-1.5 text-sm text-[#9e9791] hover:text-[#2c2825] transition-colors">
        <ArrowLeft size={16} /> Back to orders
      </button>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-serif font-semibold text-[#2c2825]">{order.order_number}</h1>
          <p className="text-sm text-[#9e9791]">Placed {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-[#e8e2d9] p-5">
        <h2 className="text-sm font-semibold text-[#2c2825] mb-4">Order status</h2>
        <div className="flex items-center overflow-x-auto pb-2">
          {STATUS_FLOW.map((s, i) => {
            const currentIdx = STATUS_FLOW.indexOf(order.status as any)
            const isCompleted = i < currentIdx
            const isCurrent = s === order.status
            const config = statusConfig[s]
            return (
              <div key={s} className="flex items-center flex-1 min-w-0 last:flex-none">
                <button
                  onClick={() => handleStatusChange(s)}
                  className="flex flex-col items-center gap-1.5 min-w-[72px] group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    isCompleted ? 'bg-emerald-500 text-white' :
                    isCurrent ? 'bg-[#b0925e] text-white ring-4 ring-[#b0925e]/20' :
                    'border-2 border-gray-200 text-gray-300 group-hover:border-gray-300'
                  }`}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs text-center leading-tight ${
                    isCurrent ? 'font-semibold text-[#2c2825]' :
                    isCompleted ? 'font-medium text-emerald-600' :
                    'text-[#9e9791]'
                  }`}>
                    {config.label}
                  </span>
                </button>
                {i < STATUS_FLOW.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded-full ${
                    isCompleted ? 'bg-emerald-400' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
        {order.status !== 'cancelled' && (
          <button
            onClick={() => handleStatusChange('cancelled')}
            className="mt-3 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Cancel order
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Customer Info */}
        <div className="bg-[#faf8f5] rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#2c2825]">Customer</h2>
          <p className="text-sm text-[#2c2825] font-medium">{order.customer_name}</p>
          <div className="flex items-center gap-2 text-sm text-[#9e9791]">
            <Phone size={14} />
            <a href={`tel:${order.customer_phone}`} className="hover:text-[#2c2825]">{order.customer_phone}</a>
          </div>
          <div className="flex items-start gap-2 text-sm text-[#9e9791]">
            <MapPin size={14} className="shrink-0 mt-0.5" />
            <span>{order.delivery_address}, {order.delivery_area}</span>
          </div>
          {order.order_notes && (
            <div className="text-sm text-[#9e9791] bg-[#faf8f5] px-3 py-2 rounded-lg">
              <span className="font-medium">Note:</span> {order.order_notes}
            </div>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:bg-[#1fb855] transition-colors mt-2"
          >
            <MessageCircle size={16} /> Message on WhatsApp
          </a>
        </div>

        {/* Payment */}
        <div className="bg-[#faf8f5] rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#2c2825]">Payment</h2>
          <div className="flex items-center gap-2 text-sm">
            <CreditCard size={14} className="text-[#9e9791]" />
            <span className="font-medium text-[#2c2825]">{order.payment_method || 'N/A'}</span>
          </div>
          {order.payment_ref && (
            <p className="text-sm text-[#9e9791]">Ref: <span className="font-medium">{order.payment_ref}</span></p>
          )}
          <div className="space-y-1.5 pt-2 border-t border-[#e8e2d9]">
            <div className="flex justify-between text-sm"><span className="text-[#9e9791]">Subtotal</span><span>GH₵ {order.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#9e9791]">Delivery</span><span>GH₵ {order.delivery_fee.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm font-semibold text-[#2c2825] pt-1.5 border-t border-[#e8e2d9]">
              <span>Total</span><span>GH₵ {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-[#e8e2d9] p-5">
        <h2 className="text-sm font-semibold text-[#2c2825] mb-3">Items</h2>
        <div className="space-y-2.5">
          {order.order_items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-[#faf8f5]">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  item.item_type === 'box' ? 'bg-[#b0925e]/10 text-[#b0925e]' : 'bg-sky-50 text-sky-600'
                }`}>
                  {item.item_type === 'box' ? 'Box' : 'Product'}
                </span>
                <span className="text-sm font-medium text-[#2c2825]">{item.item_name}</span>
              </div>
              <div className="text-sm text-right">
                <span className="text-[#9e9791]">{item.quantity}x </span>
                <span className="font-medium">GH₵ {item.item_price.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
