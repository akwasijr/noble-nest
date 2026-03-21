import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'
import CartSidebar from './CartSidebar'
import { useCart } from '../context/CartContext'

interface HeaderProps {
  transparent?: boolean
  introReady?: boolean
}

const navLinks = [
  { label: 'Our Boxes', href: '/#collection' },
  { label: 'Shop', href: '/shop' },
  { label: 'Our Story', href: '/#story' },
  { label: 'Why Noble Nest', href: '/#quality' },
]

export default function Header({ transparent = false, introReady = true }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { totalItems, setCartOpen } = useCart()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const isTransparent = transparent && !scrolled
  const bgClass = isTransparent
    ? 'bg-transparent'
    : 'bg-cream/95 backdrop-blur-sm shadow-sm'
  const textClass = isTransparent ? 'text-white' : 'text-dark'
  const logoVariant = isTransparent ? 'white' : 'default'

  function handleNavClick(href: string) {
    setMenuOpen(false)
    if (href.startsWith('/#') && location.pathname === '/') {
      const el = document.querySelector(href.replace('/', ''))
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:px-8">
        {/* Logo — visible immediately so intro logo can land on top of it */}
        <Link to="/" className="shrink-0" aria-label="Noble Nest home">
          <motion.div
            initial={{ opacity: introReady ? 1 : 0 }}
            animate={{ opacity: introReady ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Logo className="h-12 w-auto" variant={logoVariant} />
          </motion.div>
        </Link>

        {/* Desktop navigation — stagger in after intro */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.li
              key={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.1 * i, ease: 'easeOut' }}
            >
              <Link
                to={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm font-medium transition-colors duration-200 hover:text-gold ${
                  (link.href === '/shop' && location.pathname === '/shop') ||
                  (link.href.startsWith('/#') && location.pathname === '/' && location.hash === link.href.slice(1))
                    ? 'text-gold'
                    : textClass
                }`}
              >
                {link.label}
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Desktop CTA + Cart */}
        <div className="hidden md:flex items-center gap-3">
          <motion.button
            type="button"
            onClick={() => setCartOpen(true)}
            className={`relative p-2 transition-colors duration-200 hover:text-gold ${textClass}`}
            aria-label={`Cart (${totalItems} items)`}
            initial={{ opacity: 0, y: -10 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: 0.45, ease: 'easeOut' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && (
              <motion.span
                className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                {totalItems}
              </motion.span>
            )}
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
          >
            <Link
              to="/shop"
              className="inline-flex items-center rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-dark focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 active:bg-gold-dark/90"
            >
              Order Now
            </Link>
          </motion.div>
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setCartOpen(true)}
            className={`relative p-2 ${textClass}`}
            aria-label={`Cart (${totalItems} items)`}
            initial={{ opacity: 0 }}
            animate={introReady ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && (
              <motion.span
                className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                {totalItems}
              </motion.span>
            )}
          </motion.button>
        <motion.button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`md:hidden flex flex-col gap-1.5 p-2 ${textClass}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          initial={{ opacity: 0 }}
          animate={introReady ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <motion.span
            className="block h-0.5 w-6 rounded-full bg-current"
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block h-0.5 w-6 rounded-full bg-current"
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
          <motion.span
            className="block h-0.5 w-6 rounded-full bg-current"
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden overflow-hidden bg-cream border-t border-cream-dark"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="block rounded-lg px-3 py-2.5 text-dark font-medium transition-colors hover:bg-cream-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2">
                <Link
                  to="/shop"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-full bg-gold py-3 text-center font-medium text-white transition-colors hover:bg-gold-dark"
                >
                  Order Now
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    <CartSidebar />
    </>
  )
}
