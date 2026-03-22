import { useState } from 'react'
import { useBoxTiers } from '../../hooks/useBoxTiers'
import { Plus, Trash2, GripVertical, Pencil, Check, X } from 'lucide-react'

export default function AdminBoxes() {
  const { boxTiers, loading, updateBoxTier, addBoxItem, removeBoxItem, updateBoxItem } = useBoxTiers()
  const [editing, setEditing] = useState(false)
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({})
  const [editingTag, setEditingTag] = useState<Record<string, string>>({})
  const [editingName, setEditingName] = useState<Record<string, string>>({})
  const [editingItemLabel, setEditingItemLabel] = useState<Record<string, string>>({})
  const [newItem, setNewItem] = useState<Record<string, { label: string; category: 'baby' | 'mum' }>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const markChanged = () => setHasChanges(true)

  const handlePriceSave = async (id: string) => {
    const price = parseFloat(editingPrice[id])
    if (!isNaN(price)) {
      await updateBoxTier(id, { price })
      markChanged()
    }
    setEditingPrice(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  const handleTagSave = async (id: string) => {
    await updateBoxTier(id, { tag: editingTag[id] || null })
    markChanged()
    setEditingTag(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  const handleNameSave = async (id: string) => {
    const name = editingName[id]?.trim()
    if (name) {
      await updateBoxTier(id, { name })
      markChanged()
    }
    setEditingName(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  const handleItemLabelSave = async (itemId: string, newLabel: string) => {
    if (newLabel.trim() && updateBoxItem) {
      await updateBoxItem(itemId, { label: newLabel.trim() })
      markChanged()
    }
    setEditingItemLabel(prev => { const next = { ...prev }; delete next[itemId]; return next })
  }

  const handleAddItem = async (boxId: string) => {
    const item = newItem[boxId]
    if (!item?.label) return
    const tier = boxTiers.find(b => b.id === boxId)
    await addBoxItem(boxId, {
      box_tier_id: boxId,
      label: item.label,
      category: item.category,
      sort_order: tier?.box_items.length || 0,
    })
    markChanged()
    setNewItem(prev => { const next = { ...prev }; delete next[boxId]; return next })
  }

  const handleSaveAll = () => {
    setEditing(false)
    setHasChanges(false)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setHasChanges(false)
    setEditingPrice({})
    setEditingTag({})
    setEditingName({})
    setEditingItemLabel({})
    setNewItem({})
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-serif text-[#2c2825]">Baby Boxes</h1>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 border border-[#e8e2d9] animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-36 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-[#2c2825]">Baby Boxes</h1>
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-2 rounded-lg text-sm text-[#9e9791] hover:bg-[#faf8f5] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#b0925e] text-white text-sm font-medium hover:bg-[#9a7d4e] transition-colors"
            >
              <Check size={15} /> {hasChanges ? 'Save changes' : 'Done'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e8e2d9] text-sm font-medium text-[#2c2825] hover:bg-[#faf8f5] transition-colors"
          >
            <Pencil size={15} /> Edit boxes
          </button>
        )}
      </div>

      {boxTiers.map(tier => {
        const babyItems = tier.box_items.filter(i => i.category === 'baby').sort((a, b) => a.sort_order - b.sort_order)
        const mumItems = tier.box_items.filter(i => i.category === 'mum').sort((a, b) => a.sort_order - b.sort_order)
        const itemInput = newItem[tier.id] || { label: '', category: 'baby' as const }

        return (
          <div key={tier.id} className="bg-white rounded-xl border border-[#e8e2d9] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-[#faf8f5] border-b border-[#e8e2d9] flex items-center justify-between gap-3 flex-wrap">
              <div>
                {editing && editingName[tier.id] !== undefined ? (
                  <input
                    value={editingName[tier.id]}
                    onChange={e => setEditingName(prev => ({ ...prev, [tier.id]: e.target.value }))}
                    onBlur={() => handleNameSave(tier.id)}
                    onKeyDown={e => e.key === 'Enter' && handleNameSave(tier.id)}
                    autoFocus
                    className="text-lg font-serif text-[#2c2825] bg-white px-2 py-1 rounded border border-[#e8e2d9] focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30"
                  />
                ) : (
                  <h2
                    className={`text-lg font-serif text-[#2c2825] ${editing ? 'cursor-pointer hover:text-[#b0925e] transition-colors' : ''}`}
                    onClick={() => editing && setEditingName(prev => ({ ...prev, [tier.id]: tier.name }))}
                  >
                    {tier.name}
                  </h2>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Tag */}
                {editing ? (
                  editingTag[tier.id] !== undefined ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={editingTag[tier.id]}
                        onChange={e => setEditingTag(prev => ({ ...prev, [tier.id]: e.target.value }))}
                        onBlur={() => handleTagSave(tier.id)}
                        onKeyDown={e => e.key === 'Enter' && handleTagSave(tier.id)}
                        placeholder="Tag (e.g. Best Value)"
                        className="px-2 py-1 rounded border border-[#e8e2d9] text-xs w-32 focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30"
                        autoFocus
                      />
                      <button onClick={() => { setEditingTag(prev => { const next = { ...prev }; delete next[tier.id]; return next }) }} className="p-1 rounded text-gray-400 hover:bg-gray-50"><X size={12} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingTag(prev => ({ ...prev, [tier.id]: tier.tag || '' }))}
                      className={`text-xs px-2.5 py-1 rounded-full ${tier.tag ? 'bg-[#b0925e]/10 text-[#b0925e]' : 'bg-gray-100 text-[#9e9791]'}`}
                    >
                      {tier.tag || '+ Add tag'}
                    </button>
                  )
                ) : (
                  tier.tag && <span className="text-xs px-2.5 py-1 rounded-full bg-[#b0925e]/10 text-[#b0925e]">{tier.tag}</span>
                )}

                {/* Price */}
                {editing && editingPrice[tier.id] !== undefined ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[#9e9791]">GH₵</span>
                    <input
                      type="number"
                      value={editingPrice[tier.id]}
                      onChange={e => setEditingPrice(prev => ({ ...prev, [tier.id]: e.target.value }))}
                      onBlur={() => handlePriceSave(tier.id)}
                      onKeyDown={e => e.key === 'Enter' && handlePriceSave(tier.id)}
                      className="px-2 py-1 rounded border border-[#e8e2d9] text-sm w-20 focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30"
                      autoFocus
                    />
                  </div>
                ) : (
                  <span
                    className={`text-lg font-semibold text-[#2c2825] ${editing ? 'cursor-pointer hover:text-[#b0925e] transition-colors' : ''}`}
                    onClick={() => editing && setEditingPrice(prev => ({ ...prev, [tier.id]: String(tier.price) }))}
                  >
                    GH₵ {tier.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 grid md:grid-cols-2 gap-5">
              {/* Baby Items */}
              <div>
                <h3 className="text-sm font-medium text-[#9e9791] mb-2">For baby ({babyItems.length})</h3>
                <div className="space-y-1">
                  {babyItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2 group py-0.5">
                      {editing && <GripVertical size={14} className="text-[#e8e2d9] shrink-0" />}
                      {editing && editingItemLabel[item.id] !== undefined ? (
                        <input
                          value={editingItemLabel[item.id]}
                          onChange={e => setEditingItemLabel(prev => ({ ...prev, [item.id]: e.target.value }))}
                          onBlur={() => handleItemLabelSave(item.id, editingItemLabel[item.id])}
                          onKeyDown={e => e.key === 'Enter' && handleItemLabelSave(item.id, editingItemLabel[item.id])}
                          autoFocus
                          className="flex-1 text-sm text-[#2c2825] bg-white px-2 py-0.5 rounded border border-[#e8e2d9] focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30"
                        />
                      ) : (
                        <span
                          className={`text-sm text-[#2c2825] flex-1 ${editing ? 'cursor-pointer hover:text-[#b0925e] transition-colors' : ''}`}
                          onClick={() => editing && setEditingItemLabel(prev => ({ ...prev, [item.id]: item.label }))}
                        >
                          {!editing && <span className="text-[#c8c2b8] mr-1.5">·</span>}
                          {item.label}
                        </span>
                      )}
                      {editing && (
                        <button
                          onClick={() => removeBoxItem(item.id)}
                          className="p-1 rounded text-[#e8e2d9] group-hover:text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mum Items */}
              <div>
                <h3 className="text-sm font-medium text-[#9e9791] mb-2">For mum ({mumItems.length})</h3>
                {mumItems.length === 0 && !editing ? (
                  <p className="text-xs text-[#9e9791] italic">No mum items in this tier</p>
                ) : (
                  <div className="space-y-1">
                    {mumItems.map(item => (
                      <div key={item.id} className="flex items-center gap-2 group py-0.5">
                        {editing && <GripVertical size={14} className="text-[#e8e2d9] shrink-0" />}
                        {editing && editingItemLabel[item.id] !== undefined ? (
                          <input
                            value={editingItemLabel[item.id]}
                            onChange={e => setEditingItemLabel(prev => ({ ...prev, [item.id]: e.target.value }))}
                            onBlur={() => handleItemLabelSave(item.id, editingItemLabel[item.id])}
                            onKeyDown={e => e.key === 'Enter' && handleItemLabelSave(item.id, editingItemLabel[item.id])}
                            autoFocus
                            className="flex-1 text-sm text-[#2c2825] bg-white px-2 py-0.5 rounded border border-[#e8e2d9] focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30"
                          />
                        ) : (
                          <span
                            className={`text-sm text-[#2c2825] flex-1 ${editing ? 'cursor-pointer hover:text-[#b0925e] transition-colors' : ''}`}
                            onClick={() => editing && setEditingItemLabel(prev => ({ ...prev, [item.id]: item.label }))}
                          >
                            {!editing && <span className="text-[#c8c2b8] mr-1.5">·</span>}
                            {item.label}
                          </span>
                        )}
                        {editing && (
                          <button
                            onClick={() => removeBoxItem(item.id)}
                            className="p-1 rounded text-[#e8e2d9] group-hover:text-red-400 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    {mumItems.length === 0 && editing && (
                      <p className="text-xs text-[#9e9791] italic">No items yet — add one below</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Add item — only in edit mode */}
            {editing && (
              <div className="px-5 py-3 border-t border-[#e8e2d9] bg-[#faf8f5]">
                <div className="flex gap-2">
                  <input
                    value={itemInput.label}
                    onChange={e => setNewItem(prev => ({ ...prev, [tier.id]: { ...itemInput, label: e.target.value } }))}
                    placeholder="Add item (e.g. Plush toy)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#e8e2d9] text-sm focus:outline-none focus:ring-1 focus:ring-[#b0925e]/30 bg-white"
                    onKeyDown={e => e.key === 'Enter' && handleAddItem(tier.id)}
                  />
                  <select
                    value={itemInput.category}
                    onChange={e => setNewItem(prev => ({ ...prev, [tier.id]: { ...itemInput, category: e.target.value as 'baby' | 'mum' } }))}
                    className="px-2 py-1.5 rounded-lg border border-[#e8e2d9] text-sm bg-white focus:outline-none"
                  >
                    <option value="baby">Baby</option>
                    <option value="mum">Mum</option>
                  </select>
                  <button
                    onClick={() => handleAddItem(tier.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#b0925e] text-white text-sm hover:bg-[#9a7d4e] transition-colors"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
