import logoSrc from '../assets/logo.svg'

interface LogoProps {
  className?: string
  variant?: 'default' | 'white'
}

export default function Logo({ className = '', variant = 'default' }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="Noble Nest"
      className={`${className} ${variant === 'white' ? 'brightness-0 invert' : ''}`}
    />
  )
}
