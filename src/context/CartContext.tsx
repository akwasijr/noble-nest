import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  type: 'product' | 'box'
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setCartOpen: (open: boolean) => void
}

const STORAGE_KEY = 'nn-cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* storage full or unavailable */ }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [isCartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === newItem.id)
      if (existing) {
        return prev.map(i =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return
    setItems(prev => prev.map(i => (i.id === id ? { ...i, quantity } : i)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items])

  const value = useMemo<CartContextType>(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isCartOpen, setCartOpen }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isCartOpen]
  )

  return <CartContext value={value}>{children}</CartContext>
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
