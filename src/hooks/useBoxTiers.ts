import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { boxTiers as fallbackBoxes } from '../data/products'
import type { BoxTierWithItems, BoxItem } from '../types/database'

export function useBoxTiers() {
  const [boxTiers, setBoxTiers] = useState<BoxTierWithItems[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBoxTiers = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setBoxTiers(fallbackBoxes.map((b, i) => ({
        id: b.id,
        slug: b.id,
        name: b.name,
        price: b.price,
        tag: b.tag || null,
        closed_image: b.closedImage,
        open_image: b.openImage,
        sort_order: i,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        box_items: [
          ...b.babyItems.map((item, j) => ({ id: `${b.id}-baby-${j}`, box_tier_id: b.id, label: item, category: 'baby' as const, sort_order: j })),
          ...(b.mumItems || []).map((item, j) => ({ id: `${b.id}-mum-${j}`, box_tier_id: b.id, label: item, category: 'mum' as const, sort_order: j })),
        ],
      })))
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('box_tiers')
      .select('*, box_items(*)')
      .order('sort_order')

    if (error) {
      console.error('Error fetching box tiers:', error)
    } else {
      setBoxTiers((data as BoxTierWithItems[]) || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchBoxTiers() }, [fetchBoxTiers])

  const updateBoxTier = async (id: string, updates: Partial<BoxTierWithItems>) => {
    if (!isSupabaseConfigured()) {
      setBoxTiers(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
      return { error: null }
    }
    const { box_items: _items, ...tierUpdates } = updates as any
    const { error } = await supabase.from('box_tiers').update(tierUpdates).eq('id', id)
    if (!error) fetchBoxTiers()
    return { error }
  }

  const addBoxItem = async (boxTierId: string, item: Omit<BoxItem, 'id'>) => {
    if (!isSupabaseConfigured()) {
      const newItem = { ...item, id: crypto.randomUUID() }
      setBoxTiers(prev => prev.map(b => b.id === boxTierId ? { ...b, box_items: [...b.box_items, newItem] } : b))
      return { error: null }
    }
    const { error } = await supabase.from('box_items').insert(item)
    if (!error) fetchBoxTiers()
    return { error }
  }

  const removeBoxItem = async (itemId: string) => {
    if (!isSupabaseConfigured()) {
      setBoxTiers(prev => prev.map(b => ({ ...b, box_items: b.box_items.filter(i => i.id !== itemId) })))
      return { error: null }
    }
    const { error } = await supabase.from('box_items').delete().eq('id', itemId)
    if (!error) fetchBoxTiers()
    return { error }
  }

  return { boxTiers, loading, fetchBoxTiers, updateBoxTier, addBoxItem, removeBoxItem }
}
