import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logoSrc from '../assets/logo.svg'

interface LogoIntroProps {
  onComplete: () => void
  duration?: number
}

export default function LogoIntro({ onComplete, duration = 3.5 }: LogoIntroProps) {
  const [phase, setPhase] = useState<'draw' | 'hold' | 'exit'>('draw')

  useEffect(() => {
    // Draw phase: 0 → 2s, Hold: 2 → 2.8s, Exit: 2.8 → 3.5s
    const holdTimer = setTimeout(() => setPhase('hold'), duration * 0.57)
    const exitTimer = setTimeout(() => setPhase('exit'), duration * 0.8)
    const doneTimer = setTimeout(onComplete, duration * 1000)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [duration, onComplete])

  return (
    <AnimatePresence>
      {phase !== 'exit' ? null : null}
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-cream"
        initial={{ opacity: 1 }}
        animate={phase === 'exit' ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' as const }}
        onAnimationComplete={() => {
          if (phase === 'exit') onComplete()
        }}
      >
        {/* Subtle gold shimmer line that sweeps across */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: duration * 0.6, ease: 'easeInOut' as const }}
        >
          <motion.div
            className="absolute top-0 bottom-0 w-[2px]"
            style={{
              background: 'linear-gradient(to bottom, transparent, #b0925e, transparent)',
              filter: 'blur(8px)',
            }}
            initial={{ left: '30%' }}
            animate={{ left: '70%' }}
            transition={{ duration: duration * 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
          />
        </motion.div>

        {/* Logo container with clip-path reveal */}
        <div className="relative w-[280px] sm:w-[340px] md:w-[400px]">
          {/* Gold reveal wipe — the logo gets revealed left-to-right */}
          <motion.div
            className="overflow-hidden"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{
              duration: duration * 0.55,
              ease: [0.65, 0, 0.35, 1] as const,
              delay: 0.2,
            }}
          >
            <motion.img
              src={logoSrc}
              alt="Noble Nest"
              className="w-full h-auto"
              initial={{ opacity: 0.4, filter: 'brightness(1.3)' }}
              animate={{ opacity: 1, filter: 'brightness(1)' }}
              transition={{
                duration: duration * 0.4,
                delay: duration * 0.3,
                ease: 'easeOut' as const,
              }}
            />
          </motion.div>

          {/* Tagline fades in after logo reveal */}
          <motion.p
            className="mt-4 text-center font-script text-lg text-gold/70 tracking-wide"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: duration * 0.55,
              ease: 'easeOut' as const,
            }}
          >
            Baby &amp; Toddler Essentials
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
