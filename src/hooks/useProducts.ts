import { useState, useEffect, useCallback } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { products as fallbackProducts } from '../data/products'
import type { Product } from '../types/database'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setProducts(fallbackProducts.map((p, i) => ({
        id: p.id,
        slug: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        image_url: p.image || null,
        in_stock: true,
        sort_order: i,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })))
      setLoading(false)
      return
    }

    const supabase = await getSupabase()
    if (!supabase) return
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order')

    if (error) {
      console.error('Error fetching products:', error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!isSupabaseConfigured()) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
      return { error: null }
    }
    const supabase = await getSupabase()
    const { error } = await supabase!.from('products').update(updates).eq('id', id)
    if (!error) fetchProducts()
    return { error }
  }

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isSupabaseConfigured()) {
      const newProduct = { ...product, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Product
      setProducts(prev => [...prev, newProduct])
      return { error: null, data: newProduct }
    }
    const supabase = await getSupabase()
    const { data, error } = await supabase!.from('products').insert(product).select().single()
    if (!error) fetchProducts()
    return { error, data }
  }

  const deleteProduct = async (id: string) => {
    if (!isSupabaseConfigured()) {
      setProducts(prev => prev.filter(p => p.id !== id))
      return { error: null }
    }
    const supabase = await getSupabase()
    const { error } = await supabase!.from('products').delete().eq('id', id)
    if (!error) fetchProducts()
    return { error }
  }

  return { products, loading, fetchProducts, updateProduct, createProduct, deleteProduct }
}
