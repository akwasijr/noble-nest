import { useState } from 'react'
import { useInventory, type StockItem } from '../../hooks/useInventory'
import { Package, AlertTriangle, PackageX, TrendingUp, ArrowDownCircle, ArrowUpCircle, SlidersHorizontal, Box, Search, X, Check, Minus, Plus, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

type Tab = 'overview' | 'history'
type SortField = 'name' | 'currentStock' | 'value' | 'status'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 10

export default function AdminInventory() {
  const {
    stock, history, loading,
    adjustStock, updateThreshold,
    boxAssembly, totalItems, lowStockItems, outOfStock, totalValue,
  } = useInventory()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all')
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const [adjType, setAdjType] = useState<'in' | 'out'>('in')
  const [adjQty, setAdjQty] = useState('')
  const [adjReason, setAdjReason] = useState('')
  const [editThresholdId, setEditThresholdId] = useState<string | null>(null)
  const [thresholdVal, setThresholdVal] = useState('')
  const [sortField, setSortField] = useState<SortField>('status')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [stockPage, setStockPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [filterCat, setFilterCat] = useState('all')

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-serif text-[#2c2825]">Inventory</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 border border-[#e8e2d9] animate-pulse h-24" />
          ))}
        </div>
      </div>
    )
  }

  const getStatus = (item: StockItem) => {
    if (item.currentStock === 0) return 'out'
    if (item.currentStock <= item.lowStockThreshold) return 'low'
    return 'ok'
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setStockPage(1)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={13} className="text-[#c8c2b8]" />
    return sortDir === 'asc' ? <ChevronUp size={13} className="text-[#b0925e]" /> : <ChevronDown size={13} className="text-[#b0925e]" />
  }

  const statusOrder = { out: 0, low: 1, ok: 2 }

  const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'baby-care', label: 'Baby Care' },
    { id: 'feeding', label: 'Feeding' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'accessories', label: 'Accessories' },
  ]

  const filteredStock = stock
    .filter(s => {
      if (filterStatus === 'low') return getStatus(s) === 'low'
      if (filterStatus === 'out') return getStatus(s) === 'out'
      return true
    })
    .filter(s => filterCat === 'all' || s.category === filterCat)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortField) {
        case 'name': return dir * a.name.localeCompare(b.name)
        case 'currentStock': return dir * (a.currentStock - b.currentStock)
        case 'value': return dir * ((a.currentStock * a.price) - (b.currentStock * b.price))
        case 'status': return dir * (statusOrder[getStatus(a)] - statusOrder[getStatus(b)])
        default: return 0
      }
    })

  const stockTotalPages = Math.max(1, Math.ceil(filteredStock.length / PAGE_SIZE))
  const paginatedStock = filteredStock.slice((stockPage - 1) * PAGE_SIZE, stockPage * PAGE_SIZE)

  const historyTotalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE))
  const paginatedHistory = history.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE)

  // Reset page when filters change
  const handleFilterChange = (f: 'all' | 'low' | 'out') => { setFilterStatus(f); setStockPage(1) }
  const handleSearchChange = (v: string) => { setSearch(v); setStockPage(1) }
  const handleCatChange = (c: string) => { setFilterCat(c); setStockPage(1) }

  const handleAdjust = () => {
    const qty = parseInt(adjQty)
    if (!adjustingId || isNaN(qty) || qty <= 0 || !adjReason) return
    adjustStock(adjustingId, qty, adjType, adjReason)
    setAdjustingId(null)
    setAdjQty('')
    setAdjReason('')
  }

  const handleThresholdSave = (id: string) => {
    const val = parseInt(thresholdVal)
    if (!isNaN(val) && val >= 0) updateThreshold(id, val)
    setEditThresholdId(null)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-serif text-[#2c2825]">Inventory</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#e8e2d9] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} className="text-[#b0925e]" />
            <span className="text-xs text-[#9e9791]">Total items</span>
          </div>
          <p className="text-2xl font-semibold text-[#2c2825]">{totalItems.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e8e2d9] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-xs text-[#9e9791]">Stock value</span>
          </div>
          <p className="text-2xl font-semibold text-[#2c2825]">GH₵ {totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e8e2d9] p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-xs text-[#9e9791]">Low stock</span>
          </div>
          <p className="text-2xl font-semibold text-[#2c2825]">{lowStockItems.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e8e2d9] p-4">
          <div className="flex items-center gap-2 mb-2">
            <PackageX size={16} className="text-rose-500" />
            <span className="text-xs text-[#9e9791]">Out of stock</span>
          </div>
          <p className="text-2xl font-semibold text-[#2c2825]">{outOfStock.length}</p>
        </div>
      </div>

      {/* Box assembly */}
      <div className="bg-white rounded-xl border border-[#e8e2d9] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Box size={16} className="text-[#b0925e]" />
          <h2 className="text-sm font-medium text-[#2c2825]">Boxes you can assemble</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {boxAssembly.map(b => (
            <div key={b.boxId} className="rounded-lg bg-[#faf8f5] p-3">
              <p className="text-sm font-medium text-[#2c2825]">{b.boxName}</p>
              <p className={`text-2xl font-semibold mt-1 ${b.canAssemble <= 2 ? 'text-amber-600' : 'text-[#2c2825]'}`}>
                {b.canAssemble}
              </p>
              <p className="text-[11px] text-[#9e9791] mt-1">Limited by: {b.limitingItem}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-lg p-1 border border-[#e8e2d9] w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-[#2c2825] text-white' : 'text-[#9e9791] hover:text-[#2c2825]'}`}
        >
          Stock levels
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-[#2c2825] text-white' : 'text-[#9e9791] hover:text-[#2c2825]'}`}
        >
          Activity log ({history.length})
        </button>
      </div>

      {/* Stock levels tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Search + filter */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9791]" />
              <input
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#e8e2d9] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30"
              />
            </div>
            {(['all', 'low', 'out'] as const).map(f => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === f ? 'bg-[#2c2825] text-white' : 'bg-white text-[#9e9791] border border-[#e8e2d9] hover:text-[#2c2825]'
                }`}
              >
                {f === 'all' ? `All (${stock.length})` : f === 'low' ? `Low (${lowStockItems.length})` : `Out (${outOfStock.length})`}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCatChange(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterCat === cat.id ? 'bg-[#b0925e] text-white' : 'bg-white text-[#9e9791] border border-[#e8e2d9] hover:text-[#2c2825]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Stock table */}
          <div className="bg-white rounded-xl border border-[#e8e2d9] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#faf8f5] border-b border-[#e8e2d9]">
                    <th className="text-left px-4 py-3">
                      <button onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 text-xs font-medium text-[#9e9791] hover:text-[#2c2825]">
                        Product <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="text-center px-4 py-3">
                      <button onClick={() => toggleSort('currentStock')} className="inline-flex items-center gap-1 text-xs font-medium text-[#9e9791] hover:text-[#2c2825]">
                        In stock <SortIcon field="currentStock" />
                      </button>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[#9e9791]">Low threshold</th>
                    <th className="text-center px-4 py-3">
                      <button onClick={() => toggleSort('status')} className="inline-flex items-center gap-1 text-xs font-medium text-[#9e9791] hover:text-[#2c2825]">
                        Status <SortIcon field="status" />
                      </button>
                    </th>
                    <th className="text-center px-4 py-3">
                      <button onClick={() => toggleSort('value')} className="inline-flex items-center gap-1 text-xs font-medium text-[#9e9791] hover:text-[#2c2825]">
                        Value <SortIcon field="value" />
                      </button>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#9e9791]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ebe3]">
                  {paginatedStock.map(item => {
                    const status = getStatus(item)
                    return (
                      <tr key={item.productId} className="hover:bg-[#faf8f5]/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-[#faf8f5] flex items-center justify-center shrink-0">
                                <Package size={14} className="text-[#9e9791]" />
                              </div>
                            )}
                            <span className="font-medium text-[#2c2825]">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${status === 'out' ? 'text-rose-500' : status === 'low' ? 'text-amber-600' : 'text-[#2c2825]'}`}>
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editThresholdId === item.productId ? (
                            <div className="inline-flex items-center gap-1">
                              <input
                                type="number"
                                value={thresholdVal}
                                onChange={e => setThresholdVal(e.target.value)}
                                className="w-14 px-2 py-1 rounded border border-[#e8e2d9] text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30"
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && handleThresholdSave(item.productId)}
                              />
                              <button onClick={() => handleThresholdSave(item.productId)} className="p-0.5 text-emerald-500"><Check size={14} /></button>
                              <button onClick={() => setEditThresholdId(null)} className="p-0.5 text-gray-400"><X size={14} /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditThresholdId(item.productId); setThresholdVal(String(item.lowStockThreshold)) }}
                              className="text-[#9e9791] hover:text-[#2c2825] transition-colors"
                            >
                              {item.lowStockThreshold}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${
                            status === 'out' ? 'bg-rose-50 text-rose-600' :
                            status === 'low' ? 'bg-amber-50 text-amber-600' :
                            'bg-emerald-50 text-emerald-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              status === 'out' ? 'bg-rose-500' : status === 'low' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            {status === 'out' ? 'Out of stock' : status === 'low' ? 'Low stock' : 'In stock'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-[#9e9791]">
                          GH₵ {(item.currentStock * item.price).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => { setAdjustingId(item.productId); setAdjType('in'); setAdjQty(''); setAdjReason('') }}
                              title="Stock in"
                              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
                            >
                              <ArrowDownCircle size={16} />
                            </button>
                            <button
                              onClick={() => { setAdjustingId(item.productId); setAdjType('out'); setAdjQty(''); setAdjReason('') }}
                              title="Stock out"
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-colors"
                            >
                              <ArrowUpCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredStock.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-[#9e9791]">
                No products match your search
              </div>
            )}
            {stockTotalPages > 1 && (
              <div className="px-4 py-3 border-t border-[#e8e2d9] flex items-center justify-between">
                <p className="text-xs text-[#9e9791]">
                  Showing {(stockPage - 1) * PAGE_SIZE + 1}–{Math.min(stockPage * PAGE_SIZE, filteredStock.length)} of {filteredStock.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setStockPage(p => Math.max(1, p - 1))}
                    disabled={stockPage === 1}
                    className="p-1.5 rounded-lg text-[#9e9791] hover:bg-[#faf8f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: stockTotalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setStockPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        p === stockPage ? 'bg-[#2c2825] text-white' : 'text-[#9e9791] hover:bg-[#faf8f5]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setStockPage(p => Math.min(stockTotalPages, p + 1))}
                    disabled={stockPage === stockTotalPages}
                    className="p-1.5 rounded-lg text-[#9e9791] hover:bg-[#faf8f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-[#e8e2d9] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf8f5] border-b border-[#e8e2d9]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#9e9791]">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#9e9791]">Product</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[#9e9791]">Type</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[#9e9791]">Qty</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#9e9791]">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ebe3]">
                {paginatedHistory.map(adj => (
                  <tr key={adj.id} className="hover:bg-[#faf8f5]/50 transition-colors">
                    <td className="px-4 py-3 text-[#9e9791] whitespace-nowrap">{formatDate(adj.date)}</td>
                    <td className="px-4 py-3 font-medium text-[#2c2825]">{adj.productName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        adj.type === 'in' ? 'text-emerald-600' : adj.type === 'out' ? 'text-rose-500' : 'text-blue-500'
                      }`}>
                        {adj.type === 'in' ? <Plus size={12} /> : adj.type === 'out' ? <Minus size={12} /> : <SlidersHorizontal size={12} />}
                        {adj.type === 'in' ? 'Stock in' : adj.type === 'out' ? 'Stock out' : 'Adjusted'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      <span className={adj.type === 'in' ? 'text-emerald-600' : adj.type === 'out' ? 'text-rose-500' : 'text-blue-500'}>
                        {adj.type === 'in' ? '+' : '-'}{adj.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#9e9791]">{adj.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {history.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-[#9e9791]">
              No stock adjustments yet
            </div>
          )}
          {historyTotalPages > 1 && (
            <div className="px-4 py-3 border-t border-[#e8e2d9] flex items-center justify-between">
              <p className="text-xs text-[#9e9791]">
                Showing {(historyPage - 1) * PAGE_SIZE + 1}–{Math.min(historyPage * PAGE_SIZE, history.length)} of {history.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="p-1.5 rounded-lg text-[#9e9791] hover:bg-[#faf8f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setHistoryPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      p === historyPage ? 'bg-[#2c2825] text-white' : 'text-[#9e9791] hover:bg-[#faf8f5]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))}
                  disabled={historyPage === historyTotalPages}
                  className="p-1.5 rounded-lg text-[#9e9791] hover:bg-[#faf8f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Adjust stock modal */}
      {adjustingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAdjustingId(null)} />
          <div className="relative bg-white rounded-2xl border border-[#e8e2d9] shadow-xl w-full max-w-sm">
            <div className="px-5 py-4 border-b border-[#e8e2d9] flex items-center justify-between">
              <h3 className="text-base font-serif text-[#2c2825]">
                {adjType === 'in' ? 'Stock in' : 'Stock out'}: {stock.find(s => s.productId === adjustingId)?.name}
              </h3>
              <button onClick={() => setAdjustingId(null)} className="p-1 rounded-lg text-[#9e9791] hover:bg-[#faf8f5]"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Type toggle */}
              <div className="flex gap-1 bg-[#faf8f5] rounded-lg p-1">
                <button
                  onClick={() => setAdjType('in')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${adjType === 'in' ? 'bg-emerald-500 text-white' : 'text-[#9e9791]'}`}
                >
                  Stock in
                </button>
                <button
                  onClick={() => setAdjType('out')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${adjType === 'out' ? 'bg-rose-500 text-white' : 'text-[#9e9791]'}`}
                >
                  Stock out
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-[#9e9791] mb-1.5 block">Quantity</label>
                <input
                  type="number"
                  value={adjQty}
                  onChange={e => setAdjQty(e.target.value)}
                  min={1}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#9e9791] mb-1.5 block">Reason</label>
                <select
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e8e2d9] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30"
                >
                  <option value="">Select a reason</option>
                  {adjType === 'in' ? (
                    <>
                      <option value="New shipment arrived">New shipment arrived</option>
                      <option value="Restocked from supplier">Restocked from supplier</option>
                      <option value="Return from customer">Return from customer</option>
                      <option value="Manual count adjustment">Manual count adjustment</option>
                    </>
                  ) : (
                    <>
                      <option value="Order fulfilled">Order fulfilled</option>
                      <option value="Box assembled">Box assembled</option>
                      <option value="Damaged — removed">Damaged — removed</option>
                      <option value="Sample / giveaway">Sample / giveaway</option>
                      <option value="Manual count adjustment">Manual count adjustment</option>
                    </>
                  )}
                </select>
              </div>

              <p className="text-xs text-[#9e9791]">
                Current stock: <span className="font-medium text-[#2c2825]">{stock.find(s => s.productId === adjustingId)?.currentStock ?? 0}</span>
                {adjQty && !isNaN(parseInt(adjQty)) && (
                  <> → <span className={`font-medium ${adjType === 'in' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {Math.max(0, (stock.find(s => s.productId === adjustingId)?.currentStock ?? 0) + (adjType === 'in' ? parseInt(adjQty) : -parseInt(adjQty)))}
                  </span></>
                )}
              </p>
            </div>
            <div className="px-5 py-4 border-t border-[#e8e2d9] bg-[#faf8f5] rounded-b-2xl flex justify-end gap-2">
              <button onClick={() => setAdjustingId(null)} className="px-4 py-2.5 rounded-lg text-sm text-[#9e9791] hover:bg-white transition-colors">Cancel</button>
              <button
                onClick={handleAdjust}
                disabled={!adjQty || parseInt(adjQty) <= 0 || !adjReason}
                className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  adjType === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                {adjType === 'in' ? 'Add stock' : 'Remove stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
