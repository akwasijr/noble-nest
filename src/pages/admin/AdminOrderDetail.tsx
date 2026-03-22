import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useOrders } from '../../hooks/useOrders'
import OrderStatusBadge, { statusConfig } from '../../components/admin/OrderStatusBadge'
import type { Order } from '../../types/database'
import { ArrowLeft, Phone, MapPin, MessageCircle, CreditCard, AlertTriangle, RotateCcw, PackageX, X, Truck, RefreshCw } from 'lucide-react'

const STATUS_FLOW: Order['status'][] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']
const ISSUE_STATUSES: Order['status'][] = ['return_requested', 'returned', 'refunded', 'lost', 'damaged', 'cancelled']

const ISSUE_TYPES = [
  { value: 'wrong_item', label: 'Wrong item sent', icon: PackageX },
  { value: 'damaged_item', label: 'Items damaged', icon: AlertTriangle },
  { value: 'missing_item', label: 'Missing items from order', icon: PackageX },
  { value: 'lost_in_transit', label: 'Lost in transit / not delivered', icon: Truck },
  { value: 'customer_changed_mind', label: 'Customer changed mind', icon: RotateCcw },
  { value: 'late_delivery', label: 'Late delivery complaint', icon: Truck },
  { value: 'other', label: 'Other issue', icon: AlertTriangle },
]

const RESOLUTION_ACTIONS = [
  { status: 'return_requested' as const, label: 'Request return pickup', desc: 'Mark as return requested — arrange pickup from customer' },
  { status: 'returned' as const, label: 'Mark as returned', desc: 'Items received back — inspect and restock' },
  { status: 'refunded' as const, label: 'Issue refund', desc: 'Process refund to customer via original payment method' },
  { status: 'lost' as const, label: 'Mark as lost', desc: 'Package confirmed lost — arrange replacement or refund' },
  { status: 'damaged' as const, label: 'Mark as damaged', desc: 'Items arrived damaged — arrange replacement' },
  { status: 'cancelled' as const, label: 'Cancel order', desc: 'Cancel and refund if applicable' },
]

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { orders, loading, updateOrderStatus } = useOrders()
  const navigate = useNavigate()
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [issueType, setIssueType] = useState('')
  const [issueNote, setIssueNote] = useState('')
  const [showResolveMenu, setShowResolveMenu] = useState(false)

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
    setShowResolveMenu(false)
  }

  const handleReportIssue = async () => {
    if (!issueType) return
    // In a real app, save issue details to DB. For now just update status.
    const statusMap: Record<string, Order['status']> = {
      wrong_item: 'return_requested',
      damaged_item: 'damaged',
      missing_item: 'return_requested',
      lost_in_transit: 'lost',
      customer_changed_mind: 'return_requested',
      late_delivery: order.status, // keep current status, just log the note
      other: order.status,
    }
    const newStatus = statusMap[issueType] || order.status
    if (newStatus !== order.status) {
      await updateOrderStatus(order.id, newStatus)
    }
    setShowIssueModal(false)
    setIssueType('')
    setIssueNote('')
  }

  const isIssueStatus = ISSUE_STATUSES.includes(order.status)
  const hasIssueData = order.issue_type || order.issue_note
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
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          {!isIssueStatus && order.status !== 'cancelled' && (
            <button
              onClick={() => setShowIssueModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <AlertTriangle size={13} /> Report issue
            </button>
          )}
        </div>
      </div>

      {/* Issue banner */}
      {isIssueStatus && (
        <div className={`rounded-xl border p-4 ${
          order.status === 'lost' ? 'bg-red-50/50 border-red-200' :
          order.status === 'damaged' ? 'bg-amber-50/50 border-amber-200' :
          order.status === 'refunded' ? 'bg-teal-50/50 border-teal-200' :
          'bg-orange-50/50 border-orange-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className={
              order.status === 'lost' ? 'text-red-500' :
              order.status === 'damaged' ? 'text-amber-500' :
              order.status === 'refunded' ? 'text-teal-500' :
              'text-orange-500'
            } />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2c2825]">
                {order.status === 'return_requested' && 'Return requested by customer'}
                {order.status === 'returned' && 'Items returned — awaiting inspection'}
                {order.status === 'refunded' && 'Refund processed'}
                {order.status === 'lost' && 'Package lost in transit'}
                {order.status === 'damaged' && 'Items reported as damaged'}
              </p>
              {hasIssueData && (
                <>
                  <p className="text-xs text-[#9e9791] mt-1">
                    Type: {ISSUE_TYPES.find(t => t.value === order.issue_type)?.label || order.issue_type}
                  </p>
                  {order.issue_note && (
                    <p className="text-sm text-[#2c2825] mt-2 bg-white/60 rounded-lg p-3">{order.issue_note}</p>
                  )}
                  <p className="text-xs text-[#9e9791] mt-2">
                    Reported {new Date(order.issue_date || order.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </>
              )}

              {/* Resolution actions */}
              <div className="mt-3 relative">
                <button
                  onClick={() => setShowResolveMenu(!showResolveMenu)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#e8e2d9] text-sm font-medium text-[#2c2825] hover:bg-[#faf8f5] transition-colors"
                >
                  <RefreshCw size={14} /> Resolve / Update status
                </button>
                {showResolveMenu && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl border border-[#e8e2d9] shadow-lg z-10 py-1">
                    {RESOLUTION_ACTIONS
                      .filter(a => a.status !== order.status)
                      .map(action => (
                        <button
                          key={action.status}
                          onClick={() => handleStatusChange(action.status)}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#faf8f5] transition-colors"
                        >
                          <p className="text-sm font-medium text-[#2c2825]">{action.label}</p>
                          <p className="text-xs text-[#9e9791]">{action.desc}</p>
                        </button>
                      ))}
                    {/* Option to move back to normal flow */}
                    <div className="border-t border-[#e8e2d9] mt-1 pt-1">
                      <button
                        onClick={() => handleStatusChange('confirmed')}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#faf8f5] transition-colors"
                      >
                        <p className="text-sm font-medium text-emerald-600">Resolve — move back to confirmed</p>
                        <p className="text-xs text-[#9e9791]">Issue resolved, continue with order fulfillment</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Timeline — only show for normal flow statuses */}
      {!isIssueStatus && (
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
      )}

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
            <div className="text-sm text-[#9e9791] bg-white/60 px-3 py-2 rounded-lg">
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
            {order.status === 'refunded' && (
              <div className="flex justify-between text-sm font-medium text-teal-600 pt-1">
                <span>Refunded</span><span>GH₵ {order.total.toLocaleString()}</span>
              </div>
            )}
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

      {/* Report issue modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowIssueModal(false)} />
          <div className="relative bg-white rounded-2xl border border-[#e8e2d9] shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b border-[#e8e2d9] flex items-center justify-between">
              <h3 className="text-base font-serif text-[#2c2825]">Report an issue</h3>
              <button onClick={() => setShowIssueModal(false)} className="p-1 rounded-lg text-[#9e9791] hover:bg-[#faf8f5]"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-[#9e9791] mb-2 block">What happened?</label>
                <div className="space-y-1.5">
                  {ISSUE_TYPES.map(type => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => setIssueType(type.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                          issueType === type.value
                            ? 'bg-[#b0925e]/10 border border-[#b0925e]/30 text-[#2c2825] font-medium'
                            : 'border border-[#e8e2d9] text-[#9e9791] hover:border-[#b0925e]/20 hover:text-[#2c2825]'
                        }`}
                      >
                        <Icon size={16} className={issueType === type.value ? 'text-[#b0925e]' : ''} />
                        {type.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#9e9791] mb-1.5 block">Details</label>
                <textarea
                  value={issueNote}
                  onChange={e => setIssueNote(e.target.value)}
                  placeholder="Describe what happened, what the customer reported..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-[#e8e2d9] bg-[#faf8f5] rounded-b-2xl flex justify-end gap-2">
              <button onClick={() => setShowIssueModal(false)} className="px-4 py-2.5 rounded-lg text-sm text-[#9e9791] hover:bg-white transition-colors">Cancel</button>
              <button
                onClick={handleReportIssue}
                disabled={!issueType}
                className="px-5 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Report issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
