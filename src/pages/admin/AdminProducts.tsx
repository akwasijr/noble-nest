import { useState } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { Plus, Pencil, Trash2, Check, X, PackageCheck, PackageX, Package } from 'lucide-react'
import type { Product } from '../../types/database'

const CATEGORIES = ['baby-care', 'feeding', 'clothing', 'accessories'] as const

export default function AdminProducts() {
  const { products, loading, updateProduct, createProduct, deleteProduct } = useProducts()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Product>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newProduct, setNewProduct] = useState({ slug: '', name: '', description: '', price: 0, category: 'baby-care', image_url: '', in_stock: true, sort_order: 0 })
  const [deleting, setDeleting] = useState<string | null>(null)

  const startEdit = (p: Product) => {
    setEditingId(p.id)
    setEditData({ name: p.name, price: p.price, description: p.description, category: p.category, in_stock: p.in_stock })
  }

  const saveEdit = async () => {
    if (!editingId) return
    await updateProduct(editingId, editData)
    setEditingId(null)
  }

  const handleCreate = async () => {
    if (!newProduct.name || !newProduct.slug) return
    await createProduct(newProduct as any)
    setNewProduct({ slug: '', name: '', description: '', price: 0, category: 'baby-care', image_url: '', in_stock: true, sort_order: products.length })
    setShowAdd(false)
  }

  const handleDelete = async (id: string) => {
    await deleteProduct(id)
    setDeleting(null)
  }

  const toggleStock = async (p: Product) => {
    await updateProduct(p.id, { in_stock: !p.in_stock })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-serif text-[#2c2825]">Products</h1>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 border border-[#e8e2d9] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    label: cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    items: products.filter(p => p.category === cat),
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-[#2c2825]">Products</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#b0925e] text-white text-sm font-medium hover:bg-[#9a7d4e] transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-[#e8e2d9] p-5 space-y-3">
          <h3 className="font-semibold text-sm text-[#2c2825]">New Product</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))} placeholder="Product name" className="px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30" />
            <input value={newProduct.slug} onChange={e => setNewProduct(p => ({ ...p, slug: e.target.value }))} placeholder="slug (e.g. baby-lotion)" className="px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30" />
            <input type="number" value={newProduct.price || ''} onChange={e => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))} placeholder="Price (GH₵)" className="px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30" />
            <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} className="px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30 bg-white">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
            </select>
          </div>
          <input value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#b0925e] text-white text-sm font-medium hover:bg-[#9a7d4e] transition-colors">Create</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg border border-[#e8e2d9] text-sm text-[#9e9791] hover:bg-[#faf8f5] transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Products by category */}
      {grouped.map(({ category, label, items }) => (
        <div key={category}>
          <h2 className="text-sm font-medium text-[#2c2825] mb-3">{label} ({items.length})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-[#e8e2d9] p-4">
                {editingId === p.id ? (
                  <div className="space-y-2">
                    <input value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} className="w-full px-2 py-1.5 rounded border border-[#e8e2d9] text-sm focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30" />
                    <input type="number" value={editData.price || ''} onChange={e => setEditData(d => ({ ...d, price: Number(e.target.value) }))} className="w-full px-2 py-1.5 rounded border border-[#e8e2d9] text-sm focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30" placeholder="Price" />
                    <select value={editData.category || ''} onChange={e => setEditData(d => ({ ...d, category: e.target.value }))} className="w-full px-2 py-1.5 rounded border border-[#e8e2d9] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
                    </select>
                    <input value={editData.description || ''} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} className="w-full px-2 py-1.5 rounded border border-[#e8e2d9] text-sm focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30" placeholder="Description" />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100"><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-gray-50 text-gray-500 hover:bg-gray-100"><X size={16} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 mb-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-[#faf8f5] flex items-center justify-center shrink-0">
                          <Package size={20} className="text-[#9e9791]" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#2c2825] truncate">{p.name}</span>
                          {!p.in_stock && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-rose-50/80 text-rose-600 font-medium">Out of stock</span>
                          )}
                        </div>
                        <p className="text-xs text-[#9e9791] mt-0.5 line-clamp-2">{p.description}</p>
                        <p className="font-medium text-sm text-[#2c2825] mt-1.5">GH₵ {p.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2.5 border-t border-[#e8e2d9]">
                      <button onClick={() => toggleStock(p)} title={p.in_stock ? 'Mark out of stock' : 'Mark in stock'} className={`p-1.5 rounded transition-colors ${p.in_stock ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-400 hover:bg-rose-50'}`}>
                        {p.in_stock ? <PackageCheck size={16} /> : <PackageX size={16} />}
                      </button>
                      <button onClick={() => startEdit(p)} className="p-1.5 rounded text-[#9e9791] hover:bg-[#faf8f5] hover:text-[#2c2825]"><Pencil size={16} /></button>
                      {deleting === p.id ? (
                        <div className="flex gap-1 ml-auto">
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"><Check size={14} /></button>
                          <button onClick={() => setDeleting(null)} className="p-1.5 rounded bg-gray-50 text-gray-500 hover:bg-gray-100"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleting(p.id)} className="p-1.5 rounded text-[#9e9791] hover:bg-red-50 hover:text-red-600 ml-auto"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-xl border border-[#e8e2d9] px-4 py-8 text-center text-sm text-[#9e9791]">No products in this category</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
