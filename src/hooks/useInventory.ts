import { useState, useEffect } from 'react'
import { products as demoProducts, boxTiers as demoBoxTiers } from '../data/products'

export interface StockItem {
  productId: string
  name: string
  category: string
  currentStock: number
  lowStockThreshold: number
  image?: string
  price: number
}

export interface StockAdjustment {
  id: string
  productId: string
  productName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  date: string
}

export interface BoxAssembly {
  boxId: string
  boxName: string
  canAssemble: number
  limitingItem: string
}

// Generate realistic demo stock levels
function generateDemoStock(): StockItem[] {
  return demoProducts.map(p => ({
    productId: p.id,
    name: p.name,
    category: p.category,
    currentStock: Math.floor(Math.random() * 25) + 3,
    lowStockThreshold: 5,
    image: p.image,
    price: p.price,
  }))
}

function generateDemoHistory(): StockAdjustment[] {
  const reasons = ['Restocked from supplier', 'Order fulfilled', 'Damaged — removed', 'Box assembled', 'New shipment arrived', 'Manual count adjustment']
  const types: StockAdjustment['type'][] = ['in', 'out', 'adjustment']
  const items = demoProducts.slice(0, 8)
  const history: StockAdjustment[] = []

  for (let i = 0; i < 15; i++) {
    const item = items[Math.floor(Math.random() * items.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const daysAgo = Math.floor(Math.random() * 14)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))

    history.push({
      id: `adj-${i}`,
      productId: item.id,
      productName: item.name,
      type,
      quantity: type === 'in' ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 5) + 1,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      date: date.toISOString(),
    })
  }

  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Map box items to products (approximate matching)
const BOX_PRODUCT_MAP: Record<string, Record<string, number>> = {
  essentials: {
    onesies: 3,
    diapers: 1,
    'baby-wipes': 2,
    'baby-lotion': 1,
    'baby-wash': 1,
    'swaddle-blankets': 1,
    'baby-socks': 1,
  },
  deluxe: {
    onesies: 3,
    diapers: 1,
    'baby-wipes': 2,
    'baby-lotion': 1,
    'baby-wash': 1,
    'swaddle-blankets': 1,
    'baby-socks': 1,
    'feeding-bottles': 1,
    bibs: 1,
    'soft-toys': 1,
    'grooming-kit': 1,
  },
  luxe: {
    onesies: 3,
    diapers: 1,
    'baby-wipes': 2,
    'baby-lotion': 1,
    'baby-wash': 1,
    'swaddle-blankets': 1,
    'baby-socks': 1,
    'feeding-bottles': 1,
    bibs: 1,
    'soft-toys': 1,
    'grooming-kit': 1,
  },
}

export function useInventory() {
  const [stock, setStock] = useState<StockItem[]>([])
  const [history, setHistory] = useState<StockAdjustment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Demo mode — load from localStorage or generate
    const saved = localStorage.getItem('nn-inventory')
    if (saved) {
      const parsed = JSON.parse(saved)
      setStock(parsed.stock)
      setHistory(parsed.history)
    } else {
      const demoStock = generateDemoStock()
      const demoHistory = generateDemoHistory()
      setStock(demoStock)
      setHistory(demoHistory)
      localStorage.setItem('nn-inventory', JSON.stringify({ stock: demoStock, history: demoHistory }))
    }
    setLoading(false)
  }, [])

  const persist = (s: StockItem[], h: StockAdjustment[]) => {
    localStorage.setItem('nn-inventory', JSON.stringify({ stock: s, history: h }))
  }

  const adjustStock = (productId: string, quantity: number, type: StockAdjustment['type'], reason: string) => {
    setStock(prev => {
      const updated = prev.map(item => {
        if (item.productId !== productId) return item
        const delta = type === 'in' ? quantity : -quantity
        return { ...item, currentStock: Math.max(0, item.currentStock + delta) }
      })
      const product = prev.find(i => i.productId === productId)
      const adj: StockAdjustment = {
        id: `adj-${Date.now()}`,
        productId,
        productName: product?.name || productId,
        type,
        quantity,
        reason,
        date: new Date().toISOString(),
      }
      const newHistory = [adj, ...history]
      setHistory(newHistory)
      persist(updated, newHistory)
      return updated
    })
  }

  const updateThreshold = (productId: string, threshold: number) => {
    setStock(prev => {
      const updated = prev.map(item =>
        item.productId === productId ? { ...item, lowStockThreshold: threshold } : item
      )
      persist(updated, history)
      return updated
    })
  }

  // Calculate how many of each box can be assembled
  const boxAssembly: BoxAssembly[] = demoBoxTiers.map(tier => {
    const requirements = BOX_PRODUCT_MAP[tier.id] || {}
    let minAssemblable = Infinity
    let limitingItem = ''

    for (const [productId, needed] of Object.entries(requirements)) {
      const item = stock.find(s => s.productId === productId)
      const available = item ? Math.floor(item.currentStock / needed) : 0
      if (available < minAssemblable) {
        minAssemblable = available
        limitingItem = item?.name || productId
      }
    }

    return {
      boxId: tier.id,
      boxName: tier.name,
      canAssemble: minAssemblable === Infinity ? 0 : minAssemblable,
      limitingItem: minAssemblable === Infinity ? 'No items mapped' : limitingItem,
    }
  })

  const totalItems = stock.reduce((sum, s) => sum + s.currentStock, 0)
  const lowStockItems = stock.filter(s => s.currentStock > 0 && s.currentStock <= s.lowStockThreshold)
  const outOfStock = stock.filter(s => s.currentStock === 0)
  const totalValue = stock.reduce((sum, s) => sum + s.currentStock * s.price, 0)

  return {
    stock,
    history,
    loading,
    adjustStock,
    updateThreshold,
    boxAssembly,
    totalItems,
    lowStockItems,
    outOfStock,
    totalValue,
  }
}
