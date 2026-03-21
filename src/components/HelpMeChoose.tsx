import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { BoxTier } from '../data/products'
import { boxTiers } from '../data/products'
import { useCart } from '../context/CartContext'

interface Props {
  open: boolean
  onClose: () => void
}

type Step = 'who' | 'budget' | 'result'

const fmt = (n: number) => `GH₵ ${n.toLocaleString()}`

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

export default function HelpMeChoose({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>('who')
  const [who, setWho] = useState<'baby' | 'both' | null>(null)
  const [budget, setBudget] = useState<'low' | 'mid' | 'high' | null>(null)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  function reset() {
    setStep('who')
    setWho(null)
    setBudget(null)
    setAdded(false)
  }

  function getRecommendation(): BoxTier {
    if (who === 'baby' && budget === 'low') return boxTiers[0] // Essentials
    if (who === 'baby' && budget === 'mid') return boxTiers[0]
    if (who === 'both' && budget === 'low') return boxTiers[1] // Deluxe
    if (who === 'both' && budget === 'mid') return boxTiers[1]
    if (budget === 'high') return boxTiers[2] // Luxe
    return boxTiers[1] // Default to Deluxe
  }

  function handleClose() {
    onClose()
    setTimeout(reset, 300)
  }

  function handleAddToBasket(box: BoxTier) {
    addItem({ id: `box-${box.id}`, name: `${box.name} Box`, price: box.price, image: box.closedImage, type: 'box' })
    setAdded(true)
    setTimeout(() => {
      handleClose()
    }, 1200)
  }

  const rec = step === 'result' ? getRecommendation() : null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-dark/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-md rounded-2xl border border-cream-dark bg-white p-6 shadow-xl md:inset-x-auto md:w-[440px]"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-1 text-warm-grey transition-colors hover:text-dark"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Progress dots */}
            <div className="mb-6 flex justify-center gap-2">
              {(['who', 'budget', 'result'] as const).map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? 'w-8 bg-gold' : i < ['who', 'budget', 'result'].indexOf(step) ? 'w-4 bg-gold/40' : 'w-4 bg-cream-dark'
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Who is it for? */}
              {step === 'who' && (
                <motion.div key="who" {...slide}>
                  <p className="font-script text-lg text-gold">help me choose</p>
                  <h2 className="mt-1 font-heading text-2xl text-dark">Who is the gift for?</h2>
                  <p className="mt-2 text-sm text-warm-grey">This helps us pick the perfect box</p>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => { setWho('baby'); setStep('budget') }}
                      className="flex w-full items-center gap-4 rounded-xl border border-cream-dark px-5 py-4 text-left transition-all hover:border-gold hover:bg-gold/5"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-gold">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-medium text-dark">Just for baby</p>
                        <p className="text-xs text-warm-grey">The new arrival deserves the best</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setWho('both'); setStep('budget') }}
                      className="flex w-full items-center gap-4 rounded-xl border border-cream-dark px-5 py-4 text-left transition-all hover:border-gold hover:bg-gold/5"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-gold">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-medium text-dark">Baby & mum</p>
                        <p className="text-xs text-warm-grey">Because mum deserves love too</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Budget */}
              {step === 'budget' && (
                <motion.div key="budget" {...slide}>
                  <button onClick={() => setStep('who')} className="mb-3 flex items-center gap-1 text-xs text-warm-grey hover:text-gold transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Back
                  </button>
                  <p className="font-script text-lg text-gold">almost there</p>
                  <h2 className="mt-1 font-heading text-2xl text-dark">What's your budget?</h2>
                  <p className="mt-2 text-sm text-warm-grey">Every box is wrapped with love, at every price</p>

                  <div className="mt-6 space-y-3">
                    {([
                      { value: 'low' as const, label: 'Keep it thoughtful', range: 'Under GH₵ 500', icon: '✦' },
                      { value: 'mid' as const, label: 'Something special', range: 'GH₵ 500 – 1,000', icon: '✦✦' },
                      { value: 'high' as const, label: 'Go all out', range: 'GH₵ 1,000+', icon: '✦✦✦' },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setBudget(opt.value); setStep('result') }}
                        className="flex w-full items-center justify-between rounded-xl border border-cream-dark px-5 py-4 text-left transition-all hover:border-gold hover:bg-gold/5"
                      >
                        <div>
                          <p className="font-medium text-dark">{opt.label}</p>
                          <p className="text-xs text-warm-grey">{opt.range}</p>
                        </div>
                        <span className="text-sm text-gold/60">{opt.icon}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Result */}
              {step === 'result' && rec && (
                <motion.div key="result" {...slide}>
                  <button onClick={() => setStep('budget')} className="mb-3 flex items-center gap-1 text-xs text-warm-grey hover:text-gold transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Back
                  </button>
                  <p className="font-script text-lg text-gold">perfect match</p>
                  <h2 className="mt-1 font-heading text-2xl text-dark">We recommend</h2>

                  <div className="mt-5 rounded-xl border border-gold/30 bg-gold/5 p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                        <img src={rec.closedImage} alt={rec.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-semibold text-dark">{rec.name}</h3>
                        {rec.tag && (
                          <span className="mt-0.5 inline-block rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
                            {rec.tag}
                          </span>
                        )}
                        <p className="mt-1 text-lg font-semibold text-gold">{fmt(rec.price)}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-dark-soft">Includes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.babyItems.slice(0, 5).map((item) => (
                          <span key={item} className="rounded-full bg-white px-2.5 py-1 text-xs text-dark-soft">
                            {item}
                          </span>
                        ))}
                        {rec.babyItems.length > 5 && (
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs text-warm-grey">
                            +{rec.babyItems.length - 5} more
                          </span>
                        )}
                      </div>
                      {rec.mumItems && (
                        <p className="mt-1 text-xs text-warm-grey">
                          + {rec.mumItems.length} treats for mum
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    <button
                      onClick={() => handleAddToBasket(rec)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold-dark active:scale-[0.98]"
                    >
                      {added ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                          Added to Basket
                        </>
                      ) : (
                        <>
                          Add to Basket
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </>
                      )}
                    </button>
                    <Link
                      to="/#collection"
                      onClick={handleClose}
                      className="flex w-full items-center justify-center gap-1 text-sm text-warm-grey transition-colors hover:text-gold"
                    >
                      View all boxes
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
