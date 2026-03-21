import { motion } from 'framer-motion'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  className?: string
}

export default function SectionHeading({
  title,
  subtitle,
  className = '',
}: SectionHeadingProps) {
  return (
    <motion.div
      className={`text-center ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-dark tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-warm-grey text-base md:text-lg max-w-2xl mx-auto font-body">
          {subtitle}
        </p>
      )}
      <div className="mt-5 mx-auto h-px w-16 bg-gold" />
    </motion.div>
  )
}
