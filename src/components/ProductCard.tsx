import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '../data/products'
import { useCart } from '../context/CartContext'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index: _index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image, type: 'product' })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="group flex flex-col rounded-[1.25rem] border border-cream-dark/60 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gold/30">
      {/* Image area */}
      <div className="relative aspect-square bg-cream flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center bg-gradient-to-br from-cream to-cream-dark/60">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-gold shadow-sm">
              {product.category === 'baby-care' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>
              )}
              {product.category === 'feeding' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v4M8 6c0 2 2 3 4 3s4-1 4-3V2"/><path d="M12 9v13"/><circle cx="12" cy="22" r="0" /><path d="M6 22h12"/></svg>
              )}
              {product.category === 'clothing' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 2L2 7l3 1.5V20a1 1 0 001 1h12a1 1 0 001-1V8.5L22 7l-4.5-5h-3L12 5 9.5 2z"/></svg>
              )}
              {product.category === 'accessories' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" /></svg>
              )}
            </div>
            <span className="font-heading text-sm text-dark-soft/60 italic leading-tight">{product.name}</span>
          </div>
        )}

        {/* Added confirmation overlay */}
        <AnimatePresence>
          {added && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-gold/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        <h3 className="font-heading text-base text-dark leading-snug md:text-lg">{product.name}</h3>
        <p className="text-xs text-warm-grey leading-relaxed line-clamp-2 md:text-sm">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="font-script text-lg text-gold md:text-xl">GH₵ {product.price}</span>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 px-3.5 py-1.5 text-xs font-medium text-gold transition-all duration-200 hover:bg-gold hover:text-white active:scale-95 md:px-4 md:py-2 md:text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </article>
  )
}
