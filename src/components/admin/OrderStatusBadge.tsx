import type { Order } from '../../types/database'

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50/80', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', color: 'text-sky-700', bg: 'bg-sky-50/80', dot: 'bg-sky-500' },
  preparing: { label: 'Preparing', color: 'text-violet-700', bg: 'bg-violet-50/80', dot: 'bg-violet-500' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-indigo-700', bg: 'bg-indigo-50/80', dot: 'bg-indigo-500' },
  delivered: { label: 'Delivered', color: 'text-emerald-700', bg: 'bg-emerald-50/80', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'text-rose-700', bg: 'bg-rose-50/80', dot: 'bg-rose-400' },
}

export default function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const config = statusConfig[status] || statusConfig.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

export { statusConfig }
