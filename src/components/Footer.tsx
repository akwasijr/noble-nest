import { Link } from 'react-router-dom'
import Logo from './Logo'
import { WHATSAPP_BASE } from '../data/products'

const navLinks = [
  { label: 'Our Boxes', href: '/#collection' },
  { label: 'Shop', href: '/shop' },
  { label: 'Our Story', href: '/#story' },
  { label: 'Why Noble Nest', href: '/#quality' },
]

const orderLink = `${WHATSAPP_BASE}?text=${encodeURIComponent(
  "Hi! I'd like to order a Noble Nest gift box. Please let me know the next steps!"
)}`

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-cream-dark">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Logo className="h-14 w-auto" />
            <p className="text-sm text-warm-grey font-body">
              Baby &amp; Toddler Essentials | Accra
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-end">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-dark-soft font-medium transition-colors duration-200 hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* WhatsApp CTA */}
          <a
            href={orderLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-dark focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Order on WhatsApp
          </a>
        </div>

        {/* Divider + copyright */}
        <div className="mt-10 border-t border-cream-dark pt-6 text-center">
          <p className="text-xs text-warm-grey font-body">
            &copy; {new Date().getFullYear()} Noble Nest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
