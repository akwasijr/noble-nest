import { useState } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { Plus, Pencil, Trash2, Check, X, PackageCheck, PackageX, Package, Tag, Grid3X3 } from 'lucide-react'
import type { Product } from '../../types/database'

const DEFAULT_CATEGORIES = [
  { id: 'baby-care', label: 'Baby Care' },
  { id: 'feeding', label: 'Feeding' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'accessories', label: 'Accessories' },
]

export default function AdminProducts() {
  const { products, loading, updateProduct, createProduct, deleteProduct } = useProducts()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Product>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newProduct, setNewProduct] = useState({ slug: '', name: '', description: '', price: 0, category: 'baby-care', image_url: '', in_stock: true, sort_order: 0 })
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [editCatLabel, setEditCatLabel] = useState('')
  const [newCat, setNewCat] = useState({ id: '', label: '' })
  const [showAddCat, setShowAddCat] = useState(false)
  const [filterCat, setFilterCat] = useState('all')

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
    setNewProduct({ slug: '', name: '', description: '', price: 0, category: categories[0]?.id || 'baby-care', image_url: '', in_stock: true, sort_order: products.length })
    setShowAdd(false)
  }

  const handleDelete = async (id: string) => {
    await deleteProduct(id)
    setDeleting(null)
  }

  const toggleStock = async (p: Product) => {
    await updateProduct(p.id, { in_stock: !p.in_stock })
  }

  const saveCatEdit = (oldId: string) => {
    setCategories(prev => prev.map(c => c.id === oldId ? { ...c, label: editCatLabel } : c))
    setEditingCat(null)
  }

  const addCategory = () => {
    if (!newCat.label) return
    const id = newCat.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    setCategories(prev => [...prev, { id, label: newCat.label }])
    setNewCat({ id: '', label: '' })
    setShowAddCat(false)
  }

  const deleteCat = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-serif text-[#2c2825]">Products</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 border border-[#e8e2d9] animate-pulse h-32" />
          ))}
        </div>
      </div>
    )
  }

  const filteredProducts = filterCat === 'all' ? products : products.filter(p => p.category === filterCat)

  const getCatLabel = (id: string) => categories.find(c => c.id === id)?.label || id.replace(/-/g, ' ')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-[#2c2825]">Products</h1>
        {activeTab === 'products' && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#b0925e] text-white text-sm font-medium hover:bg-[#9a7d4e] transition-colors"
          >
            <Plus size={16} /> Add product
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-lg p-1 border border-[#e8e2d9] w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'products' ? 'bg-[#2c2825] text-white' : 'text-[#9e9791] hover:text-[#2c2825]'
          }`}
        >
          <Grid3X3 size={15} /> Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'categories' ? 'bg-[#2c2825] text-white' : 'text-[#9e9791] hover:text-[#2c2825]'
          }`}
        >
          <Tag size={15} /> Categories ({categories.length})
        </button>
      </div>

      {/* ── Categories Tab ── */}
      {activeTab === 'categories' && (
        <div className="space-y-3">
          <p className="text-sm text-[#9e9791]">Manage product categories. Products are grouped by these in the shop.</p>

          <div className="bg-white rounded-xl border border-[#e8e2d9] divide-y divide-[#e8e2d9]">
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat.id).length
              return (
                <div key={cat.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  {editingCat === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        value={editCatLabel}
                        onChange={e => setEditCatLabel(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30"
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && saveCatEdit(cat.id)}
                      />
                      <button onClick={() => saveCatEdit(cat.id)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Check size={16} /></button>
                      <button onClick={() => setEditingCat(null)} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100"><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#faf8f5] flex items-center justify-center">
                          <Tag size={14} className="text-[#b0925e]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2c2825]">{cat.label}</p>
                          <p className="text-xs text-[#9e9791]">{count} product{count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingCat(cat.id); setEditCatLabel(cat.label) }}
                          className="p-1.5 rounded-lg text-[#9e9791] hover:bg-[#faf8f5] hover:text-[#2c2825]"
                        >
                          <Pencil size={15} />
                        </button>
                        {count === 0 && (
                          <button
                            onClick={() => deleteCat(cat.id)}
                            className="p-1.5 rounded-lg text-[#9e9791] hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {showAddCat ? (
            <div className="bg-white rounded-xl border border-[#e8e2d9] p-4 flex items-center gap-3">
              <input
                value={newCat.label}
                onChange={e => setNewCat({ id: '', label: e.target.value })}
                placeholder="Category name (e.g. Bath & Body)"
                className="flex-1 px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && addCategory()}
              />
              <button onClick={addCategory} className="px-4 py-2 rounded-lg bg-[#b0925e] text-white text-sm font-medium hover:bg-[#9a7d4e]">Add</button>
              <button onClick={() => setShowAddCat(false)} className="px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm text-[#9e9791] hover:bg-[#faf8f5]">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCat(true)}
              className="inline-flex items-center gap-1.5 text-sm text-[#b0925e] font-medium hover:text-[#9a7d4e] transition-colors"
            >
              <Plus size={15} /> Add category
            </button>
          )}
        </div>
      )}

      {/* ── Products Tab ── */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Category filter pills */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterCat === 'all' ? 'bg-[#2c2825] text-white' : 'bg-white text-[#9e9791] border border-[#e8e2d9] hover:text-[#2c2825]'
              }`}
            >
              All ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat.id).length
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCat(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterCat === cat.id ? 'bg-[#2c2825] text-white' : 'bg-white text-[#9e9791] border border-[#e8e2d9] hover:text-[#2c2825]'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Add Product Form */}
          {showAdd && (
            <div className="bg-white rounded-xl border border-[#e8e2d9] p-5 space-y-3">
              <h3 className="font-medium text-sm text-[#2c2825]">New product</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9e9791] mb-1 block">Name</label>
                  <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))} placeholder="Product name" className="w-full px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30" />
                </div>
                <div>
                  <label className="text-xs text-[#9e9791] mb-1 block">Price (GH₵)</label>
                  <input type="number" value={newProduct.price || ''} onChange={e => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30" />
                </div>
                <div>
                  <label className="text-xs text-[#9e9791] mb-1 block">Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30 bg-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#9e9791] mb-1 block">Image URL</label>
                  <input value={newProduct.image_url} onChange={e => setNewProduct(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#9e9791] mb-1 block">Description</label>
                <input value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} placeholder="Brief product description" className="w-full px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-2 focus:ring-[#b0925e]/30" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#b0925e] text-white text-sm font-medium hover:bg-[#9a7d4e] transition-colors">Create product</button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm text-[#9e9791] hover:bg-[#faf8f5] transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {/* Products grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-[#e8e2d9] p-4">
                {editingId === p.id ? (
                  <div className="space-y-2">
                    <input value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} className="w-full px-2.5 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30" placeholder="Name" />
                    <input type="number" value={editData.price || ''} onChange={e => setEditData(d => ({ ...d, price: Number(e.target.value) }))} className="w-full px-2.5 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30" placeholder="Price" />
                    <select value={editData.category || ''} onChange={e => setEditData(d => ({ ...d, category: e.target.value }))} className="w-full px-2.5 py-2 rounded-lg border border-[#e8e2d9] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <input value={editData.description || ''} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} className="w-full px-2.5 py-2 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30" placeholder="Description" />
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveEdit} className="px-3 py-1.5 rounded-lg bg-[#b0925e] text-white text-xs font-medium hover:bg-[#9a7d4e]">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs text-[#9e9791] hover:bg-[#faf8f5]">Cancel</button>
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
                        <span className="text-sm font-medium text-[#2c2825] leading-tight">{p.name}</span>
                        <p className="text-xs text-[#9e9791] mt-0.5 line-clamp-2">{p.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-semibold text-sm text-[#2c2825]">GH₵ {p.price}</span>
                          {!p.in_stock && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-500 font-medium">Out of stock</span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#b0925e] mt-1 block">{getCatLabel(p.category)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2.5 border-t border-[#f0ebe3]">
                      <button onClick={() => toggleStock(p)} title={p.in_stock ? 'Mark out of stock' : 'Mark in stock'} className={`p-1.5 rounded-lg transition-colors ${p.in_stock ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-400 hover:bg-rose-50'}`}>
                        {p.in_stock ? <PackageCheck size={16} /> : <PackageX size={16} />}
                      </button>
                      <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg text-[#9e9791] hover:bg-[#faf8f5] hover:text-[#2c2825]"><Pencil size={16} /></button>
                      {deleting === p.id ? (
                        <div className="flex gap-1 ml-auto">
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Check size={14} /></button>
                          <button onClick={() => setDeleting(null)} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleting(p.id)} className="p-1.5 rounded-lg text-[#9e9791] hover:bg-red-50 hover:text-red-600 ml-auto"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-xl border border-[#e8e2d9] px-4 py-12 text-center text-sm text-[#9e9791]">
                No products {filterCat !== 'all' ? `in ${getCatLabel(filterCat)}` : 'yet'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
