import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BoxTier } from '../data/products'
import { useCart } from '../context/CartContext'

/* ── Magic sparkle firework burst on image ── */
const SPARK_COLORS = ['#b0925e', '#e8c4b0', '#c9ad7a', '#ffffff', '#fff8f0', '#ffffff']

function SparklesBurst({ active }: { active: boolean }) {
  if (!active) return null

  // Outer ring — big burst
  const outer = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * 360 + (Math.random() - 0.5) * 20
    const rad = (angle * Math.PI) / 180
    const dist = 80 + Math.random() * 100
    return {
      id: i,
      x: Math.cos(rad) * dist,
      y: Math.sin(rad) * dist,
      size: 3 + Math.random() * 7,
      delay: Math.random() * 0.15,
      dur: 0.6 + Math.random() * 0.5,
      color: SPARK_COLORS[i % SPARK_COLORS.length],
    }
  })

  // Inner ring — tighter cluster
  const inner = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 360 + (Math.random() - 0.5) * 40
    const rad = (angle * Math.PI) / 180
    const dist = 30 + Math.random() * 50
    return {
      id: i + 100,
      x: Math.cos(rad) * dist,
      y: Math.sin(rad) * dist,
      size: 2 + Math.random() * 4,
      delay: 0.05 + Math.random() * 0.2,
      dur: 0.4 + Math.random() * 0.3,
      color: SPARK_COLORS[(i + 3) % SPARK_COLORS.length],
    }
  })

  const particles = [...outer, ...inner]

  // Star angles — 8 stars radiating outward
  const starAngles = [0, 45, 90, 135, 180, 225, 270, 315]

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-visible"
      aria-hidden="true"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.2, delay: 0.6 }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: p.color === '#ffffff'
              ? '0 0 10px 4px rgba(255,255,255,0.6)'
              : '0 0 8px 3px rgba(176, 146, 94, 0.4)',
          }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1.8 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0 }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
      {/* Central flash — bigger */}
      <motion.div
        className="absolute h-24 w-24 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(176,146,94,0.3) 40%, transparent 70%)' }}
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.7 }}
      />
      {/* Star sparkles — more, bigger, with white */}
      {starAngles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const dist = 50 + i * 10
        const fill = i % 2 === 0 ? '#ffffff' : '#b0925e'
        return (
          <motion.svg
            key={`star-${i}`}
            width="16" height="16" viewBox="0 0 24 24" fill={fill} className="absolute"
            style={{ filter: fill === '#ffffff' ? 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' : undefined }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1.2, rotate: 0 }}
            animate={{ opacity: 0, x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, scale: 0.2, rotate: 220 }}
            transition={{ duration: 0.8, delay: 0.04 * i, ease: 'easeOut' }}
          >
            <path d="M12 2l2 5.2 5.5.8-4 3.8 1 5.4L12 14.8l-4.5 2.4 1-5.4-4-3.8 5.5-.8z" />
          </motion.svg>
        )
      })}
    </motion.div>
  )
}

interface BoxCardProps {
  box: BoxTier
}

export default function BoxCard({ box }: BoxCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [sparkleKey, setSparkleKey] = useState(0)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleToggle = () => {
    if (!isOpen) setSparkleKey((k) => k + 1)
    setIsOpen((prev) => !prev)
  }

  const handleOrder = () => {
    addItem({ id: `box-${box.id}`, name: `${box.name} Box`, price: box.price, image: box.closedImage, type: 'box' })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <motion.article
      className="group flex flex-col rounded-2xl border border-cream-dark bg-white overflow-hidden transition-shadow duration-300 hover:shadow-xl"
      layout
    >
      {/* Image area */}
      <div
        className="relative aspect-[4/3] cursor-pointer select-none overflow-hidden bg-cream-dark"
        onClick={handleToggle}
      >
        {box.closedImage ? (
          <img
            src={isOpen && box.openImage ? box.openImage : box.closedImage}
            alt={`${box.name} ${isOpen ? 'contents' : 'box'}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="font-heading text-2xl text-dark-soft italic">{box.name}</span>
          </div>
        )}

        {/* Tag badge */}
        {box.tag && (
          <span className="absolute top-3 right-3 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-white shadow-md">
            {box.tag}
          </span>
        )}

        {/* Peek prompt */}
        <motion.div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-dark/60 to-transparent pb-3 pt-10"
          animate={{ opacity: isOpen ? 0 : 1 }}
        >
          <span className="flex items-center gap-1.5 text-sm font-medium text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Tap to peek inside
          </span>
        </motion.div>

        {/* Sparkle firework on image change */}
        <AnimatePresence>
          <SparklesBurst key={sparkleKey} active={sparkleKey > 0} />
        </AnimatePresence>
      </div>

      {/* Header — always visible */}
      <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-2">
        <div>
          <h3 className="font-heading text-xl text-dark">{box.name}</h3>
          <p className="mt-0.5 text-sm text-warm-grey">
            {box.mumItems ? 'For baby & mum' : 'Baby essentials'}
          </p>
        </div>
        <span className="font-heading text-xl text-gold whitespace-nowrap">
          GH₵ {box.price.toLocaleString()}
        </span>
      </div>

      {/* Expandable item list */}
      <div className="px-6">
        <button
          type="button"
          onClick={handleToggle}
          className="flex w-full items-center justify-between py-3 text-sm font-medium text-gold transition-colors hover:text-gold-dark"
        >
          <span>{isOpen ? 'Hide contents' : "What\u2019s inside?"}</span>
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
              className="overflow-hidden"
            >
              <div className={`grid gap-5 pb-4 ${box.mumItems ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-dark-soft">
                    For Baby
                  </h4>
                  <ul className="space-y-1.5">
                    {box.babyItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-warm-grey">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {box.mumItems && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-dark-soft">
                      For Mum
                    </h4>
                    <ul className="space-y-1.5">
                      {box.mumItems.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-warm-grey">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="mt-auto px-6 pb-6">
        <button
          onClick={handleOrder}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-gold-dark hover:shadow-md focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 active:bg-gold-dark/90"
        >
          {added ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Added to Basket
            </>
          ) : (
            <>
              Add to Basket
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </>
          )}
        </button>
      </div>
    </motion.article>
  )
}
