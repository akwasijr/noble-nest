import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BoxCard from '../components/BoxCard'
import HelpMeChoose from '../components/HelpMeChoose'
import WhatsAppButton from '../components/WhatsAppButton'
import { boxTiers, WHATSAPP_BASE } from '../data/products'
import logoSrc from '../assets/logo.svg'

/* ── Wave SVG divider component ── */
function WaveDivider({ flip = false, color = '#f9f2eb' }: { flip?: boolean; color?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-[60px] md:h-[80px]">
        <path
          d="M0,40 C360,100 720,0 1080,60 C1260,80 1380,40 1440,50 L1440,100 L0,100 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

/* ── Decorative scattered elements ── */
function FloatingStars() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Small star shapes */}
      <motion.svg className="absolute top-[15%] left-[8%] h-5 w-5 text-gold/30" viewBox="0 0 24 24" fill="currentColor"
        animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
      </motion.svg>
      <motion.div className="absolute top-[25%] right-[12%] h-2 w-2 rounded-full bg-blush/50"
        animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.svg className="absolute bottom-[20%] right-[6%] h-4 w-4 text-gold/20" viewBox="0 0 24 24" fill="currentColor"
        animate={{ rotate: [0, -360] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
      </motion.svg>
      <motion.div className="absolute top-[60%] left-[5%] h-3 w-3 rounded-full bg-gold/15"
        animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }} />
    </div>
  )
}

/* ── Circular rotating badge ── */
function RotatingBadge({ text, className = '' }: { text: string; className?: string }) {
  const chars = text.split('')
  return (
    <motion.div
      className={`relative h-28 w-28 ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <path id="circlePath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-gold text-[10px] font-medium tracking-[0.3em] uppercase">
          <textPath href="#circlePath" startOffset="0%">
            {chars.map((char, i) => (
              <tspan key={i}>{char}</tspan>
            ))}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl">✦</span>
      </div>
    </motion.div>
  )
}

/* ── Inline SVG logo with stroke→fill animation ── */
function AnimatedLogoSVG({ phase }: { phase: 'stroke' | 'fill' | 'done' }) {
  const [paths, setPaths] = useState<{ d: string; fill: string }[]>([])
  const [viewBox, setViewBox] = useState('0 0 633.89 291.06')

  useEffect(() => {
    // Fetch and parse the logo SVG to extract paths
    fetch(logoSrc)
      .then((r) => r.text())
      .then((svg) => {
        const vb = svg.match(/viewBox="([^"]+)"/)
        if (vb) setViewBox(vb[1])

        // Map class names to fill colors
        const colorMap: Record<string, string> = {}
        const styleMatches = svg.matchAll(/\.(cls-\d+)\s*\{\s*fill:\s*([^;]+);/g)
        for (const m of styleMatches) colorMap[m[1]] = m[2].trim()

        // Extract paths
        const pathMatches = [...svg.matchAll(/<path\s+class="(cls-\d+)"\s+d="([^"]+)"/g)]
        setPaths(pathMatches.map((m) => ({ d: m[2], fill: colorMap[m[1]] || '#b0925e' })))
      })
  }, [])

  if (paths.length === 0) return null

  const strokeDuration = 2.0

  return (
    <svg viewBox={viewBox} className="h-full w-full">
      {paths.map((p, i) => (
        <g key={i}>
          {/* Stroke outline draws in */}
          <motion.path
            d={p.d}
            fill="none"
            stroke={p.fill}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 1 }}
            animate={
              phase === 'stroke'
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 1, opacity: 0 }
            }
            transition={{
              pathLength: { duration: strokeDuration, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
              opacity: phase !== 'stroke' ? { duration: 0.4, delay: 0 } : { duration: 0 },
            }}
          />
          {/* Fill fades in after stroke completes */}
          <motion.path
            d={p.d}
            fill={p.fill}
            stroke="none"
            initial={{ opacity: 0 }}
            animate={
              phase === 'fill' || phase === 'done'
                ? { opacity: 1 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.6, delay: phase === 'fill' ? i * 0.1 : 0, ease: 'easeOut' }}
          />
        </g>
      ))}
    </svg>
  )
}

/* ── Logo intro: stroke → fill → move to header → done ── */
function LogoIntro({ onComplete, onSettled }: { onComplete: () => void; onSettled: () => void }) {
  const [phase, setPhase] = useState<'stroke' | 'fill' | 'settle' | 'done'>('stroke')

  useEffect(() => {
    // stroke: 0-2.4s, fill: 2.4-3.2s, settle: 3.2-4.4s, done: 4.4s+
    const t1 = setTimeout(() => setPhase('fill'), 2400)
    const t2 = setTimeout(() => setPhase('settle'), 3200)
    const t3 = setTimeout(() => { setPhase('done'); onSettled() }, 4200)
    const t4 = setTimeout(onComplete, 4800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onComplete, onSettled])

  const isMd = typeof window !== 'undefined' && window.innerWidth >= 768
  const targetH = 48
  const logoAspect = 633.89 / 291.06
  const targetW = targetH * logoAspect

  const maxW = Math.min(1280, typeof window !== 'undefined' ? window.innerWidth : 1280)
  const navPadding = isMd ? 32 : 20
  const navOffset = typeof window !== 'undefined' ? Math.max(0, (window.innerWidth - maxW) / 2) : 0
  const finalLeft = navOffset + navPadding
  const finalTop = (72 - targetH) / 2

  const winW = typeof window !== 'undefined' ? window.innerWidth : 1280
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800
  const startW = 280
  const startH = startW / logoAspect
  const centerX = (winW - startW) / 2
  const centerY = (winH - startH) / 2

  const isSettling = phase === 'settle' || phase === 'done'
  const svgPhase = phase === 'stroke' ? 'stroke' : phase === 'fill' ? 'fill' : 'done'

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-cream"
      animate={phase === 'done' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute"
        initial={{ left: centerX, top: centerY, width: startW, height: startH }}
        animate={
          isSettling
            ? { left: finalLeft, top: finalTop, width: targetW, height: targetH }
            : { left: centerX, top: centerY, width: startW, height: startH }
        }
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <AnimatedLogoSVG phase={svgPhase} />
      </motion.div>
    </motion.div>
  )
}

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}
const slideRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
}
const blurIn = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 20 },
  visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } },
}
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

/* ── Text reveal: split into words, each word rises + deblurs with stagger ── */
function SplitTextReveal({
  text,
  className = '',
  style,
  as: Tag = 'span',
  delay = 0,
}: {
  text: string
  className?: string
  style?: React.CSSProperties
  as?: 'h1' | 'p' | 'span'
  delay?: number
}) {
  const words = text.split(' ')
  return (
    <Tag className={`${className} flex flex-wrap`} style={style}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden mr-[0.3em] inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.08,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)
  const [headerReady, setHeaderReady] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)

  const handleIntroComplete = useCallback(() => { setIntroComplete(true) }, [])
  const handleSettled = useCallback(() => setHeaderReady(true), [])
  const { scrollY } = useScroll()
  const heroImgY = useTransform(scrollY, [0, 600], [0, 120])

  return (
    <div className="min-h-screen bg-cream font-body">
      <AnimatePresence>{!introComplete && <LogoIntro onComplete={handleIntroComplete} onSettled={handleSettled} />}</AnimatePresence>

      <Header transparent introReady={headerReady} />

      {/* ═══════ HERO — Full bleed, left-aligned, editorial ═══════ */}
      <section className="relative min-h-screen flex items-end pb-20 md:items-center md:pb-0 overflow-hidden">
        <motion.img
          src="/images/hero-mother-baby.jpg" alt="" loading="eager" decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ y: heroImgY }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/75 via-dark/40 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12">
          <motion.div variants={stagger} initial="hidden" animate={introComplete ? 'visible' : 'hidden'} className="max-w-2xl">

            {introComplete && (
              <>
                <SplitTextReveal
                  text="lovingly curated"
                  as="p"
                  className="font-script text-2xl text-gold-light md:text-3xl"
                  delay={0}
                />

                <SplitTextReveal
                  text="A warm embrace for new beginnings"
                  as="h1"
                  className="mt-2 text-4xl font-light italic leading-[1.1] text-cream sm:text-5xl md:text-6xl"
                  style={{ fontFamily: 'var(--font-elegant)' }}
                  delay={0.4}
                />
              </>
            )}

            <motion.p variants={fadeUp} className="mt-8 max-w-lg text-lg leading-relaxed text-cream/75 md:text-xl">
              Hand-curated gift boxes celebrating new babies and the incredible mothers who bring them into the world.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
              <a href="#collection"
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-medium text-white transition-all duration-300 hover:bg-gold-dark hover:gap-3">
                Discover Our Boxes
                <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
              </a>
              <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I'd love to know more about Noble Nest boxes.")}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-cream/30 px-8 py-4 text-base font-medium text-cream backdrop-blur-sm transition-all duration-300 hover:border-cream/60 hover:bg-cream/10">
                Chat With Us
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative rotating badge */}
        <RotatingBadge text="NOBLE NEST · ACCRA · HANDMADE WITH LOVE · " className="absolute bottom-10 right-10 hidden text-cream/20 lg:block" />

        {/* Scroll cue */}
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <motion.div className="flex flex-col items-center gap-1 text-cream/40" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ WAVE TRANSITION ═══════ */}
      <WaveDivider color="#ffffff" />

      {/* ═══════ BRAND TEASER — Editorial asymmetric ═══════ */}
      <section className="relative bg-white py-28 md:py-40 overflow-hidden">
        <FloatingStars />
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          {/* Large editorial heading spanning full width */}
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={blurIn} className="font-script text-xl text-gold md:text-2xl">our why</motion.p>
            <motion.h2 variants={fadeUp} className="mt-2 font-heading text-4xl text-dark sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] max-w-4xl">
              Every mother deserves to feel <span className="font-script text-gold italic">celebrated</span>
            </motion.h2>
          </motion.div>

          {/* Asymmetric split — 60/40 */}
          <div className="mt-16 grid items-center gap-12 md:grid-cols-[1.4fr_1fr] md:gap-20">
            <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              className="relative">
              <div className="aspect-[4/5] rounded-[2rem] bg-cream-dark overflow-hidden">
                <img src="/images/our-story.jpg" alt="Hands arranging baby essentials into a Noble Nest gift box" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              </div>
              {/* Decorative offset shape behind image */}
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] bg-blush/20" />
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              className="space-y-6">
              <motion.p variants={fadeUp} className="text-lg leading-relaxed text-dark-soft md:text-xl">
                When a new baby arrives in Ghana, the joy is immense. The community gathers, prayers are said, love fills the room. But in the beautiful chaos, mum's own comfort often takes a back seat.
              </motion.p>
              <motion.p variants={fadeUp} className="leading-relaxed text-dark-soft">
                We started Noble Nest to change that. Every box is a love letter to new motherhood — filled with the softest essentials for baby and thoughtful treats that tell mum: <em className="font-script text-lg text-gold">"you matter"</em>
              </motion.p>
              <motion.div variants={fadeUp}>
                <a href="#story" className="group inline-flex items-center gap-2 rounded-full border-2 border-dark/20 px-6 py-3 text-sm font-medium text-dark transition-all duration-300 hover:border-gold hover:text-gold">
                  Discover our story <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ WAVE INTO COLLECTION ═══════ */}
      <WaveDivider color="#f9f2eb" />

      {/* ═══════ COLLECTION ═══════ */}
      <section id="collection" className="relative bg-cream py-28 md:py-40 overflow-hidden">
        <FloatingStars />
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center">
            <motion.p variants={blurIn} className="font-script text-xl text-gold md:text-2xl">with love, from us to you</motion.p>
            <motion.h2 variants={fadeUp} className="mt-2 font-heading text-4xl text-dark sm:text-5xl md:text-6xl">
              Choose Your Gift of Love
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-lg text-warm-grey">
              Three tiers of carefully curated joy — because every family deserves something beautiful
            </motion.p>
            <motion.div variants={fadeUp} className="mx-auto mt-5 h-px w-20 bg-gold/40" />
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {boxTiers.map((tier) => (
              <motion.div key={tier.id} variants={fadeUp}>
                <BoxCard box={tier} />
              </motion.div>
            ))}
          </motion.div>

          <motion.p variants={blurIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mt-14 text-center text-warm-grey">
            Not sure which to choose?{' '}
            <button
              onClick={() => setShowQuiz(true)}
              className="font-medium text-gold underline underline-offset-4 decoration-gold/30 hover:decoration-gold transition-colors">
              Help me choose
            </button>
          </motion.p>
        </div>
      </section>

      {/* ═══════ WAVE INTO STORY ═══════ */}
      <WaveDivider color="#ffffff" />

      {/* ═══════ OUR STORY — ALMA-style editorial ═══════ */}
      <section id="story" className="bg-white py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          {/* Full-width heading like ALMA inspo */}
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={blurIn} className="font-script text-xl text-gold md:text-2xl">our story</motion.p>
            <motion.h2 variants={fadeUp} className="mt-2 font-heading text-4xl text-dark sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
              Born from love,<br />
              <span className="font-script text-gold italic">wrapped with care</span>
            </motion.h2>
          </motion.div>

          {/* Large image + text — image spans ~60% like ALMA */}
          <div className="mt-16 grid items-start gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              className="space-y-6 md:sticky md:top-32">
              <motion.div variants={fadeUp} className="h-1 w-16 rounded-full bg-gold" />
              <motion.p variants={fadeUp} className="text-lg leading-relaxed text-dark-soft md:text-xl">
                Noble Nest grew from a moment of realization — watching a dear friend navigate the overwhelming first weeks of motherhood. Surrounded by love, yet exhausted, unsure, and putting herself last.
              </motion.p>
              <motion.p variants={fadeUp} className="leading-relaxed text-dark-soft">
                We thought: what if there was a gift that didn't just welcome the baby, but truly <strong>held space for mum too?</strong> Something hand-picked, beautifully wrapped, that whispered: <em className="font-script text-lg text-gold">"rest, you're doing amazing"</em>
              </motion.p>
              <motion.p variants={fadeUp} className="leading-relaxed text-dark-soft">
                That's what every Noble Nest box is — not just products, but an act of love. From baby's first onesie to mum's quiet moment with herbal tea, every item is chosen with deep intention.
              </motion.p>
              <motion.blockquote variants={fadeUp} className="border-l-4 border-gold/40 pl-6">
                <p className="font-heading text-xl italic text-dark/70 leading-relaxed">
                  "Because the ones who give life deserve to be gifted with just as much love."
                </p>
              </motion.blockquote>
            </motion.div>

            <motion.div variants={slideRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              className="relative">
              <div className="aspect-[3/4] rounded-[2rem] bg-cream-dark overflow-hidden">
                <img src="/images/unboxing.jpg" alt="Mother joyfully unboxing a Noble Nest gift box" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              </div>
              <div className="absolute -top-4 -left-4 -z-10 h-full w-full rounded-[2rem] bg-gold/5" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ PROMISE SECTION — soft with badges ═══════ */}
      <section id="quality" className="relative bg-cream-dark py-28 md:py-36 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center">
            <motion.p variants={blurIn} className="font-script text-xl text-gold md:text-2xl">our promise</motion.p>
            <motion.h2 variants={fadeUp} className="mt-2 font-heading text-4xl text-dark sm:text-5xl">
              Why Families Choose Noble&nbsp;Nest
            </motion.h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '♡', title: 'Made With Love', text: "Every box is hand-assembled with genuine care. We don't just pack — we craft moments." },
              { icon: '✦', title: 'Trusted Quality', text: 'Each item personally tested for safety, softness, and quality. Only the best for your baby.' },
              { icon: '❋', title: 'Gift-Ready', text: 'Beautifully presented, ready to give. No wrapping needed — just smiles guaranteed.' },
              { icon: '◎', title: 'Delivered to You', text: 'Fast delivery across Accra via Bolt & Yango. From our hands to your doorstep.' },
            ].map((card) => (
              <motion.article key={card.title} variants={fadeUp}
                className="group flex flex-col items-center rounded-[1.5rem] bg-white p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cream text-2xl text-gold">
                  {card.icon}
                </div>
                <h3 className="font-heading text-lg text-dark">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dark-soft">{card.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <WaveDivider color="#ffffff" flip />
      <section className="bg-white py-28 md:py-36">
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center">
            <motion.p variants={blurIn} className="font-script text-xl text-gold md:text-2xl">how it works</motion.p>
            <motion.h2 variants={fadeUp} className="mt-2 font-heading text-4xl text-dark sm:text-5xl">
              Simple as <span className="font-script text-gold">1, 2, 3</span>
            </motion.h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {/* Connector line */}
            <div aria-hidden className="pointer-events-none absolute top-14 left-[22%] right-[22%] hidden h-px md:block">
              <motion.div className="h-full bg-gradient-to-r from-gold/0 via-gold/30 to-gold/0"
                initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3 }} />
            </div>

            {[
              { num: '01', title: 'Pick Your Box', text: 'Browse our three lovingly curated tiers and choose the one that feels right' },
              { num: '02', title: 'Send Us a Message', text: "Reach out on WhatsApp — we'll take care of everything from there" },
              { num: '03', title: 'Joy, Delivered', text: "Your beautifully packaged Noble Nest arrives, ready to make someone's day" },
            ].map((step) => (
              <motion.div key={step.num} variants={fadeUp} className="relative flex flex-col items-center text-center">
                <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-cream">
                  <span className="font-heading text-4xl font-bold text-gold/30">{step.num}</span>
                </div>
                <h3 className="font-heading text-xl text-dark">{step.title}</h3>
                <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-dark-soft">{step.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ TESTIMONIAL — Dark, editorial ═══════ */}
      <section className="bg-dark py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-12">
          <motion.div variants={blurIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
            <span className="font-script text-6xl text-gold/40">"</span>
            <blockquote className="mt-2 font-heading text-2xl leading-relaxed text-cream/90 sm:text-3xl md:text-4xl italic">
              The most thoughtful gift I received when my baby arrived. I cried happy tears — someone finally thought about <span className="text-gold">me</span> too.
            </blockquote>
            <p className="mt-8 text-sm text-cream/40">[Add real customer testimonial here]</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════ SHOP CTA ═══════ */}
      <WaveDivider color="#f9f2eb" flip />
      <section className="bg-cream py-24 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
            <motion.p variants={blurIn} className="font-script text-xl text-gold md:text-2xl">individual essentials</motion.p>
            <motion.h2 variants={fadeUp} className="mt-2 font-heading text-3xl text-dark sm:text-4xl md:text-5xl">
              Need just a few items?
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-dark-soft">
              Browse individual baby and mum essentials — from diapers and wipes to grooming kits and soft toys.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link to="/shop"
                className="group mt-8 inline-flex items-center gap-2 rounded-full border-2 border-dark/20 bg-white px-8 py-4 font-medium text-dark transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-lg">
                Browse the Shop <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <HelpMeChoose open={showQuiz} onClose={() => setShowQuiz(false)} />
    </div>
  )
}
