export interface Product {
  id: string
  name: string
  price: number
  category: 'baby-care' | 'feeding' | 'clothing' | 'accessories'
  description: string
  image?: string
}

export interface BoxTier {
  id: string
  name: string
  price: number
  tag?: string
  babyItems: string[]
  mumItems?: string[]
  closedImage: string
  openImage: string
}

// NOTE: Add product images by setting the `image` field on each product.
// Use your own product photos (white background, square 1:1 ratio recommended).
// Example: { id: 'diapers', name: 'Diapers', ..., image: import.meta.env.BASE_URL + 'images/products/diapers.jpg' }
export const products: Product[] = [
  // Baby Care
  { id: 'diapers', name: 'Diapers', price: 45, category: 'baby-care', description: 'Premium diapers (Pampers, Huggies, Sleepy)', image: import.meta.env.BASE_URL + 'images/products/diapers.jpg' },
  { id: 'baby-wipes', name: 'Baby Wipes', price: 25, category: 'baby-care', description: 'Gentle, fragrance-free baby wipes', image: import.meta.env.BASE_URL + 'images/products/baby-wipes.jpg' },
  { id: 'baby-lotion', name: 'Baby Lotion', price: 35, category: 'baby-care', description: 'Gentle moisturizing baby lotion', image: import.meta.env.BASE_URL + 'images/products/baby-lotion.jpg' },
  { id: 'baby-wash', name: 'Baby Wash', price: 35, category: 'baby-care', description: 'Tear-free baby wash and soap', image: import.meta.env.BASE_URL + 'images/products/baby-wash.jpg' },
  { id: 'baby-powder', name: 'Baby Powder', price: 20, category: 'baby-care', description: 'Soft, soothing baby powder', image: import.meta.env.BASE_URL + 'images/products/baby-powder.jpg' },
  { id: 'baby-shampoo', name: 'Baby Shampoo', price: 30, category: 'baby-care', description: 'Gentle baby shampoo', image: import.meta.env.BASE_URL + 'images/products/baby-shampoo.jpg' },
  { id: 'nappy-rash-cream', name: 'Nappy Rash Cream', price: 30, category: 'baby-care', description: 'Soothing nappy rash cream', image: import.meta.env.BASE_URL + 'images/products/nappy-rash-cream.jpg' },
  { id: 'baby-sterilizer', name: 'Baby Sterilizer', price: 120, category: 'baby-care', description: 'Bottle and accessory sterilizer', image: import.meta.env.BASE_URL + 'images/products/baby-sterilizer.jpg' },
  // Feeding
  { id: 'feeding-bottles', name: 'Feeding Bottles', price: 45, category: 'feeding', description: 'BPA-free feeding bottle set', image: import.meta.env.BASE_URL + 'images/products/feeding-bottles.jpg' },
  { id: 'bibs', name: 'Bibs', price: 20, category: 'feeding', description: 'Soft, absorbent baby bibs', image: import.meta.env.BASE_URL + 'images/products/bibs.jpg' },
  { id: 'sippy-cups', name: 'Sippy Cups', price: 35, category: 'feeding', description: 'Spill-proof sippy cups', image: import.meta.env.BASE_URL + 'images/products/sippy-cups.jpg' },
  { id: 'baby-food', name: 'Baby Food (Cerelac)', price: 30, category: 'feeding', description: 'Nutritious baby cereal', image: import.meta.env.BASE_URL + 'images/products/baby-food.jpg' },
  // Clothing
  { id: 'onesies', name: 'Onesies', price: 40, category: 'clothing', description: 'Soft cotton baby onesies', image: import.meta.env.BASE_URL + 'images/products/onesies.jpg' },
  { id: 'baby-socks', name: 'Baby Socks', price: 15, category: 'clothing', description: 'Cozy baby socks set', image: import.meta.env.BASE_URL + 'images/products/baby-socks.jpg' },
  { id: 'swaddle-blankets', name: 'Swaddle Blankets', price: 55, category: 'clothing', description: 'Breathable muslin swaddle blankets', image: import.meta.env.BASE_URL + 'images/products/swaddle-blankets.jpg' },
  { id: 'baby-wraps', name: 'Baby Wraps', price: 50, category: 'clothing', description: 'Comfortable baby carrying wraps', image: import.meta.env.BASE_URL + 'images/products/baby-wraps.jpg' },
  // Accessories
  { id: 'soft-toys', name: 'Soft Toys', price: 40, category: 'accessories', description: 'Plush baby-safe soft toys', image: import.meta.env.BASE_URL + 'images/products/soft-toys.jpg' },
  { id: 'teething-rings', name: 'Teething Rings', price: 25, category: 'accessories', description: 'BPA-free teething rings', image: import.meta.env.BASE_URL + 'images/products/teething-rings.jpg' },
  { id: 'diaper-bags', name: 'Diaper Bags', price: 85, category: 'accessories', description: 'Stylish, practical diaper bags', image: import.meta.env.BASE_URL + 'images/products/diaper-bags.jpg' },
  { id: 'changing-mats', name: 'Changing Mats', price: 45, category: 'accessories', description: 'Portable changing mats', image: import.meta.env.BASE_URL + 'images/products/changing-mats.jpg' },
  { id: 'baby-hair-oils', name: 'Baby Hair Oils', price: 20, category: 'accessories', description: 'Gentle baby hair oils', image: import.meta.env.BASE_URL + 'images/products/baby-hair-oils.jpg' },
  { id: 'baby-colognes', name: 'Baby Colognes', price: 35, category: 'accessories', description: 'Light, baby-friendly colognes', image: import.meta.env.BASE_URL + 'images/products/baby-colognes.jpg' },
  { id: 'disposable-pads', name: 'Disposable Pads', price: 15, category: 'accessories', description: 'Disposable changing pads', image: import.meta.env.BASE_URL + 'images/products/disposable-pads.jpg' },
  { id: 'grooming-kit', name: 'Baby Grooming Kit', price: 60, category: 'accessories', description: 'Complete baby grooming set', image: import.meta.env.BASE_URL + 'images/products/grooming-kit.jpg' },
]

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'baby-care', label: 'Baby Care' },
  { id: 'feeding', label: 'Feeding' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'accessories', label: 'Accessories' },
] as const

export const boxTiers: BoxTier[] = [
  {
    id: 'essentials',
    name: 'The Essentials',
    price: 400,
    babyItems: ['3 Onesies', 'Newborn diaper pack', '2 Packs of wipes', 'Baby lotion & wash', 'Swaddle blanket', 'Mittens & socks', 'Baby Tips booklet', 'Welcome baby message card'],
    closedImage: import.meta.env.BASE_URL + 'images/box-essentials-closed.jpg',
    openImage: import.meta.env.BASE_URL + 'images/box-essentials-open.jpg',
  },
  {
    id: 'deluxe',
    name: 'The Deluxe',
    price: 750,
    tag: 'Best Value',
    babyItems: ['Everything in The Essentials, plus:', 'Feeding bottle set', 'Bib & burp cloth', 'Plush toy', 'Baby grooming kit'],
    mumItems: ['Small mum treat', 'Postpartum herbal tea', 'Stretch mark oil or body butter'],
    closedImage: import.meta.env.BASE_URL + 'images/box-deluxe-closed.jpg',
    openImage: import.meta.env.BASE_URL + 'images/box-deluxe-open.jpg',
  },
  {
    id: 'luxe',
    name: 'The Luxe',
    price: 1400,
    tag: 'Most Popular',
    babyItems: ['Everything in The Deluxe, plus:', 'Organic cotton outfit', 'Luxury hooded baby towel', 'Milestone cards set'],
    mumItems: ['Baby-safe scented candle', 'Silk sleep mask', 'Luxury postpartum tea blend', 'Premium body butter', 'Satin head wrap', 'Affirmation card set', 'Bath soak salts', '"Letters to My Baby" journal', 'Chocolate box', 'Soft home slippers'],
    closedImage: import.meta.env.BASE_URL + 'images/box-luxe-closed.jpg',
    openImage: import.meta.env.BASE_URL + 'images/box-luxe-open.jpg',
  },
]

export const WHATSAPP_NUMBER = '233XXXXXXXXX'
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`
