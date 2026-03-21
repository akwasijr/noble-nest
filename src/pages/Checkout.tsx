import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { WHATSAPP_BASE } from '../data/products'

/* constants */

type Step = 'review' | 'delivery' | 'confirmation'

const DELIVERY_FEE = 30 // Accra only

const ACCRA_AREAS = [
  'East Legon',
  'Cantonments',
  'Airport Residential',
  'Osu',
  'Labone',
  'Ridge',
  'Dzorwulu',
  'Abelemkpe',
  'Roman Ridge',
  'Tema',
  'Spintex',
  'Madina',
  'Legon',
  'Achimota',
  'Dansoman',
  'Kasoa',
  'Teshie',
  'Nungua',
  'Sakumono',
  'Other',
] as const

type PaymentMethod = 'momo'
type MomoProvider = 'mtn' | 'vodafone' | 'airteltigo'

interface DeliveryForm {
  fullName: string
  phone: string
  area: string
  customArea: string
  address: string
  notes: string
}

interface PaymentForm {
  method: PaymentMethod
  momoProvider: MomoProvider
  momoRef: string
}

/* animation variants */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
}

/* helpers */

const fmt = (n: number) =>
  `GH\u20B5\u00A0${n.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`

function generateOrderNumber() {
  return `NN-${String(Math.floor(100000 + Math.random() * 900000))}`
}

/* sub-components */

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string; num: number }[] = [
    { key: 'review', label: 'Review', num: 1 },
    { key: 'delivery', label: 'Details', num: 2 },
    { key: 'confirmation', label: 'Done', num: 3 },
  ]
  const idx = steps.findIndex((s) => s.key === current)

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 font-body">
      {steps.map((s, i) => {
        const done = i < idx
        const active = i === idx
        return (
          <div key={s.key} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                done
                  ? 'bg-gold text-cream'
                  : active
                    ? 'bg-gold text-cream shadow-md shadow-gold/20'
                    : 'bg-cream-dark text-warm-grey'
              }`}
            >
              {done ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s.num
              )}
            </span>
            <span
              className={`hidden text-sm sm:inline ${
                active ? 'font-medium text-dark' : done ? 'text-gold' : 'text-warm-grey'
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className={`h-px w-6 sm:w-10 ${i < idx ? 'bg-gold' : 'bg-cream-dark'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function GiftIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 19.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125"
      />
    </svg>
  )
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */

export default function Checkout() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart()

  const [step, setStep] = useState<Step>('review')
  const [orderNumber, setOrderNumber] = useState('')

  // snapshot totals at order time so confirmation survives clearCart
  const [confirmedTotal, setConfirmedTotal] = useState(0)
  const [confirmedItemCount, setConfirmedItemCount] = useState(0)

  const [delivery, setDelivery] = useState<DeliveryForm>({
    fullName: '',
    phone: '',
    area: '',
    customArea: '',
    address: '',
    notes: '',
  })
  const [payment, setPayment] = useState<PaymentForm>({
    method: 'momo',
    momoProvider: 'mtn',
    momoRef: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const deliveryFee = DELIVERY_FEE
  const grandTotal = totalPrice + deliveryFee
  const resolvedArea = delivery.area === 'Other' ? delivery.customArea : delivery.area

  /* WhatsApp message builder — includes full order + customer details */
  function buildWhatsAppMessage() {
    const lines = items.map(
      (it) => `\u2022 ${it.name} \u00D7${it.quantity} \u2014 ${fmt(it.price * it.quantity)}`
    )
    const msg = [
      `Hi Noble Nest! I'd like to place an order:`,
      '',
      ...lines,
      '',
      `Subtotal: ${fmt(totalPrice)}`,
      `Delivery (Accra): ${fmt(deliveryFee)}`,
      `Total: ${fmt(grandTotal)}`,
      '',
      `--- Customer Details ---`,
      `Name: ${delivery.fullName}`,
      `Phone: ${delivery.phone}`,
      `Area: ${resolvedArea}`,
      `Address: ${delivery.address}`,
      delivery.notes ? `Notes: ${delivery.notes}` : '',
      '',
      `Payment: Mobile Money (${payment.momoProvider.toUpperCase()})`,
      payment.momoRef ? `MoMo Ref: ${payment.momoRef}` : '',
      '',
      'Please confirm my order. Thank you!',
    ].filter(Boolean).join('\n')
    return `${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`
  }

  /* validation */
  function validateDelivery(): boolean {
    const e: Record<string, string> = {}
    if (!delivery.fullName.trim()) e.fullName = 'Name is required'
    if (!delivery.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^0\d{2}\s?\d{3}\s?\d{4}$/.test(delivery.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid phone number (e.g. 024 123 4567)'
    if (!delivery.area) e.area = 'Select a delivery area'
    if (delivery.area === 'Other' && !delivery.customArea.trim())
      e.customArea = 'Enter your delivery area'
    if (!delivery.address.trim()) e.address = 'Address is required'
    if (!payment.momoRef.trim())
      e.momoRef = 'Transaction reference is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* place order */
  function handlePlaceOrder() {
    if (!validateDelivery()) return
    const num = generateOrderNumber()
    setOrderNumber(num)
    setConfirmedTotal(grandTotal)
    setConfirmedItemCount(items.length)
    clearCart()
    setStep('confirmation')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* form helpers */
  function updateDelivery<K extends keyof DeliveryForm>(key: K, value: DeliveryForm[K]) {
    setDelivery((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function updatePayment<K extends keyof PaymentForm>(key: K, value: PaymentForm[K]) {
    setPayment((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const inputBase =
    'w-full rounded-xl border bg-white px-4 py-3 text-sm text-dark placeholder:text-warm-grey/60 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/30'

  /* ──────────────────────────────────── */
  /*  RENDER                              */
  /* ──────────────────────────────────── */

  return (
    <>
      <Header />

      <main className="min-h-screen bg-cream pt-28 pb-20 font-body">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          {/* step indicator */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
            <StepIndicator current={step} />
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ═══════════════════════════════════════ */}
            {/*  STEP 1 — ORDER REVIEW                  */}
            {/* ═══════════════════════════════════════ */}
            {step === 'review' && (
              <motion.div
                key="review"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
                variants={stagger}
              >
                {/* back link */}
                <motion.div variants={fadeUp}>
                  <Link
                    to="/shop"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-warm-grey transition-colors hover:text-gold"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Shop
                  </Link>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="mb-1 font-heading text-3xl font-semibold text-dark md:text-4xl"
                >
                  Your Order
                </motion.h1>
                <motion.p variants={fadeUp} className="mb-8 font-script text-xl text-gold">
                  review your items
                </motion.p>

                {items.length === 0 ? (
                  /* empty cart */
                  <motion.div
                    variants={fadeUp}
                    className="flex flex-col items-center gap-5 rounded-[1.25rem] border border-cream-dark bg-white/60 py-16 text-center"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream-dark">
                      <GiftIcon className="h-9 w-9 text-warm-grey" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-dark">Your cart is empty</p>
                      <p className="mt-1 text-sm text-warm-grey">
                        Browse our curated gift boxes and baby essentials.
                      </p>
                    </div>
                    <Link
                      to="/shop"
                      className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-gold-dark"
                    >
                      Explore the Shop
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    {/* item list */}
                    <motion.ul variants={stagger} className="mb-8 space-y-4">
                      {items.map((item) => (
                        <motion.li
                          key={item.id}
                          variants={fadeUp}
                          layout
                          className="flex items-center gap-4 rounded-[1.25rem] border border-cream-dark bg-white/60 p-4 sm:p-5"
                        >
                          {/* thumbnail */}
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream-dark sm:h-20 sm:w-20">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <GiftIcon className="h-7 w-7 text-warm-grey" />
                            )}
                          </div>

                          {/* info */}
                          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-dark sm:text-base">
                                {item.name}
                              </p>
                              <p className="text-xs text-warm-grey sm:text-sm">
                                {fmt(item.price)} each
                              </p>
                            </div>

                            {/* quantity controls */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center overflow-hidden rounded-lg border border-cream-dark">
                                <button
                                  type="button"
                                  onClick={() =>
                                    item.quantity > 1
                                      ? updateQuantity(item.id, item.quantity - 1)
                                      : removeItem(item.id)
                                  }
                                  className="flex h-8 w-8 items-center justify-center text-dark transition-colors hover:bg-cream-dark"
                                  aria-label="Decrease quantity"
                                >
                                  &#8722;
                                </button>
                                <span className="flex h-8 w-9 items-center justify-center text-sm font-medium text-dark">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="flex h-8 w-8 items-center justify-center text-dark transition-colors hover:bg-cream-dark"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>

                              {/* line total */}
                              <span className="w-24 text-right text-sm font-semibold text-dark">
                                {fmt(item.price * item.quantity)}
                              </span>

                              {/* remove */}
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-warm-grey transition-colors hover:bg-cream-dark hover:text-dark"
                                aria-label={`Remove ${item.name}`}
                              >
                                &#215;
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>

                    {/* order summary */}
                    <motion.div
                      variants={fadeUp}
                      className="rounded-[1.25rem] border border-cream-dark bg-white/60 p-6"
                    >
                      <h2 className="mb-4 font-script text-xl text-gold">order summary</h2>

                      {/* Accra delivery notice */}
                      <div className="mb-5 flex items-center gap-2 rounded-xl border border-cream-dark bg-cream/40 px-4 py-3 text-sm text-dark">
                        <svg className="h-4 w-4 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Delivery within Accra &mdash; {fmt(DELIVERY_FEE)}</span>
                      </div>

                      {/* totals */}
                      <div className="space-y-2 border-t border-cream-dark pt-4 text-sm">
                        <div className="flex justify-between text-dark">
                          <span>Subtotal</span>
                          <span>{fmt(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-dark">
                          <span>Delivery</span>
                          <span>{fmt(deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between border-t border-cream-dark pt-3 text-base font-semibold text-dark">
                          <span>Total</span>
                          <span>{fmt(grandTotal)}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setStep('delivery')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-gold-dark active:scale-[0.98]"
                        >
                          Continue to Delivery Details
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════ */}
            {/*  STEP 2 — DELIVERY & PAYMENT            */}
            {/* ═══════════════════════════════════════ */}
            {step === 'delivery' && (
              <motion.div
                key="delivery"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
                variants={stagger}
              >
                {/* back link */}
                <motion.div variants={fadeUp}>
                  <button
                    type="button"
                    onClick={() => setStep('review')}
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-warm-grey transition-colors hover:text-gold"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Review
                  </button>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="mb-1 font-heading text-3xl font-semibold text-dark md:text-4xl"
                >
                  Delivery &amp; Payment
                </motion.h1>
                <motion.p variants={fadeUp} className="mb-8 font-script text-xl text-gold">
                  almost there
                </motion.p>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                  {/* LEFT COLUMN */}
                  <motion.div variants={fadeUp} className="flex-1 space-y-8">
                    {/* delivery details */}
                    <section className="rounded-[1.25rem] border border-cream-dark bg-white/60 p-6">
                      <h2 className="mb-5 font-script text-xl text-gold">delivery details</h2>

                      <div className="space-y-4">
                        {/* full name */}
                        <div>
                          <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-dark">
                            Full Name <span className="text-gold">*</span>
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            value={delivery.fullName}
                            onChange={(e) => updateDelivery('fullName', e.target.value)}
                            placeholder="Ama Mensah"
                            className={`${inputBase} ${errors.fullName ? 'border-red-400' : 'border-cream-dark'}`}
                          />
                          {errors.fullName && (
                            <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                          )}
                        </div>

                        {/* phone */}
                        <div>
                          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-dark">
                            Phone Number <span className="text-gold">*</span>
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            value={delivery.phone}
                            onChange={(e) => updateDelivery('phone', e.target.value)}
                            placeholder="024 123 4567"
                            className={`${inputBase} ${errors.phone ? 'border-red-400' : 'border-cream-dark'}`}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                          )}
                        </div>

                        {/* delivery area */}
                        <div>
                          <label htmlFor="area" className="mb-1 block text-sm font-medium text-dark">
                            Delivery Area <span className="text-gold">*</span>
                          </label>
                          <div className="relative">
                            <select
                              id="area"
                              value={delivery.area}
                              onChange={(e) => updateDelivery('area', e.target.value)}
                              className={`${inputBase} appearance-none pr-10 ${
                                errors.area ? 'border-red-400' : 'border-cream-dark'
                              } ${!delivery.area ? 'text-warm-grey/60' : ''}`}
                            >
                              <option value="">Select your area</option>
                              {ACCRA_AREAS.map((a) => (
                                <option key={a} value={a}>
                                  {a}
                                </option>
                              ))}
                            </select>
                            <svg
                              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-grey"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {errors.area && (
                            <p className="mt-1 text-xs text-red-500">{errors.area}</p>
                          )}
                        </div>

                        {/* custom area (only when "Other") */}
                        <AnimatePresence>
                          {delivery.area === 'Other' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <label htmlFor="customArea" className="mb-1 block text-sm font-medium text-dark">
                                Your Area <span className="text-gold">*</span>
                              </label>
                              <input
                                id="customArea"
                                type="text"
                                value={delivery.customArea}
                                onChange={(e) => updateDelivery('customArea', e.target.value)}
                                placeholder="e.g. Ashaiman, Dodowa"
                                className={`${inputBase} ${errors.customArea ? 'border-red-400' : 'border-cream-dark'}`}
                              />
                              {errors.customArea && (
                                <p className="mt-1 text-xs text-red-500">{errors.customArea}</p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* address */}
                        <div>
                          <label htmlFor="address" className="mb-1 block text-sm font-medium text-dark">
                            Specific Address / Landmark <span className="text-gold">*</span>
                          </label>
                          <textarea
                            id="address"
                            rows={3}
                            value={delivery.address}
                            onChange={(e) => updateDelivery('address', e.target.value)}
                            placeholder="e.g. Behind Marina Mall, near the traffic light"
                            className={`${inputBase} resize-none ${errors.address ? 'border-red-400' : 'border-cream-dark'}`}
                          />
                          {errors.address && (
                            <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                          )}
                        </div>

                        {/* notes */}
                        <div>
                          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-dark">
                            Delivery Notes{' '}
                            <span className="font-normal text-warm-grey">(optional)</span>
                          </label>
                          <textarea
                            id="notes"
                            rows={2}
                            value={delivery.notes}
                            onChange={(e) => updateDelivery('notes', e.target.value)}
                            placeholder="e.g. Call when you arrive, gate code 1234"
                            className={`${inputBase} resize-none border-cream-dark`}
                          />
                        </div>
                      </div>
                    </section>

                    {/* payment method */}
                    <section className="rounded-[1.25rem] border border-cream-dark bg-white/60 p-6">
                      <h2 className="mb-5 font-script text-xl text-gold">payment method</h2>

                      <div className="flex gap-4 rounded-xl border border-gold bg-gold/5 p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-dark">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                          </svg>
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-dark">Mobile Money Transfer</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-warm-grey">
                            Send payment before delivery. We'll confirm and dispatch.
                          </p>
                        </div>
                      </div>

                      {/* MoMo details */}
                      <div className="mt-4 space-y-4 rounded-xl border border-cream-dark bg-cream/50 p-4">
                        {/* provider selection */}
                        <fieldset>
                          <legend className="mb-2 text-sm font-medium text-dark">
                            Select provider
                          </legend>
                          <div className="flex flex-wrap gap-2">
                            {(
                              [
                                { value: 'mtn' as const, label: 'MTN MoMo' },
                                { value: 'vodafone' as const, label: 'Vodafone Cash' },
                                { value: 'airteltigo' as const, label: 'AirtelTigo Money' },
                              ]
                            ).map((p) => (
                              <label
                                key={p.value}
                                className={`cursor-pointer rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                                  payment.momoProvider === p.value
                                    ? 'border-gold bg-gold/10 text-dark'
                                    : 'border-cream-dark text-warm-grey hover:border-gold/40'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="momoProvider"
                                  value={p.value}
                                  checked={payment.momoProvider === p.value}
                                  onChange={() => updatePayment('momoProvider', p.value)}
                                  className="sr-only"
                                />
                                {p.label}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        {/* merchant number */}
                        <div className="rounded-lg bg-white/80 px-4 py-3">
                          <p className="text-xs text-warm-grey">Send payment to:</p>
                          <p className="mt-0.5 text-sm font-semibold text-dark">
                            {fmt(grandTotal)} &#8594; 024 XXX XXXX{' '}
                            <span className="font-normal text-warm-grey">(Noble Nest)</span>
                          </p>
                        </div>

                        {/* reference */}
                        <div>
                          <label
                            htmlFor="momoRef"
                            className="mb-1 block text-sm font-medium text-dark"
                          >
                            Transaction Reference / Sender Name{' '}
                            <span className="text-gold">*</span>
                          </label>
                          <input
                            id="momoRef"
                            type="text"
                            value={payment.momoRef}
                            onChange={(e) => updatePayment('momoRef', e.target.value)}
                            placeholder="e.g. TXN-123456 or Ama Mensah"
                            className={`${inputBase} ${errors.momoRef ? 'border-red-400' : 'border-cream-dark'}`}
                          />
                          {errors.momoRef && (
                            <p className="mt-1 text-xs text-red-500">{errors.momoRef}</p>
                          )}
                        </div>
                      </div>
                    </section>
                  </motion.div>

                  {/* RIGHT COLUMN — ORDER SUMMARY */}
                  <motion.aside
                    variants={fadeUp}
                    className="lg:sticky lg:top-28 lg:w-[340px] lg:shrink-0"
                  >
                    <div className="rounded-[1.25rem] border border-cream-dark bg-white/60 p-6">
                      <h2 className="mb-4 font-script text-xl text-gold">order summary</h2>

                      <ul className="mb-4 space-y-2">
                        {items.map((it) => (
                          <li key={it.id} className="flex justify-between text-sm text-dark">
                            <span className="truncate pr-3">
                              {it.name}{' '}
                              <span className="text-warm-grey">&#215;{it.quantity}</span>
                            </span>
                            <span className="shrink-0 font-medium">
                              {fmt(it.price * it.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="space-y-2 border-t border-cream-dark pt-3 text-sm">
                        <div className="flex justify-between text-dark">
                          <span>Subtotal</span>
                          <span>{fmt(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-dark">
                          <span>Delivery (Accra)</span>
                          <span>{fmt(deliveryFee)}</span>
                        </div>
                      </div>

                      {resolvedArea && (
                        <p className="mt-3 text-xs text-warm-grey">
                          Delivering to:{' '}
                          <span className="font-medium text-dark">{resolvedArea}</span>
                        </p>
                      )}

                      <div className="mt-4 flex justify-between border-t border-cream-dark pt-4 text-base font-semibold text-dark">
                        <span>Total</span>
                        <span>{fmt(grandTotal)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-gold-dark active:scale-[0.98]"
                      >
                        Place Order
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>

                      <a
                        href={buildWhatsAppMessage()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-cream-dark px-6 py-3 text-sm font-medium text-dark transition-colors hover:border-gold hover:text-gold"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.82-6.29-2.188a.75.75 0 00-.653-.13l-3.074 1.03 1.03-3.073a.75.75 0 00-.13-.653A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                        </svg>
                        Or order via WhatsApp
                      </a>
                    </div>
                  </motion.aside>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════ */}
            {/*  STEP 3 — CONFIRMATION                  */}
            {/* ═══════════════════════════════════════ */}
            {step === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="flex flex-col items-center text-center"
              >
                {/* animated checkmark */}
                <motion.div
                  variants={fadeUp}
                  className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gold/10"
                >
                  <motion.svg
                    className="h-12 w-12 text-gold"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.3 }}
                    />
                  </motion.svg>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="mb-1 font-heading text-3xl font-semibold text-dark md:text-4xl"
                >
                  Order Confirmed!
                </motion.h1>
                <motion.p variants={fadeUp} className="mb-2 font-script text-xl text-gold">
                  thank you for choosing Noble Nest
                </motion.p>
                <motion.p variants={fadeUp} className="mb-8 text-sm text-warm-grey">
                  Order number:{' '}
                  <span className="font-semibold text-dark">{orderNumber}</span>
                </motion.p>

                {/* summary card */}
                <motion.div
                  variants={fadeUp}
                  className="mb-8 w-full max-w-md rounded-[1.25rem] border border-cream-dark bg-white/60 p-6 text-left"
                >
                  <h2 className="mb-4 font-script text-lg text-gold">order details</h2>

                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-warm-grey">Delivery to</dt>
                      <dd className="text-right font-medium text-dark">
                        {resolvedArea}
                        <br />
                        <span className="font-normal text-warm-grey">{delivery.address}</span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-warm-grey">Payment</dt>
                      <dd className="font-medium text-dark">
                        Mobile Money Transfer
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-warm-grey">Items</dt>
                      <dd className="font-medium text-dark">
                        {confirmedItemCount} item{confirmedItemCount !== 1 ? 's' : ''}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-cream-dark pt-3">
                      <dt className="font-semibold text-dark">Total</dt>
                      <dd className="font-semibold text-dark">{fmt(confirmedTotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-warm-grey">Estimated delivery</dt>
                      <dd className="font-medium text-dark">2 &#8211; 4 hours (within Accra)</dd>
                    </div>
                  </dl>
                </motion.div>

                {/* payment-specific message */}
                <motion.div
                  variants={fadeUp}
                  className="mb-8 w-full max-w-md rounded-xl border border-cream-dark bg-cream-dark/40 px-5 py-4 text-sm text-dark"
                >
                  <p>
                    <svg className="mr-1.5 inline-block h-4 w-4 align-text-bottom" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    We've received your payment reference. We'll confirm via SMS and
                    dispatch shortly.
                  </p>
                </motion.div>

                {/* action links */}
                <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
                  <a
                    href={`${WHATSAPP_BASE}?text=${encodeURIComponent(
                      `Hi! I just placed order ${orderNumber}. I have a question about my delivery.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-dark"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.82-6.29-2.188a.75.75 0 00-.653-.13l-3.074 1.03 1.03-3.073a.75.75 0 00-.13-.653A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    Need help? Chat with us
                  </a>

                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-gold-dark"
                  >
                    Continue Shopping
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <Link
                    to="/"
                    className="text-sm text-warm-grey transition-colors hover:text-gold"
                  >
                    Back to Home
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </>
  )
}
