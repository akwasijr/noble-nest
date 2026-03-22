import type { Order } from '../../types/database'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  preparing: { label: 'Preparing', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
}

export default function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const config = statusConfig[status] || statusConfig.pending
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  )
}

export { statusConfig }
