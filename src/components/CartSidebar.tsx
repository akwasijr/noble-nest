import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function CartSidebar() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    isCartOpen,
    setCartOpen,
  } = useCart()

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-dark/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setCartOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            role="dialog"
            aria-label="Shopping basket"
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-cream-dark/60 px-6 py-5">
              <div className="flex items-baseline gap-2">
                <h2 className="font-heading text-xl text-dark">Your Basket</h2>
                {totalItems > 0 && (
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 font-body text-xs font-medium text-gold-dark">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="flex size-9 items-center justify-center rounded-full text-warm-grey transition-colors hover:bg-cream-dark hover:text-dark"
                aria-label="Close basket"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
                </svg>
              </button>
            </header>

            {/* Content */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-cream-dark/60">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-warm-grey">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <p className="font-heading text-lg text-dark">Your basket is empty</p>
                <p className="max-w-[220px] font-body text-sm text-warm-grey">
                  Discover thoughtfully curated gifts for every occasion.
                </p>
                <Link
                  to="/shop"
                  onClick={() => setCartOpen(false)}
                  className="mt-2 rounded-full bg-gold px-7 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-gold-dark"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                {/* Item list */}
                <ul className="flex-1 divide-y divide-cream-dark/40 overflow-y-auto px-6">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 py-5">
                      {/* Thumbnail */}
                      <div className="flex size-[50px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream-dark/60">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-full object-cover"
                            loading="lazy"
                            width={50}
                            height={50}
                          />
                        ) : (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-warm-grey">
                            <rect x="3" y="8" width="18" height="13" rx="1" />
                            <path d="M12 8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3" />
                            <path d="M17 8V5a2 2 0 00-2-2h-1a2 2 0 00-2 2v3" />
                            <path d="M12 8v13" />
                            <path d="M3 12h18" />
                          </svg>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-body text-sm font-medium leading-snug text-dark">
                            {item.name}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded text-warm-grey transition-colors hover:bg-cream-dark hover:text-dark"
                            aria-label={`Remove ${item.name}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
                            </svg>
                          </button>
                        </div>

                        <p className="font-body text-sm text-gold">
                          GH₵ {item.price.toFixed(2)}
                        </p>

                        {/* Quantity controls */}
                        <div className="mt-1 flex items-center gap-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="flex size-7 items-center justify-center rounded-full border border-cream-dark/80 font-body text-sm text-dark transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-body text-sm font-medium text-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex size-7 items-center justify-center rounded-full border border-cream-dark/80 font-body text-sm text-dark transition-colors hover:border-gold/50 hover:text-gold"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <footer className="border-t border-cream-dark/60 px-6 pb-6 pt-5">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="font-body text-sm text-warm-grey">Subtotal</span>
                    <span className="font-heading text-lg text-dark">
                      GH₵ {totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <Link
                    to="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="mb-3 flex w-full items-center justify-center rounded-full bg-gold py-3 font-body text-sm font-medium tracking-wide text-white transition-colors hover:bg-gold-dark"
                  >
                    Checkout
                  </Link>

                  <button
                    onClick={() => setCartOpen(false)}
                    className="w-full py-2 font-body text-sm text-warm-grey transition-colors hover:text-gold"
                  >
                    Continue Shopping
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
