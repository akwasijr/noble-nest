import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import WhatsAppButton from '../components/WhatsAppButton'
import { products, categories, WHATSAPP_BASE } from '../data/products'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const blurIn = {
  hidden: { opacity: 0, filter: 'blur(10px)', y: 15 },
  visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

function WaveDivider({ color = '#f9f2eb' }: { color?: string }) {
  return (
    <div className="w-full overflow-hidden leading-[0]">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-[50px] md:h-[70px]">
        <path d="M0,40 C360,100 720,0 1080,60 C1260,80 1380,40 1440,50 L1440,100 L0,100 Z" fill={color} />
      </svg>
    </div>
  )
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const filteredProducts = useMemo(
    () => activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory),
    [activeCategory],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, typeof products>()
    for (const p of filteredProducts) {
      const list = map.get(p.category) ?? []
      list.push(p)
      map.set(p.category, list)
    }
    return map
  }, [filteredProducts])

  const pills = categories

  return (
    <div className="min-h-screen bg-white font-body">
      <Header />

      {/* Compact header */}
      <section className="bg-cream pt-24 pb-4 md:pt-28 md:pb-6">
        <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
          <motion.p variants={blurIn} initial="hidden" animate="visible" className="font-script text-lg text-gold">
            individual essentials
          </motion.p>
        </div>
      </section>

      {/* Category pills */}
      <div className="sticky top-[72px] z-20 border-b border-cream-dark/50 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <nav aria-label="Product categories"
            className="-mx-6 flex gap-3 overflow-x-auto px-6 py-4 scrollbar-hide md:mx-0 md:justify-center md:px-0">
            {pills.map((pill) => {
              const isActive = activeCategory === pill.id
              return (
                <button key={pill.id} onClick={() => setActiveCategory(pill.id)}
                  className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    isActive
                      ? 'bg-gold text-white shadow-sm'
                      : 'border border-cream-dark bg-white text-dark-soft hover:border-gold hover:text-gold'
                  }`}
                  aria-pressed={isActive}>
                  {pill.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Product grid */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <AnimatePresence mode="wait">
            {activeCategory === 'all' ? (
              <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                className="space-y-20">
                {[...grouped.entries()].map(([cat, items]) => {
                  const catMeta = categories.find((c) => c.id === cat)
                  return (
                    <div key={cat}>
                      <div className="mb-8">
                        <p className="font-script text-lg text-gold">{catMeta?.label.toLowerCase()}</p>
                        <h2 className="mt-1 font-heading text-2xl text-dark md:text-3xl">{catMeta?.label ?? cat}</h2>
                      </div>
                      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                        className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                        {items.map((product) => (
                          <motion.div key={product.id} variants={fadeUp}>
                            <ProductCard product={product} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div key={activeCategory} variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} variants={fadeUp}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {filteredProducts.length === 0 && (
            <p className="py-20 text-center text-warm-grey">No products found in this category.</p>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <WaveDivider color="#f9f2eb" />
      <section className="bg-cream py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={blurIn} className="font-script text-xl text-gold">need something specific?</motion.p>
            <motion.h2 variants={fadeUp} className="mt-2 font-heading text-3xl text-dark sm:text-4xl">
              Can't find what you need?
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-dark-soft">
              Send us a message and we'll source it for you
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex justify-center">
              <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I'm looking for a specific baby item. Can you help?")}`}
                target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border-2 border-dark/20 bg-white px-8 py-3.5 font-medium text-dark transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-lg">
                Message Us on WhatsApp <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Also browse boxes CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <p className="font-script text-lg text-gold">gift boxes</p>
          <h3 className="mt-1 font-heading text-2xl text-dark">Looking for a complete gift?</h3>
          <p className="mt-3 text-dark-soft">Check out our curated Noble Nest baby bundles</p>
          <Link to="/" className="group mt-6 inline-flex items-center gap-2 text-gold font-medium hover:text-gold-dark transition-colors">
            View Our Boxes <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
