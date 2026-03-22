import { useOrders } from '../../hooks/useOrders'
import { useProducts } from '../../hooks/useProducts'
import { Link } from 'react-router-dom'
import OrderStatusBadge from '../../components/admin/OrderStatusBadge'
import { ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const { orders, loading: ordersLoading } = useOrders()
  const { products, loading: productsLoading } = useProducts()

  const loading = ordersLoading || productsLoading

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const totalOrders = orders.length
  const totalProducts = products.length

  const recentOrders = orders.slice(0, 5)

  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Revenue', value: `GH₵ ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Pending', value: pendingOrders, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Products', value: totalProducts, icon: Package, color: 'bg-purple-50 text-purple-600' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-serif text-[#2c2825]">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 border border-[#e8e2d9] animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-[#2c2825]">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-[#e8e2d9]">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-xs text-[#9e9791] font-medium">{label}</p>
            <p className="text-xl font-semibold text-[#2c2825] mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-[#e8e2d9]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e2d9]">
          <h2 className="font-semibold text-[#2c2825]">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-[#b0925e] hover:underline">View all</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#9e9791]">
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e8e2d9]">
            {recentOrders.map(order => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#faf8f5] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[#2c2825]">{order.order_number}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-[#9e9791] mt-0.5 truncate">{order.customer_name} - {order.delivery_area}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-medium text-sm text-[#2c2825]">GH₵ {order.total.toLocaleString()}</p>
                  <p className="text-xs text-[#9e9791]">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
