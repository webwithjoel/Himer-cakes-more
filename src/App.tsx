import { useEffect, useMemo, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'

const IMAGES = {
  logo: 'https://i.postimg.cc/XNyDT02D/1795180178187.jpg',
  flowerCake: 'https://i.postimg.cc/Pxv2smMb/1795180234792.jpg',
  ricePlates: 'https://i.postimg.cc/qBnj1xqv/1795180108912.jpg',
  chef: 'https://i.postimg.cc/9XGYdXgX/1795179954184.jpg',
  spaghetti: 'https://i.postimg.cc/cC2W1MqL/1795179991638.jpg',
  ponmo: 'https://i.postimg.cc/SKDwN7Ck/1795179917536.jpg',
  cupcakes: 'https://i.postimg.cc/HkHYrzJF/1795179733728.jpg',
  bucket: 'https://i.postimg.cc/66vtzgCs/1795179447986-2.jpg',
  jollof: 'https://i.postimg.cc/Njpc5cvx/1795179360674-2.jpg',
  catering: 'https://i.postimg.cc/sxYFyFJW/1795179314078-2.jpg',
  decor: 'https://i.postimg.cc/T3hkJMDx/1795178752922-2.jpg',
  tray: 'https://i.postimg.cc/X7YxnSxj/1795178952887-2.jpg',
  chops: 'https://i.postimg.cc/pXSQx9pk/1795179066155.jpg',
  chopsDisplay: 'https://i.postimg.cc/DySsC2Br/1795179223738.jpg',
  whiteCake: 'https://i.postimg.cc/vBST9nRk/1795179173049-2.jpg',
}

export const PRICES = {
  proteins: { beef: 800, fish: 1800, chicken: 2000 },
  jollof: {
    personalPlate: 2500,
    eventPlate: 2200,
    coolers: { medium: 45000, large: 85000, extraLarge: 160000 },
    buffetTray: 35000,
    buffetPlate: 250,
  },
  service: { delivery: 0, indoor: 60000, outdoor: 90000, server: 8000, cutleryGuest: 300 },
  egusi: { base: 7500, semo: 800, poundedYam: 1200 },
  smallChops: { puffPuff: 120, samosa: 400, springRoll: 400, mosa: 200, sausageRoll: 450, pepperedMeat: 400, packaging: 300, display: 250, server: 8000 },
  cake: {
    base: { '6': [18000, 32000, 45000], '8': [28000, 50000, 70000], '10': [40000, 72000, 100000], '12': [55000, 98000, 135000] },
    redVelvetLayer: 3000, fondantRate: 0.3, standardDecoration: 5000, premiumDecoration: 15000,
  },
  ponmo: { small: 12000, medium: 22000, large: 40000, extraBeef: 500 },
  decor: {
    backdrop: 120000, couple: 60000, aisle: 80000, balloons: 50000, fullHall: 350000,
    venue: { small: 1, medium: 1.5, large: 2.2 },
  },
  spaghetti: { base: 2800 },
  bucket: { beef: 700, fish: 1600, chicken: 1800, container: 2500 },
  cupcakes: { six: 9000, twelve: 17000, twentyFour: 32000, redVelvetPerSix: 500 },
  delivery: { pickup: 0, central: 2000, greater: 3500, event: 5000 },
  quick: [800, 9000, 900, 10000, 3000, 5500, 6000, 9500, 28000, 1500, 2800, 8000],
  training: { cake: 65000, chops: 40000, eventDecor: 75000 },
} as const

type Values = Record<string, string | number | boolean | number[] | string[] | null>
type ProductKey = 'jollof-personal' | 'jollof-event' | 'egusi' | 'chops-personal' | 'chops-event' | 'cake' | 'ponmo' | 'spaghetti' | 'bucket' | 'cupcakes' | 'decor'
type EventInfo = { id: string; name: string; type: string; date: string; time: string; venue: string; guests: number }
type CartLine = { id: string; key: ProductKey | 'quick'; name: string; image: string; summary: string; price: number; estimated: boolean; config: Values; event?: EventInfo; date?: string }
type QuickItem = { name: string; description: string; price: number; group: 'Snacks' | 'Trays' | 'Drinks'; icon: string }

const CATEGORIES = [
  { name: 'Food', description: 'Party jollof, egusi, spaghetti and more. For you or for your whole event.', image: IMAGES.jollof, filter: 'Food' },
  { name: 'Snacks & Small Chops', description: 'Puff puff, samosa, spring rolls and pastries. Personal packs or event orders.', image: IMAGES.chopsDisplay, filter: 'Snacks' },
  { name: 'Cakes', description: 'Custom cakes in 3 flavours, up to 3 layers, made for your theme.', image: IMAGES.flowerCake, filter: 'Cakes' },
  { name: 'Event Decoration', description: 'We transform halls into your dream venue.', image: IMAGES.decor, filter: 'Event Decoration' },
  { name: 'Food Trays', description: 'Hearty trays and pots ready to share. Delivered hot.', image: IMAGES.tray, filter: 'Trays' },
  { name: 'Drinks', description: "Himer's Relish tigernut drink, chilled and ready.", image: '', filter: 'Drinks' },
]

const defaultChops = [10, 3, 3, 3, 2, 4]
const PRODUCTS = [
  { key: 'jollof-personal' as const, name: 'Party Jollof Rice', category: 'Food', description: 'Smokey party jollof with fried plantain, made just for you.', image: IMAGES.ricePlates, price: PRICES.jollof.personalPlate, actions: ['Personal', 'Event'] },
  { key: 'cake' as const, name: 'Custom Celebration Cake', category: 'Cakes', description: 'A cake made for your moment, flavour and theme.', image: IMAGES.whiteCake, price: PRICES.cake.base['6'][0], actions: ['Customize'] },
  { key: 'egusi' as const, name: 'Egusi Soup Bowl, 1 Litre', category: 'Food', description: 'Rich homemade egusi with ponmo and stockfish.', image: '', price: PRICES.egusi.base + PRICES.proteins.beef * 2, actions: ['Customize'] },
  { key: 'chops-personal' as const, name: 'Small Chops Plate', category: 'Snacks', description: 'A generous mix of party favourites in a foil plate.', image: IMAGES.chops, price: PRICES.smallChops.packaging + defaultChops.reduce((sum, count, i) => sum + count * [PRICES.smallChops.puffPuff, PRICES.smallChops.samosa, PRICES.smallChops.springRoll, PRICES.smallChops.mosa, PRICES.smallChops.sausageRoll, PRICES.smallChops.pepperedMeat][i], 0), actions: ['Personal', 'Event'] },
  { key: 'ponmo' as const, name: 'Peppered Ponmo Pot', category: 'Trays', description: 'A shareable pot of rich, well-seasoned ponmo.', image: IMAGES.ponmo, price: PRICES.ponmo.small, actions: ['Customize'] },
  { key: 'spaghetti' as const, name: 'Stir-Fry Spaghetti', category: 'Food', description: 'Colourful stir-fry spaghetti with your choice of protein.', image: IMAGES.spaghetti, price: PRICES.spaghetti.base, actions: ['Customize'] },
  { key: 'bucket' as const, name: 'Fried Meat & Fish Bucket', category: 'Food', description: 'A golden, party-ready bucket of fried favourites.', image: IMAGES.bucket, price: PRICES.bucket.container + PRICES.bucket.beef * 20, actions: ['Customize'] },
  { key: 'cupcakes' as const, name: 'Cupcake Box', category: 'Cakes', description: 'Soft, beautifully finished cupcakes for sharing.', image: IMAGES.cupcakes, price: PRICES.cupcakes.six, actions: ['Customize'] },
]

const QUICK_ITEMS: QuickItem[] = [
  { name: 'Fish Pie', description: 'Freshly baked, each', price: PRICES.quick[0], group: 'Snacks', icon: '🥟' },
  { name: 'Fish Pie, dozen', description: '12 pieces', price: PRICES.quick[1], group: 'Snacks', icon: '🥟' },
  { name: 'Meat Pie', description: 'Freshly baked, each', price: PRICES.quick[2], group: 'Snacks', icon: '🥧' },
  { name: 'Meat Pie, dozen', description: '12 pieces', price: PRICES.quick[3], group: 'Snacks', icon: '🥧' },
  { name: 'Donuts, box of 6', description: 'A sweet treat to share', price: PRICES.quick[4], group: 'Snacks', icon: '🍩' },
  { name: 'Donuts, dozen', description: '12 freshly made donuts', price: PRICES.quick[5], group: 'Snacks', icon: '🍩' },
  { name: 'Puff Puff, 50 pieces', description: 'Golden, fluffy party favourite', price: PRICES.quick[6], group: 'Snacks', icon: '🍡' },
  { name: 'Signature Food Tray (fried rice, chips and sauce, gizzdodo, fried chicken), single', description: 'A complete, freshly prepared meal for one', price: PRICES.quick[7], group: 'Trays', icon: '🍱' },
  { name: 'Signature Food Tray, sharing size', description: 'Sharing size, serves 3 to 4 people', price: PRICES.quick[8], group: 'Trays', icon: '🍱' },
  { name: "Himer's Relish Tigernut Drink, 500ml", description: 'Chilled and ready to enjoy', price: PRICES.quick[9], group: 'Drinks', icon: '🥤' },
  { name: "Himer's Relish Tigernut Drink, 1 litre", description: 'Fresh tigernut drink to share', price: PRICES.quick[10], group: 'Drinks', icon: '🥤' },
  { name: "Himer's Relish Tigernut Drink, pack of 6 (500ml)", description: 'Six chilled bottles, ready to share', price: PRICES.quick[11], group: 'Drinks', icon: '🥤' },
]

const NAV_ITEMS = [
  ['Home', 'home'], ['Food', 'featured'], ['Snacks & Small Chops', 'featured'], ['Cakes', 'featured'],
  ['Event Decoration', 'decor-modal'], ['Food Trays', 'quick-orders'], ['Drinks', 'quick-orders'],
  ['Training', 'training'], ['About Us', 'about'], ['Reviews', 'reviews'], ['Contact', 'contact'],
]

const REVIEWS = [
  'Good evening ma, the jollof rice was the talk of the party. Everybody kept asking who cooked it. Thank you so much! 😍',
  'The cake came out exactly like the picture I sent. My daughter cried happy tears. God bless your hands. 🎂',
  'Delivery was on time and the small chops were still fresh. Please keep me for my next event.',
  'The decoration made our engagement hall look like a different place. Everyone was taking pictures. Thank you!',
  'I ordered fish pies for the whole week and they never disappointed. Always fresh.',
  'The egusi soup was just like homemade. Please I will be ordering again this weekend.',
]

const TRAINING = [
  { key: 'cake', name: 'Cake Baking & Decorating Masterclass', duration: '2 weekends', price: PRICES.training.cake, description: 'From batter to buttercream, fondant and decoration.' },
  { key: 'chops', name: 'Small Chops & Pastries Training', duration: '1 weekend', price: PRICES.training.chops, description: 'Puff puff, samosa, spring rolls, pies and more, ready to sell.' },
  { key: 'eventDecor', name: 'Event Decoration Training', duration: '2 weekends', price: PRICES.training.eventDecor, description: 'Backdrops, chairs, balloons and flowers. Transform any hall.' },
]

const formatMoney = (value: number) => `₦${Math.round(value).toLocaleString('en-NG')}`
const addDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const chopsNames = ['Puff Puff', 'Samosa', 'Spring Roll', 'Mosa', 'Sausage Roll', 'Peppered Meat']
const chopsPrices = [PRICES.smallChops.puffPuff, PRICES.smallChops.samosa, PRICES.smallChops.springRoll, PRICES.smallChops.mosa, PRICES.smallChops.sausageRoll, PRICES.smallChops.pepperedMeat]
const proteinNames = ['Beef', 'Fish', 'Chicken']
const proteinPrices = [PRICES.proteins.beef, PRICES.proteins.fish, PRICES.proteins.chicken]
const decorationNames = ['Backdrop and stage', "Couple's chairs and table dressing", 'Aisle and entrance decoration', 'Balloons and flowers', 'Full hall transformation']
const decorationPrices = [PRICES.decor.backdrop, PRICES.decor.couple, PRICES.decor.aisle, PRICES.decor.balloons, PRICES.decor.fullHall]

function initialConfig(key: ProductKey): Values {
  const base: Values = { quantity: 1, notes: '' }
  if (key === 'jollof-personal') return { ...base, proteins: [0, 0, 0] }
  if (key === 'jollof-event') return { ...base, eventName: '', eventType: 'Birthday', eventDate: addDays(7), eventTime: '', venue: '', guests: 100, serving: 'plates', plates: 100, coolers: [1, 0, 0], trays: 4, eventProteins: [0, 0, 0], service: 'delivery', servers: 0, cutlery: false, decoration: false, decorScopes: [], venueSize: 'small' }
  if (key === 'egusi') return { ...base, proteins: [2, 0, 0], swallow: 'None', swallowQty: 0, quantity: 1 }
  if (key === 'chops-personal') return { ...base, chops: defaultChops, quantity: 1 }
  if (key === 'chops-event') return { ...base, eventName: '', eventType: 'Birthday', eventDate: addDays(7), eventTime: '', venue: '', guests: 100, chops: defaultChops, quantity: 100, display: 'foil', servers: 0, event: true }
  if (key === 'cake') return { ...base, size: '6', layers: 1, flavours: ['Vanilla'], icingType: 'Buttercream', icingColour: 'White', customColour: '', icingFlavour: 'Vanilla', theme: 'Birthday', decoration: 'Simple', decorationDescription: '', message: '', date: addDays(3), quantity: 1 }
  if (key === 'ponmo') return { ...base, size: 'small', spice: 'Medium', extraBeef: 0, quantity: 1 }
  if (key === 'spaghetti') return { ...base, proteins: [1, 0, 0], quantity: 1 }
  if (key === 'bucket') return { ...base, proteins: [20, 0, 0], quantity: 1 }
  if (key === 'cupcakes') return { ...base, size: 'six', flavour: 'Vanilla', date: addDays(3), quantity: 1 }
  return { ...base, eventName: '', eventType: 'Birthday', eventDate: addDays(7), eventTime: '', venue: '', guests: 100, scopes: [], venueSize: 'small' }
}

function productPrice(key: ProductKey, config: Values): number {
  const quantity = Number(config.quantity || 1)
  const proteins = Array.isArray(config.proteins) ? config.proteins.map(Number) : [0, 0, 0]
  const eventProteins = Array.isArray(config.eventProteins) ? config.eventProteins.map(Number) : [0, 0, 0]
  const chops = Array.isArray(config.chops) ? config.chops.map(Number) : defaultChops
  const proteinCost = (items: number[]) => items.reduce((sum, count, index) => sum + count * proteinPrices[index], 0)
  if (key === 'jollof-personal') return (PRICES.jollof.personalPlate + proteinCost(proteins)) * quantity
  if (key === 'jollof-event') {
    const serving = String(config.serving || 'plates')
    let total = 0
    if (serving === 'plates') total = Number(config.plates || 0) * (PRICES.jollof.eventPlate + proteinCost(eventProteins))
    if (serving === 'coolers') {
      const coolerCounts = Array.isArray(config.coolers) ? config.coolers.map(Number) : [0, 0, 0]
      total = coolerCounts.reduce((sum, count, index) => sum + count * [PRICES.jollof.coolers.medium, PRICES.jollof.coolers.large, PRICES.jollof.coolers.extraLarge][index], 0) + proteinCost(eventProteins)
    }
    if (serving === 'buffet') total = Number(config.trays || 0) * PRICES.jollof.buffetTray + Number(config.guests || 0) * PRICES.jollof.buffetPlate + proteinCost(eventProteins)
    total += PRICES.service[String(config.service || 'delivery') as keyof typeof PRICES.service]
    total += Number(config.servers || 0) * PRICES.service.server
    if (config.cutlery) total += Number(config.guests || 0) * PRICES.service.cutleryGuest
    if (config.decoration) total += decorationPrice(config.decorScopes as number[] || [], String(config.venueSize || 'small'))
    return total
  }
  if (key === 'egusi') {
    const swallowPrice = config.swallow === 'Semo' ? PRICES.egusi.semo : config.swallow === 'Pounded yam' ? PRICES.egusi.poundedYam : 0
    return (PRICES.egusi.base + proteinCost(proteins) + swallowPrice * Number(config.swallowQty || 0)) * quantity
  }
  if (key === 'chops-personal' || key === 'chops-event') {
    const plate = PRICES.smallChops.packaging + chops.reduce((sum, count, i) => sum + count * chopsPrices[i], 0)
    return (plate + (config.display === 'display' ? PRICES.smallChops.display : 0)) * quantity + (key === 'chops-event' ? Number(config.servers || 0) * PRICES.smallChops.server : 0)
  }
  if (key === 'cake') {
    const size = String(config.size || '6') as keyof typeof PRICES.cake.base
    const layers = Number(config.layers || 1)
    const base = PRICES.cake.base[size][layers - 1]
    const flavours = Array.isArray(config.flavours) ? config.flavours : []
    const red = flavours.slice(0, layers).filter((flavour) => flavour === 'Red Velvet').length * PRICES.cake.redVelvetLayer
    const icing = config.icingType === 'Fondant' ? base * PRICES.cake.fondantRate : 0
    const decoration = config.decoration === 'Premium' ? PRICES.cake.premiumDecoration : config.decoration === 'Standard' ? PRICES.cake.standardDecoration : 0
    return (base + red + icing + decoration) * quantity
  }
  if (key === 'ponmo') return (PRICES.ponmo[String(config.size || 'small') as keyof typeof PRICES.ponmo] + Number(config.extraBeef || 0) * PRICES.ponmo.extraBeef) * quantity
  if (key === 'spaghetti') return (PRICES.spaghetti.base + proteinCost(proteins)) * quantity
  if (key === 'bucket') return (PRICES.bucket.container + proteins.reduce((sum, count, i) => sum + count * [PRICES.bucket.beef, PRICES.bucket.fish, PRICES.bucket.chicken][i], 0)) * quantity
  if (key === 'cupcakes') {
    const base = PRICES.cupcakes[String(config.size || 'six') as keyof typeof PRICES.cupcakes]
    const red = config.flavour === 'Red Velvet' ? Number(String(config.size || 'six') === 'six' ? 1 : String(config.size || 'six') === 'twelve' ? 2 : 4) * PRICES.cupcakes.redVelvetPerSix : 0
    return (base + red) * quantity
  }
  return decorationPrice(config.scopes as number[] || [], String(config.venueSize || 'small'))
}

function decorationPrice(scopes: number[], venue: string) {
  const amount = scopes.includes(4) ? PRICES.decor.fullHall : scopes.reduce((sum, i) => sum + decorationPrices[i], 0)
  return amount * PRICES.decor.venue[venue as keyof typeof PRICES.decor.venue]
}

function getSummary(key: ProductKey | 'quick', config: Values, name: string) {
  if (key === 'quick') return `${config.quantity} × ${name}; delivery ${String(config.date || '')}`
  if (key === 'jollof-personal') return `Personal, ${config.quantity} plates; ${proteinNames.map((p, i) => `${Number((config.proteins as number[])[i] || 0)} ${p.toLowerCase()}`).filter((p) => !p.startsWith('0 ')).join(', ') || 'no extra protein'}`
  if (key === 'jollof-event') return `${config.serving} service, ${config.serving === 'plates' ? `${config.plates} plates` : config.serving === 'coolers' ? 'coolers' : `${config.trays} buffet trays`}`
  if (key === 'egusi') return `${config.quantity} litre bowl(s), ${config.swallow || 'no swallow'}`
  if (key.startsWith('chops')) return `${config.quantity} pack(s), ${config.display === 'display' ? 'display trays' : 'tin foil packs'}`
  if (key === 'cake') return `${config.size}" cake, ${config.layers} layer(s), ${config.flavours?.toString?.() || 'Vanilla'}, ${config.icingType}`
  if (key === 'ponmo') return `${config.size} pot, ${config.spice} spice, ${config.quantity} pot(s)`
  if (key === 'spaghetti') return `${config.quantity} plate(s), stir-fry spaghetti`
  if (key === 'bucket') return `${config.quantity} bucket(s), ${(config.proteins as number[]).reduce((a, b) => a + b, 0)} pieces`
  if (key === 'cupcakes') return `${config.size} box, ${config.flavour}, ${config.quantity} box(es)`
  return `${(config.scopes as number[]).map((i) => decorationNames[i]).join(', ')}, ${config.venueSize} venue`
}

function imageFallback(event: ChangeEvent<HTMLImageElement>) {
  event.currentTarget.style.display = 'none'
}

function App() {
  const [cart, setCart] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem('himer-cart') || '[]') as CartLine[] } catch { return [] }
  })
  const [events, setEvents] = useState<EventInfo[]>(() => {
    try { return JSON.parse(localStorage.getItem('himer-events') || '[]') as EventInfo[] } catch { return [] }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [thanks, setThanks] = useState(false)
  const [modalKey, setModalKey] = useState<ProductKey | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalConfig, setModalConfig] = useState<Values>({})
  const [modalStep, setModalStep] = useState(1)
  const [filter, setFilter] = useState('All')
  const [quickFilter, setQuickFilter] = useState('All')
  const [quickQuantities, setQuickQuantities] = useState<number[]>(QUICK_ITEMS.map(() => 1))
  const [quickDateIndex, setQuickDateIndex] = useState<number | null>(null)
  const [quickDate, setQuickDate] = useState(addDays(1))
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [reviewPaused, setReviewPaused] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', method: 'Pickup', area: 'central', address: '', date: addDays(1), time: '', notes: '' })
  const reviewTouch = useRef(0)

  useEffect(() => {
    try { localStorage.setItem('himer-cart', JSON.stringify(cart)) } catch { setToast('Cart storage is unavailable in this browser.') }
  }, [cart])
  useEffect(() => {
    try { localStorage.setItem('himer-events', JSON.stringify(events)) } catch { setToast('Saved events are unavailable in this browser.') }
  }, [events])
  useEffect(() => {
    if (modalKey || cartOpen || menuOpen || quickDateIndex !== null) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [modalKey, cartOpen, menuOpen, quickDateIndex])
  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(''), 2600)
      return () => window.clearTimeout(timer)
    }
  }, [toast])
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 550)
    return () => window.clearTimeout(timer)
  }, [])
  useEffect(() => {
    if (reviewPaused) return
    const timer = window.setInterval(() => setReviewIndex((index) => (index + 1) % REVIEWS.length), 5000)
    return () => window.clearInterval(timer)
  }, [reviewPaused])
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('fade-up'); observer.unobserve(entry.target) }
    }), { threshold: 0.08 })
    document.querySelectorAll('.reveal').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const cartCount = cart.reduce((sum, line) => sum + Number(line.config.quantity || 1), 0)
  const subtotal = cart.reduce((sum, line) => sum + line.price, 0)
  const hasEventItems = cart.some((line) => line.estimated)
  const deliveryFee = form.method === 'Pickup' ? 0 : form.area === 'event' ? PRICES.delivery.event : form.area === 'greater' ? PRICES.delivery.greater : PRICES.delivery.central
  const checkoutLeadDate = addDays(hasEventItems ? 7 : cart.some((line) => line.key === 'cake' || line.key === 'cupcakes') ? 3 : 1)
  const checkoutMinDate = cart.reduce((minimum, line) => {
    const lineDate = line.event?.date || line.date
    return lineDate && lineDate > minimum ? lineDate : minimum
  }, checkoutLeadDate)
  const visibleProducts = useMemo(() => filter === 'All' ? PRODUCTS : PRODUCTS.filter((product) => product.category === filter), [filter])
  const visibleQuick = useMemo(() => quickFilter === 'All' ? QUICK_ITEMS.map((item, index) => ({ item, index })) : QUICK_ITEMS.map((item, index) => ({ item, index })).filter(({ item }) => item.group === quickFilter), [quickFilter])
  const modalPrice = modalKey ? productPrice(modalKey, modalConfig) : 0
  const stepsCount = modalKey === 'jollof-event' ? 6 : modalKey === 'chops-event' ? 5 : modalKey === 'cake' ? 6 : modalKey === 'decor' ? 4 : 1

  function openProduct(key: ProductKey, mode?: string, line?: CartLine) {
    const actualKey = mode === 'Event' && key === 'jollof-personal' ? 'jollof-event' : mode === 'Event' && key === 'chops-personal' ? 'chops-event' : key
    setEditingId(line?.id || null)
    setModalKey(actualKey)
    setModalStep(1)
    setModalConfig(line ? { ...line.config } : initialConfig(actualKey))
    setMenuOpen(false)
  }
  function closeModal() { setModalKey(null); setEditingId(null) }
  function updateConfig(name: string, value: Values[string]) { setModalConfig((current) => ({ ...current, [name]: value })) }
  function updateArray(name: string, index: number, value: number | string) {
    const current = Array.isArray(modalConfig[name]) ? [...modalConfig[name] as (number | string)[]] : []
    if (modalKey === 'jollof-personal' && name === 'proteins' && typeof value === 'number') {
      const currentTotal = current.reduce<number>((sum, item) => sum + Number(item || 0), 0)
      if (value > Number(current[index] || 0) && currentTotal >= 4) return
    }
    current[index] = value
    updateConfig(name, current as number[] | string[])
  }
  function saveModal() {
    if (!modalKey) return
    if (modalKey === 'bucket' && (modalConfig.proteins as number[]).reduce((a, b) => a + b, 0) < 20) {
      setToast('Please choose at least 20 pieces for your bucket.')
      return
    }
    if ((modalKey === 'cake' || modalKey === 'cupcakes') && String(modalConfig.date || '') < addDays(3)) {
      setToast('Please choose a delivery date at least three days from today.')
      return
    }
    if ((modalKey === 'jollof-event' || modalKey === 'chops-event' || modalKey === 'decor') && !modalConfig.eventName) {
      setToast('Please add your event name before continuing.')
      setModalStep(1)
      return
    }
    const isEvent = modalKey === 'jollof-event' || modalKey === 'chops-event' || modalKey === 'decor'
    const existingLine = editingId ? cart.find((line) => line.id === editingId) : undefined
    const newEvent: EventInfo | undefined = isEvent ? {
      id: String(modalConfig.eventId || existingLine?.event?.id || crypto.randomUUID()),
      name: String(modalConfig.eventName || ''),
      type: String(modalConfig.eventType || 'Event'),
      date: String(modalConfig.eventDate || addDays(7)),
      time: String(modalConfig.eventTime || ''),
      venue: String(modalConfig.venue || ''),
      guests: Number(modalConfig.guests || 0),
    } : undefined
    if (newEvent) setEvents((current) => current.some((event) => event.id === newEvent.id) ? current.map((event) => event.id === newEvent.id ? newEvent : event) : [...current, newEvent])
    const name = PRODUCTS.find((product) => product.key === (modalKey === 'jollof-event' ? 'jollof-personal' : modalKey === 'chops-event' ? 'chops-personal' : modalKey))?.name || 'Event Decoration'
    const nextConfig: Values = newEvent ? { ...modalConfig, eventId: newEvent.id } : { ...modalConfig }
    const nextLine: CartLine = {
      id: editingId || crypto.randomUUID(), key: modalKey, name, image: PRODUCTS.find((product) => product.key === modalKey || (modalKey === 'jollof-event' && product.key === 'jollof-personal') || (modalKey === 'chops-event' && product.key === 'chops-personal'))?.image || IMAGES.decor,
      summary: getSummary(modalKey, nextConfig, name), price: productPrice(modalKey, nextConfig), estimated: isEvent, config: nextConfig, event: newEvent,
      date: isEvent ? undefined : String(nextConfig.date || '') || undefined,
    }
    setCart((current) => editingId ? current.map((line) => line.id === editingId ? nextLine : line) : [...current, nextLine])
    closeModal()
    setToast('Added to your cart')
  }
  function changeQuantity(lineId: string, quantity: number) {
    setCart((current) => current.map((line) => {
      if (line.id !== lineId) return line
      const config = { ...line.config, quantity: Math.max(1, quantity) }
      return { ...line, config, summary: line.key === 'quick' ? getSummary('quick', config, line.name) : line.summary, price: line.key === 'quick' ? (line.config.unitPrice as number) * Math.max(1, quantity) : productPrice(line.key as ProductKey, config) }
    }))
  }
  function addQuick(index: number) {
    setQuickDateIndex(index)
    setQuickDate(addDays(1))
  }
  function confirmQuick() {
    if (quickDateIndex === null) return
    if (quickDate < addDays(1)) {
      setToast('Choose a delivery date at least one day from today.')
      return
    }
    const item = QUICK_ITEMS[quickDateIndex]
    const quantity = quickQuantities[quickDateIndex]
    const config: Values = { quantity, date: quickDate, unitPrice: item.price }
    setCart((current) => [...current, { id: crypto.randomUUID(), key: 'quick', name: item.name, image: '', summary: getSummary('quick', config, item.name), price: item.price * quantity, estimated: false, config, date: quickDate }])
    setQuickDateIndex(null)
    setToast('Added to your cart')
  }
  function setFilterAndScroll(name: string, target = 'featured') {
    if (name === 'Drinks') { setQuickFilter(name); document.getElementById('quick-orders')?.scrollIntoView({ behavior: 'smooth' }) }
    else if (name === 'Trays') { setFilter(name); setQuickFilter(name); document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }) }
    else { setFilter(name); document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }) }
    setMenuOpen(false)
  }
  function activateNav(label: string, id: string) {
    if (id === 'decor-modal') openProduct('decor')
    else if (id === 'featured') setFilterAndScroll(label === 'Snacks & Small Chops' ? 'Snacks' : label)
    else if (id === 'quick-orders') setFilterAndScroll(label === 'Food Trays' ? 'Trays' : label, 'quick-orders')
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }
  function createWhatsAppOrder() {
    const groups = new Map<string, CartLine[]>()
    cart.forEach((line) => {
      const label = line.event ? line.event.id : 'Personal Orders'
      groups.set(label, [...(groups.get(label) || []), line])
    })
    const orderLines = Array.from(groups.entries()).map(([, lines]) => {
      const event = lines[0].event
      const heading = event ? `Event: ${event.name} (${event.date}, ${event.venue}, ${event.guests} guests)` : 'Personal Orders'
      return `${heading}\n${lines.map((line, i) => `${i + 1}. ${line.name} - ${line.summary} - ${formatMoney(line.price)}${line.estimated ? ' (Estimated)' : ''}`).join('\n')}`
    }).join('\n\n')
    const message = `Hello Himer Cakes & More! I would like to place an order.\n\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n*Delivery:* ${form.method} - ${form.method === 'Pickup' ? 'Pickup from Himer Cakes & More' : form.area === 'greater' ? 'Greater Osogbo (outskirts)' : form.area === 'event' ? 'Event delivery' : 'Central Osogbo'}\n*Address:* ${form.address || 'Osogbo, Osun State'}\n*Date and time:* ${form.date} at ${form.time}\n\n*ORDER*\n${orderLines}\n\n*Subtotal:* ${formatMoney(subtotal)}\n*Delivery:* ${formatMoney(deliveryFee)}\n*${hasEventItems ? 'Estimated total' : 'Total'}:* ${formatMoney(subtotal + deliveryFee)}${hasEventItems ? ' (Estimated)' : ''}\n\n*Notes:* ${form.notes}\n\nPlease confirm availability and payment details. Thank you!`
    window.open(`https://wa.me/2348067111059?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setThanks(true)
    setCheckout(false)
  }
  function startNewOrder() {
    setCart([])
    setCartOpen(false)
    setCheckout(false)
    setThanks(false)
    setForm({ name: '', phone: '', method: 'Pickup', area: 'central', address: '', date: addDays(1), time: '', notes: '' })
  }
  function beginCheckout() {
    setForm((current) => ({ ...current, date: current.date < checkoutMinDate ? checkoutMinDate : current.date }))
    setCheckout(true)
  }

  const setFormField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const modalTitle = modalKey ? PRODUCTS.find((product) => product.key === modalKey || (modalKey === 'jollof-event' && product.key === 'jollof-personal') || (modalKey === 'chops-event' && product.key === 'chops-personal'))?.name || 'Event Decoration' : ''
  const productModalRef = useRef<typeof ProductModal | null>(null)
  if (!productModalRef.current) productModalRef.current = ProductModal
  const ProductModalComponent = productModalRef.current

  return (
    <div>
      {loading && <div className="loading-screen" role="status" aria-label="Loading Himer Cakes & More"><img src={IMAGES.logo} alt="" onError={imageFallback} /><span>Himer Cakes <b>&amp; More</b></span><i /></div>}
      <div className="announcement">Open 24 hours <span>•</span> Delivery within Osogbo, Osun State <span className="announcement-spark">✦</span></div>
      <header className="site-header">
        <div className="header-inner">
          <button className="icon-btn menu-trigger" aria-label="Open menu" onClick={() => setMenuOpen(true)}><span className="hamburger"><i /><i /><i /></span></button>
          <a className="brand" href="#home" aria-label="Himer Cakes & More home"><img src={IMAGES.logo} alt="Himer Cakes & More logo" onError={imageFallback} /><span>Himer Cakes <b>&amp; More</b></span></a>
          <div className="header-actions">
            <a className="phone-link" href="tel:+2348067111059" aria-label="Call Himer Cakes & More"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H4.8A1.8 1.8 0 0 0 3 4.8C3 13.7 10.3 21 19.2 21a1.8 1.8 0 0 0 1.8-1.8V17l-5-1.2-1.1 2.2a15 15 0 0 1-7.1-7.1L10 9.8 8.8 4H7z" /></svg><span>Call us</span></a>
            <button className="icon-btn cart-trigger" onClick={() => { setCartOpen(true); setCheckout(false) }} aria-label={`Open cart, ${cartCount} items`}><svg className="bag-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg><span className="cart-count">{cartCount}</span></button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home" style={{ backgroundImage: `linear-gradient(90deg, rgba(42,5,14,.91) 0%, rgba(62,10,20,.78) 52%, rgba(62,10,20,.42) 100%), url("${IMAGES.jollof}")` }}>
          <div className="hero-content">
            <div className="eyebrow"><span /> Osogbo's Caterer, Baker &amp; Event Decorator</div>
            <h1>Delicious Food.<br /><em>Beautiful Cakes.</em><br />Unforgettable Events.</h1>
            <p>From smokey party jollof and small chops to custom cakes, food trays and full event decoration, we handle everything for your celebration in Osogbo. However you want it, we get you.</p>
            <div className="hero-buttons"><button className="btn btn-gold" onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}>Order Now <span>↗</span></button><button className="btn btn-outline-light" onClick={() => openProduct('jollof-event')}>Plan My Event <span>↗</span></button></div>
            <div className="hero-pills">{['Event Decoration', 'Indoor & Outdoor Catering', 'Personal Lunch Packs', 'Food Trays', 'Snacks & Small Chops'].map((tag) => <span key={tag}>{tag}</span>)}</div>
          </div>
          <div className="hero-stamp"><span>Made with</span><b>♡</b><span>in Osogbo</span></div>
          <span className="hero-scroll">SCROLL TO DISCOVER <b>↓</b></span>
        </section>

        <section className="stats-strip">
          {[['24/7', 'Open 24 hours', 'Order anytime'], ['✳', 'Indoor & Outdoor', 'Catering for any event'], ['45', '45 fish pies a day', 'A real six-day order'], ['⌖', 'Osogbo Delivery', 'Fresh to your door']].map(([icon, title, sub]) => <div className="stat" key={title}><b className="stat-icon">{icon}</b><span><strong>{title}</strong><small>{sub}</small></span></div>)}
        </section>

        <section className="section categories-section reveal" id="categories">
          <div className="section-heading centered"><span className="overline">A LITTLE SOMETHING FOR EVERY OCCASION</span><h2>What are you <em>celebrating?</em></h2><p>Personal orders and bulk orders for events, with custom tailoring based on your event.</p></div>
          <div className="category-grid">{CATEGORIES.map((category, index) => <button className={`category-card ${!category.image ? 'category-drinks' : ''}`} key={category.name} style={category.image ? { backgroundImage: `linear-gradient(180deg,rgba(22,5,8,.03) 15%,rgba(28,6,11,.85) 100%),url("${category.image}")` } : undefined} onClick={() => category.name === 'Event Decoration' ? openProduct('decor') : setFilterAndScroll(category.filter, category.filter === 'Drinks' ? 'quick-orders' : 'featured')} aria-label={`Explore ${category.name}`}><span className="category-mark">{category.image ? String(index + 1).padStart(2, '0') : '♧'}</span><span className="category-copy"><strong>{category.name}</strong><small>{category.description}</small></span><span className="circle-arrow">→</span></button>)}</div>
          <p className="under-note"><span>✦</span> Made fresh. Made with love. Made just for you.</p>
          {/* Later, each card will link to its own category page. */}
        </section>

        <section className="catering-band reveal">
          <div className="catering-image"><img src={IMAGES.catering} alt="Rice, meat, egg and stew served in catering trays" loading="lazy" onError={imageFallback} /><span className="image-label">YOUR DAY, BEAUTIFULLY SERVED</span></div>
          <div className="catering-copy"><span className="overline">THE TABLE IS YOURS</span><h2>Catering that fits<br /><em>your event</em></h2><p>Whether it is an engagement, wedding, birthday, convocation or seminar, we serve indoors or outdoors. Choose rice in plates, coolers or buffet trays, pick your proteins, and add servers and decoration in one simple order.</p><button className="btn btn-gold" onClick={() => openProduct('jollof-event')}>Plan My Event <span>↗</span></button><small className="sub-brand-note">Thoughtfully styled by Himer Events Decor.</small><span className="band-mark">H</span></div>
        </section>

        <section className="section featured-section reveal" id="featured">
          <div className="section-heading section-heading-row"><div><span className="overline">FRESH FROM OUR KITCHEN</span><h2>Customer <em>Favourites</em></h2><p>Customize any order and watch the price update as you go.</p></div><span className="section-number">01 <i>/ MENU</i></span></div>
          <div className="filter-row">{['All', 'Food', 'Snacks', 'Cakes', 'Trays', 'Drinks'].map((name) => <button className={`filter-chip ${filter === name ? 'active' : ''}`} key={name} onClick={() => { if (name === 'Drinks') { setQuickFilter('Drinks'); document.getElementById('quick-orders')?.scrollIntoView({ behavior: 'smooth' }) } else setFilter(name) }}>{name}<span>{name === 'All' ? '08' : name === 'Food' ? '03' : name === 'Snacks' ? '01' : name === 'Cakes' ? '02' : name === 'Trays' ? '01' : '↗'}</span></button>)}</div>
          <div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.name}>
            <div className={`product-image ${product.image ? '' : 'image-gradient'}`}>{product.image ? <img src={product.image} alt={product.name} loading="lazy" onError={imageFallback} /> : <div className="gradient-icon">◉</div>}<span className="product-category">{product.category}</span><span className="image-corner">H.</span></div>
            <div className="product-info"><div className="product-title"><h3>{product.name}</h3><span className="product-price">From {formatMoney(product.price)}</span></div><p>{product.description}</p><div className={`product-actions ${product.actions.length > 1 ? 'split-actions' : ''}`}>{product.actions.map((action) => <button key={action} className={action === 'Event' ? 'product-action secondary-action' : 'product-action'} onClick={() => openProduct(product.key, action)}>{action === 'Customize' ? 'Customize' : action}<span>↗</span></button>)}</div></div>
          </article>)}</div>
          {visibleProducts.length === 0 && <div className="empty-filter"><span>✦</span><p>A little something delicious is waiting for you.</p><button className="text-button" onClick={() => setFilter('All')}>See all favourites →</button></div>}
          <div className="menu-footer-note">CRAFTED WITH CARE <span>•</span> SERVED WITH LOVE <span>•</span> FROM OSOGBO</div>
        </section>

        <section className="quick-section reveal" id="quick-orders">
          <div className="section quick-inner">
            <div className="quick-heading"><div><span className="overline">SOMETHING FOR THE ROAD</span><h2>Quick Orders:<br /><em>Pastries, Drinks and Trays</em></h2></div><p>Little cravings, big gatherings, handled.</p></div>
            <div className="fish-pie-note"><span className="note-icon">✳</span><p>A client once ordered 45 fish pies a day for six days. Order yours by the dozen, pick your delivery date, done.</p><span className="note-spark">✦</span></div>
            <div className="quick-filter-row">{['All', 'Snacks', 'Trays', 'Drinks'].map((name) => <button className={`quick-filter ${quickFilter === name ? 'active' : ''}`} key={name} onClick={() => setQuickFilter(name)}>{name}</button>)}</div>
            <div className="quick-list">{visibleQuick.map(({ item, index }) => <article className="quick-item" key={item.name}>
              <span className="quick-icon">{item.icon}</span><div className="quick-details"><strong>{item.name}</strong><small>{item.description}</small></div><strong className="quick-price">{formatMoney(item.price)}</strong>
              <div className="stepper quick-stepper"><button aria-label={`Decrease ${item.name} quantity`} onClick={() => setQuickQuantities((values) => values.map((value, i) => i === index ? Math.max(1, value - 1) : value))}>−</button><span>{quickQuantities[index]}</span><button aria-label={`Increase ${item.name} quantity`} onClick={() => setQuickQuantities((values) => values.map((value, i) => i === index ? value + 1 : value))}>+</button></div>
              <button className="quick-add" onClick={() => addQuick(index)}>Add <span>+</span></button>
            </article>)}</div>
            <p className="delivery-caption">Freshly prepared, with delivery within Osogbo, Osun State only.</p>
          </div>
        </section>

        <section className="section reviews-section reveal" id="reviews">
          <div className="section-heading centered"><span className="overline">A NOTE FROM THE PEOPLE WE SERVE</span><h2>Kind Words from <em>Happy Customers</em></h2><p>Some messages just stay with you.</p></div>
          <div className="review-wrap" onTouchStart={(event) => { reviewTouch.current = event.touches[0].clientX; setReviewPaused(true) }} onTouchEnd={(event) => { const move = reviewTouch.current - event.changedTouches[0].clientX; if (Math.abs(move) > 40) setReviewIndex((index) => (index + (move > 0 ? 1 : REVIEWS.length - 1)) % REVIEWS.length); window.setTimeout(() => setReviewPaused(false), 3500) }} onMouseEnter={() => setReviewPaused(true)} onMouseLeave={() => setReviewPaused(false)}>
            <span className="review-quote">“</span><div className="chat-card"><div className="chat-header"><span className="chat-avatar">H</span><span><b>Customer chat</b><small>WhatsApp conversation</small></span><b className="chat-status">●</b></div><p>{REVIEWS[reviewIndex]}</p><small className="chat-time">Delivered with love <span>✓✓</span></small></div><button className="review-arrow previous" aria-label="Previous review" onClick={() => setReviewIndex((reviewIndex + REVIEWS.length - 1) % REVIEWS.length)}>←</button><button className="review-arrow next" aria-label="Next review" onClick={() => setReviewIndex((reviewIndex + 1) % REVIEWS.length)}>→</button>
          </div>
          <div className="review-dots">{REVIEWS.map((review, index) => <button key={review} aria-label={`Show review ${index + 1}`} className={reviewIndex === index ? 'active' : ''} onClick={() => setReviewIndex(index)} />)}</div><p className="real-chats">Real chats from real customers.</p>
        </section>

        <section className="about-section reveal" id="about">
          <div className="about-image"><img src={IMAGES.chef} alt="The Face Behind the Brand, Himer Cakes & More" loading="lazy" onError={imageFallback} /><span className="about-photo-caption">THE HANDS &amp; HEART BEHIND IT ALL</span><span className="about-ornament">✳</span></div>
          <div className="about-copy"><span className="overline">A LITTLE ABOUT US</span><h2>The Face Behind<br /><em>the Brand</em></h2><p>Himer Cakes &amp; More began with a simple love for feeding people well and making every celebration feel special. From the first pot of jollof to full event decoration, every order is prepared with care, patience and attention to detail. When you order from us, you are not just getting food. You are getting someone who wants your day to be perfect.</p><div className="mission-grid"><article><span>01 / OUR MISSION</span><p>To make every meal and every celebration feel special, with fresh food, beautiful decoration and service you can trust.</p></article><article><span>02 / OUR VISION</span><p>To be the first name Osun State thinks of for events, cakes and catering.</p></article></div><span className="signature">Made with love, always <b>♡</b></span></div>
        </section>

        <section className="training-section reveal" id="training">
          <div className="section training-inner"><div className="training-heading"><span className="overline">PASS THE GOODNESS ON</span><h2>Learn the <em>Craft</em></h2><p>Trainings are available. Learn from the hands behind Himer Cakes &amp; More.</p><span className="training-flower">✳</span></div><div className="training-grid">{TRAINING.map((course, index) => <article className="training-card" key={course.key}><span className="training-index">0{index + 1} <i>/ TRAINING</i></span><div className="training-icon">{['♧', '✿', '✳'][index]}</div><h3>{course.name}</h3><span className="training-duration">{course.duration}</span><p>{course.description}</p><strong className="training-price">{formatMoney(course.price)}</strong><a className="btn whatsapp-btn" href={`https://wa.me/2348067111059?text=${encodeURIComponent(`Hello Himer Cakes & More, I would like to register for the ${course.name} training.`)}`} target="_blank" rel="noreferrer">Register on WhatsApp <span>↗</span></a></article>)}</div><p className="training-note">Private and group trainings available.</p></div>
        </section>
      </main>

      <footer className="footer" id="contact"><div className="footer-main">
        <div className="footer-brand"><img src={IMAGES.logo} alt="Himer Cakes & More logo" loading="lazy" onError={imageFallback} /><strong>Himer Cakes &amp; More</strong><p>However you want it, we get you.</p><span className="footer-social">✦ &nbsp; @himer_cakes_n_more</span></div>
        <div className="footer-links"><h3>Explore</h3>{NAV_ITEMS.map(([label, id]) => <button key={label} onClick={() => activateNav(label, id)}>{label} <span>↗</span></button>)}</div>
        <div className="footer-contact"><h3>Come say hello</h3><a href="tel:+2348067111059">+234 806 711 1059</a><a href="https://wa.me/2348067111059" target="_blank" rel="noreferrer">WhatsApp us anytime ↗</a><a href="https://instagram.com/himer_cakes_n_more" target="_blank" rel="noreferrer">@himer_cakes_n_more ↗</a><p>Osogbo, Osun State<br />Open 24 hours</p><p className="footer-delivery">Delivery available within Osogbo, Osun State only.</p></div>
      </div><div className="footer-bottom"><span>© 2026 Himer Cakes &amp; More. All rights reserved.</span><span>BAKED WITH CARE IN OSOGBO <b>✳</b></span></div></footer>

      {!modalKey && !cartOpen && !menuOpen && quickDateIndex === null && <a className="floating-whatsapp" href="https://wa.me/2348067111059?text=Hello%20Himer%20Cakes%20%26%20More%2C%20I%20would%20like%20to%20make%20an%20enquiry." target="_blank" rel="noreferrer" aria-label="Chat with Himer Cakes & More on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20.4l1.3-4.9A8.4 8.4 0 1 1 20.5 11.7Z" /><path d="M9 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.3 0 .5-.2.7l-.5.6c-.2.2-.2.4 0 .7.5.8 1.2 1.5 2 2 .3.2.5.2.7 0l.7-.8c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.2-.7 1.6-.5.5-1.1.7-1.8.6-1.1-.1-2.7-.8-4.2-2.2-1.2-1.1-2.1-2.6-2.3-3.7-.2-.9.1-1.6.6-2.3.3-.3.6-.5.8-.5Z" /></svg></a>}

      {menuOpen && <div className="overlay menu-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false) }}><nav className="side-menu"><div className="menu-top"><span>TAKE A LOOK AROUND</span><button className="close-btn light-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>×</button></div><a className="menu-brand" href="#home" onClick={() => setMenuOpen(false)}><img src={IMAGES.logo} alt="" onError={imageFallback} /><span>Himer Cakes <b>&amp; More</b></span></a><div className="menu-nav">{NAV_ITEMS.map(([label, id], index) => <button key={label} onClick={() => activateNav(label, id)}><span>{String(index + 1).padStart(2, '0')}</span>{label}<b>↗</b></button>)}</div><div className="menu-bottom"><a className="btn whatsapp-btn" href="https://wa.me/2348067111059" target="_blank" rel="noreferrer">◔ &nbsp; Chat on WhatsApp</a><a href="tel:+2348067111059">+234 806 711 1059</a><a href="https://instagram.com/himer_cakes_n_more" target="_blank" rel="noreferrer">@himer_cakes_n_more ↗</a><p>Osogbo, Osun State<br />Open 24 hours</p></div></nav></div>}

      {modalKey && <ProductModalComponent key={`${modalKey}-${editingId || 'new'}`} modalKey={modalKey} title={modalTitle} config={modalConfig} step={modalStep} stepsCount={stepsCount} price={modalPrice} events={events} update={updateConfig} updateArray={updateArray} setStep={setModalStep} close={closeModal} save={saveModal} setToast={setToast} />}

      {cartOpen && <div className="overlay drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false) }}><aside className="cart-drawer">
        <div className="drawer-header"><div><span className="overline">YOUR ORDER, YOUR WAY</span><h2>{thanks ? 'Thank you!' : checkout ? 'Checkout' : 'Your Cart'}</h2><small>{!thanks && !checkout ? `${cartCount} ${cartCount === 1 ? 'item' : 'items'} in your bag` : ''}</small></div><button className="close-btn" aria-label="Close cart" onClick={() => setCartOpen(false)}>×</button></div>
        {thanks ? <div className="thankyou-state"><span className="thankyou-icon">✓</span><h3>Your order is ready on WhatsApp.</h3><p>Send the message to confirm with us.</p><button className="btn btn-primary" onClick={startNewOrder}>Start a new order</button></div> : checkout ? <CheckoutForm form={form} setField={setFormField} areaFee={deliveryFee} subtotal={subtotal} estimated={hasEventItems} minDate={checkoutMinDate} back={() => setCheckout(false)} placeOrder={createWhatsAppOrder} /> : cart.length === 0 ? <div className="cart-empty"><span>✳</span><h3>Your next favourite is waiting.</h3><p>Take a look around and find something made just for you.</p><button className="btn btn-primary" onClick={() => { setCartOpen(false); document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }) }}>Browse the menu <span>↗</span></button></div> : <CartContents cart={cart} setCart={setCart} subtotal={subtotal} hasEventItems={hasEventItems} editLine={(line) => { setCartOpen(false); if (line.key !== 'quick') openProduct(line.key as ProductKey, undefined, line) }} removeLine={(id) => setCart((items) => items.filter((line) => line.id !== id))} startCheckout={beginCheckout} changeQuantity={changeQuantity} />}
      </aside></div>}

      {quickDateIndex !== null && <div className="overlay modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setQuickDateIndex(null) }}><div className="quick-date-modal"><button className="close-btn" onClick={() => setQuickDateIndex(null)} aria-label="Close date picker">×</button><span className="overline">ONE LAST THING</span><h2>When would you like it?</h2><p>Choose your expected delivery date. Quick orders need at least one day's notice.</p><label className="field-label">Expected delivery date <small>Available from {addDays(1)}</small><input type="date" min={addDays(1)} value={quickDate} onChange={(event) => setQuickDate(event.target.value)} /></label><div className="date-modal-total"><span>{QUICK_ITEMS[quickDateIndex].name} · {quickQuantities[quickDateIndex]} item(s)</span><b>{formatMoney(QUICK_ITEMS[quickDateIndex].price * quickQuantities[quickDateIndex])}</b></div><button className="btn btn-gold full-button" onClick={confirmQuick}>Add to Cart · {formatMoney(QUICK_ITEMS[quickDateIndex].price * quickQuantities[quickDateIndex])}</button></div></div>}

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  )

  function ProductModal(props: { modalKey: ProductKey; title: string; config: Values; step: number; stepsCount: number; price: number; events: EventInfo[]; update: (name: string, value: Values[string]) => void; updateArray: (name: string, index: number, value: number | string) => void; setStep: (step: number) => void; close: () => void; save: () => void; setToast: (message: string) => void }) {
    const { modalKey: key, title, config, step, stepsCount: count, price, events: savedEvents, update: setValue, updateArray: setArr, setStep: toStep, close, save, setToast: toastMessage } = props
    const eventMode = key === 'jollof-event' || key === 'chops-event' || key === 'decor'
    const isWizard = count > 1
    const isReview = (key === 'jollof-event' && step === 6) || (key === 'chops-event' && step === 5) || (key === 'cake' && step === 6) || (key === 'decor' && step === 4)
    const [imageName, setImageName] = useState('')
    const updateEvent = (field: string, value: string | number) => setValue(field, value)
    function chooseSaved(eventId: string) {
      if (!eventId) { setValue('eventId', ''); return }
      const event = savedEvents.find((item) => item.id === eventId)
      if (event) { setValue('eventId', event.id); setValue('eventName', event.name); setValue('eventType', event.type); setValue('eventDate', event.date); setValue('eventTime', event.time); setValue('venue', event.venue); setValue('guests', event.guests); toStep(2) }
    }
    function validateNext() {
      if ((key === 'jollof-event' || key === 'chops-event' || key === 'decor') && step === 1 && !config.eventId && (!config.eventName || !config.eventDate || !config.eventTime || !config.venue || !config.guests)) { toastMessage('Please complete your event name, date, time, venue and guest count.'); return }
      if ((key === 'jollof-event' || key === 'chops-event' || key === 'decor') && step === 1 && !config.eventId && String(config.eventDate) < addDays(7)) { toastMessage('Please choose an event date at least seven days from today.'); return }
      if (key === 'cake' && step === 4 && !config.theme) { toastMessage('Please choose an event or theme.'); return }
      if (key === 'cake' && step === 5 && (!config.date || String(config.date) < addDays(3))) { toastMessage('Please choose a delivery date at least three days from today.'); return }
      if (step < count) toStep(step + 1)
      else save()
    }
    function goBack() { if (step > 1) toStep(step - 1); else close() }
    const eventStepOne = <><SavedEventSelector events={savedEvents} value={String(config.eventId || '')} onChange={chooseSaved} /><div className="field-grid"><Field label="Event name" hint="Give your event a name to find it again later." value={String(config.eventName || '')} onChange={(value) => updateEvent('eventName', value)} placeholder="e.g. Tunde and Bisi's Engagement" /><Field label="Event type" hint="What are we celebrating?" value={String(config.eventType || 'Birthday')} onChange={(value) => updateEvent('eventType', value)} options={['Birthday', 'Wedding', 'Engagement', 'Burial', 'Naming', 'Corporate', 'Other']} /><Field label="Event date" hint="Event orders need at least 7 days' notice." type="date" min={addDays(7)} value={String(config.eventDate || addDays(7))} onChange={(value) => updateEvent('eventDate', value)} /><Field label="Time food is needed" hint="So we can plan the freshest arrival." type="time" value={String(config.eventTime || '')} onChange={(value) => updateEvent('eventTime', value)} /><Field label="Venue / location in Osogbo" hint="Delivery is within Osogbo, Osun State only." value={String(config.venue || '')} onChange={(value) => updateEvent('venue', value)} placeholder="Venue or area in Osogbo" /><Field label="Number of guests" hint="An estimate is fine; it helps us size your order." type="number" min="1" value={String(config.guests || 100)} onChange={(value) => updateEvent('guests', Number(value))} /></div></>
    const proteinsControls = (arrayName: string, perPlate: boolean, maximum = 30) => <div className="protein-list">{proteinNames.map((name, index) => <div className="protein-row" key={name}><span className="protein-dot">{['B', 'F', 'C'][index]}</span><div><b>{name}</b><small>{formatMoney(proteinPrices[index])} per piece</small></div><Stepper value={Number((config[arrayName] as number[] || [0, 0, 0])[index] || 0)} onChange={(value) => setArr(arrayName, index, value)} min={0} max={perPlate ? 3 : maximum} /><span className="row-price">{formatMoney(Number((config[arrayName] as number[] || [0, 0, 0])[index] || 0) * proteinPrices[index])}</span></div>)}</div>
    const chopsControls = <div className="chops-list">{chopsNames.map((name, index) => <div className="chops-row" key={name}><div><b>{name}</b><small>{formatMoney(chopsPrices[index])} each</small></div><Stepper value={Number((config.chops as number[] || defaultChops)[index] || 0)} onChange={(value) => setArr('chops', index, value)} max={30} /><span>{formatMoney(Number((config.chops as number[] || defaultChops)[index] || 0) * chopsPrices[index])}</span></div>)}</div>
    const decorControls = <><div className="scope-list">{decorationNames.map((name, index) => <label className={`scope-option ${(config.scopes as number[] || []).includes(index) ? 'selected' : ''}`} key={name}><input type="checkbox" checked={(config.scopes as number[] || []).includes(index)} onChange={(event) => setValue('scopes', event.target.checked ? [...(config.scopes as number[] || []), index] : (config.scopes as number[] || []).filter((item) => item !== index))} /><img src={IMAGES.decor} alt="Event decoration example" loading="lazy" onError={imageFallback} /><span><b>{name}</b><small>{index === 4 ? 'A complete venue transformation with all the finishing touches.' : 'Thoughtfully styled to bring your celebration to life.'}</small><strong>{formatMoney(decorationPrices[index])}</strong></span><i>{(config.scopes as number[] || []).includes(index) ? '✓' : '+'}</i></label>)}</div><div className="field-grid"><Field label="Venue location" hint="The decoration team serves venues in Osogbo." value={String(config.venue || '')} onChange={(value) => updateEvent('venue', value)} placeholder="Venue or area in Osogbo" /><Field label="Venue size" hint="Your estimate adjusts to the size of your venue." value={String(config.venueSize || 'small')} onChange={(value) => setValue('venueSize', value)} options={['small', 'medium', 'large']} /></div><p className="hint-block">Final decoration quote is confirmed with you on WhatsApp.</p></>
    const summaryLines = key === 'decor'
      ? [['Selected scope', (config.scopes as number[] || []).map((i) => decorationNames[i]).join(', ') || 'No scope selected'], ['Venue size', String(config.venueSize || 'small')], ['Venue', String(config.venue || 'To be confirmed')]]
      : key === 'cake'
        ? [['Size & layers', `${config.size}" · ${config.layers} layer(s)`], ['Flavours', (config.flavours as string[] || []).join(', ')], ['Icing', `${config.icingType} · ${config.icingColour}`], ['Theme & decoration', `${config.theme} · ${config.decoration}`], ['Delivery date', String(config.date)]]
        : key === 'chops-event'
          ? [['Event', String(config.eventName)], ['Event date & venue', `${config.eventDate} · ${config.venue}`], ['Packs & display', `${config.quantity} · ${config.display}`], ['Servers', String(config.servers)]]
          : [['Event', String(config.eventName)], ['Event date & venue', `${config.eventDate} · ${config.venue}`], ['Serving style', String(config.serving)], ['Guests', String(config.guests)], ['Catering service', String(config.service)], ['Extra servers', String(config.servers)], ['Decoration', config.decoration ? 'Included' : 'Not included']]
    const content = (() => {
      if (eventMode && step === 1) return eventStepOne
      if (isReview) return <><div className="review-summary">{summaryLines.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>{key === 'jollof-event' && <div className="review-summary"><div><span>Serving &amp; proteins</span><b>{config.serving === 'plates' ? `${config.plates} plates` : config.serving === 'coolers' ? 'Coolers selected' : `${config.trays} buffet trays`}</b></div><div><span>Service</span><b>{config.service}</b></div><div><span>Decoration</span><b>{config.decoration ? `${(config.decorScopes as number[]).length} scope item(s)` : 'Not selected'}</b></div></div>}<Field label="Notes" hint="Anything else you'd like us to know?" value={String(config.notes || '')} onChange={(value) => setValue('notes', value)} multiline placeholder="Add a note for our team..." />{eventMode && <p className="estimate-note">Final amount is confirmed on WhatsApp.</p>}</>
      if (key === 'jollof-event' && step === 2) return <><OptionCards value={String(config.serving)} onChange={(value) => setValue('serving', value)} options={ [['plates', 'Plates', `${formatMoney(PRICES.jollof.eventPlate)} per plate`, IMAGES.ricePlates], ['coolers', 'Coolers', `From ${formatMoney(PRICES.jollof.coolers.medium)}`, IMAGES.jollof], ['buffet', 'Buffet trays with plates', `${formatMoney(PRICES.jollof.buffetTray)} per tray + plates`, IMAGES.catering]]} /><p className="hint-block">Choose the serving style that suits your celebration.</p></>
      if (key === 'jollof-event' && step === 3) return <>{config.serving === 'plates' ? <><div className="field-heading"><b>Number of plates</b><small>{formatMoney(PRICES.jollof.eventPlate)} per plate, before proteins</small></div><Stepper value={Number(config.plates || 100)} onChange={(value) => setValue('plates', value)} min={1} max={2000} /><div className="field-heading"><b>Proteins per plate</b><small>Choose one type for every plate, or mix them</small></div>{proteinsControls('eventProteins', true)}</> : config.serving === 'coolers' ? <><div className="field-heading"><b>Choose your coolers</b><small>Each cooler serves approximately the guests shown.</small></div>{['Medium · 25 servings', 'Large · 50 servings', 'Extra-large · 100 servings'].map((name, index) => <div className="sizing-row" key={name}><span>{name}<small>{formatMoney([PRICES.jollof.coolers.medium, PRICES.jollof.coolers.large, PRICES.jollof.coolers.extraLarge][index])}</small></span><Stepper value={Number((config.coolers as number[])[index])} onChange={(value) => setArr('coolers', index, value)} max={50} /></div>)}<div className="field-heading"><b>Total pieces of protein</b><small>Pieces across the whole event.</small></div>{proteinsControls('eventProteins', false, 5000)}</> : <><div className="field-grid"><Field label="Buffet trays" hint={`Approximately 25 servings per tray at ${formatMoney(PRICES.jollof.buffetTray)} each.`} type="number" min="1" value={String(config.trays || 1)} onChange={(value) => setValue('trays', Number(value))} /><Field label="Number of guests" hint={`Disposable plates are ${formatMoney(PRICES.jollof.buffetPlate)} per guest.`} type="number" min="1" value={String(config.guests || 100)} onChange={(value) => setValue('guests', Number(value))} /></div><div className="field-heading"><b>Total pieces of protein</b><small>Pieces across the whole event.</small></div>{proteinsControls('eventProteins', false, 5000)}</>}
        </>
      if (key === 'jollof-event' && step === 4) return <><OptionCards value={String(config.service)} onChange={(value) => setValue('service', value)} options={ [['delivery', 'Delivery only', `${formatMoney(PRICES.service.delivery)} · delivery fee at checkout`, ''], ['indoor', 'Indoor catering', `${formatMoney(PRICES.service.indoor)} · staff, setup, serving`, IMAGES.catering], ['outdoor', 'Outdoor catering', `${formatMoney(PRICES.service.outdoor)} · staff, setup, serving`, IMAGES.catering]]} /><div className="field-heading"><b>Extra servers</b><small>{formatMoney(PRICES.service.server)} per server</small></div><Stepper value={Number(config.servers || 0)} onChange={(value) => setValue('servers', value)} max={20} /><label className="check-line"><input type="checkbox" checked={Boolean(config.cutlery)} onChange={(event) => setValue('cutlery', event.target.checked)} /><span><b>Disposable plates and cutlery</b><small>{formatMoney(PRICES.service.cutleryGuest)} per guest</small></span></label></>
      if (key === 'jollof-event' && step === 5) return <><h3 className="modal-question">Would you also like event decoration?</h3><div className="choice-row"><button className={`choice-tile ${config.decoration ? 'selected' : ''}`} onClick={() => setValue('decoration', true)}>Yes, let's decorate <span>✳</span></button><button className={`choice-tile ${!config.decoration ? 'selected' : ''}`} onClick={() => setValue('decoration', false)}>No, thank you <span>→</span></button></div>{config.decoration && decorControls}</>
      if (key === 'chops-event' && step === 2) return <><div className="field-heading"><b>Customize your plate</b><small>Adjust each item to build your perfect mix.</small></div>{chopsControls}<div className="plate-total"><span>Plate price</span><b>{formatMoney(PRICES.smallChops.packaging + (config.chops as number[]).reduce((sum, number, i) => sum + number * chopsPrices[i], 0))}</b></div></>
      if (key === 'chops-event' && step === 3) return <><Field label="Number of packs" hint="How many guests are you serving?" type="number" min="1" max="500" value={String(config.quantity || 1)} onChange={(value) => setValue('quantity', Number(value))} /><OptionCards value={String(config.display)} onChange={(value) => setValue('display', value)} options={ [['foil', 'Tin foil packs', 'Included', IMAGES.chops], ['display', 'Display style', `+${formatMoney(PRICES.smallChops.display)} per pack`, IMAGES.chopsDisplay]]} /></>
      if (key === 'chops-event' && step === 4) return <><div className="service-photo"><img src={IMAGES.catering} alt="Catering team serving an event" loading="lazy" onError={imageFallback} /></div><div className="field-heading"><b>Extra servers</b><small>{formatMoney(PRICES.smallChops.server)} per server</small></div><Stepper value={Number(config.servers || 0)} onChange={(value) => setValue('servers', value)} max={20} /><p className="hint-block">Your team will arrive ready to set up and serve.</p></>
      if (key === 'decor' && step === 2) return <><p className="hint-block">Choose the parts of your venue you'd like us to transform. Select full hall transformation to include all the details.</p>{decorControls}</>
      if (key === 'decor' && step === 3) return <>{decorControls}</>
      if (key === 'cake' && step === 1) {
        const servings = { '6': 10, '8': 20, '10': 35, '12': 50 }
        return <><div className="field-heading"><b>Cake size</b><small>Choose a size for your celebration.</small></div><Pills value={String(config.size)} onChange={(value) => setValue('size', value)} options={['6', '8', '10', '12']} suffix={'"'} /><div className="field-heading"><b>Number of layers</b><small>Height: {config.layers === 1 ? 'about 3 inches (a standard cupcake)' : config.layers === 2 ? 'about 6 inches (a soda can)' : 'about 9 inches (a large water bottle)'}.</small></div><Pills value={String(config.layers)} onChange={(value) => { const layers = Number(value); setValue('layers', layers); const flavours = (config.flavours as string[]).slice(0, layers); while (flavours.length < layers) flavours.push('Vanilla'); setValue('flavours', flavours) }} options={['1', '2', '3']} suffix=" layer(s)" /><div className="serving-reference"><span>✳</span><b>Perfect for about {servings[String(config.size) as keyof typeof servings]} slices</b><small>Based on your selected cake size.</small></div></>
      }
      if (key === 'cake' && step === 2) return <>{(config.flavours as string[]).map((flavour, index) => <div className="flavour-row" key={index}><div><b>Layer {index + 1}</b><small>{flavour === 'Red Velvet' ? `+${formatMoney(PRICES.cake.redVelvetLayer)} per layer` : 'Included in base price'}</small></div><select value={flavour} onChange={(event) => setArr('flavours', index, event.target.value)}><option>Vanilla</option><option>Chocolate</option><option>Red Velvet</option></select></div>)}</>
      if (key === 'cake' && step === 3) return <><div className="field-heading"><b>Icing type</b><small>Fondant adds 30% of the base cake price.</small></div><Pills value={String(config.icingType)} onChange={(value) => setValue('icingType', value)} options={['Buttercream', 'Whipped Cream', 'Fondant']} /><div className="field-heading"><b>Icing colour</b><small>Pick a shade or tell us your custom colour.</small></div><div className="swatch-row">{[['White','#fff'],['Cream','#f2dfbe'],['Pink','#f0a8b8'],['Blue','#8bb7de'],['Purple','#9a7ab8'],['Gold','#d4a24c'],['Red','#bd343e'],['Green','#5b865d'],['Black','#2b1b17']].map(([name, color]) => <button key={name} aria-label={name} className={`colour-swatch ${config.icingColour === name ? 'selected' : ''}`} style={{ backgroundColor: color }} onClick={() => setValue('icingColour', name)} />)}</div><Field label="Custom colour" hint="Optional — add a colour name if you don't see it above." value={String(config.customColour || '')} onChange={(value) => setValue('customColour', value)} placeholder="e.g. sage green" /><div className="field-heading"><b>Icing flavour</b><small>Choose a flavour for the finish.</small></div><Pills value={String(config.icingFlavour)} onChange={(value) => setValue('icingFlavour', value)} options={['Vanilla', 'Chocolate', 'Strawberry']} /></>
      if (key === 'cake' && step === 4) return <><Field label="Event / theme" hint="What are we celebrating?" value={String(config.theme)} onChange={(value) => setValue('theme', value)} options={['Birthday', 'Wedding', 'Engagement', 'Anniversary', 'Baby Shower', 'Graduation', 'Corporate', 'Other']} /><div className="field-heading"><b>Decoration level</b><small>Choose how you'd like us to finish your cake.</small></div><Pills value={String(config.decoration)} onChange={(value) => setValue('decoration', value)} options={['Simple', 'Standard', 'Premium']} /><p className="hint-block">Simple included · Standard +{formatMoney(PRICES.cake.standardDecoration)} · Premium +{formatMoney(PRICES.cake.premiumDecoration)}</p><Field label="Description of the decoration" hint="Tell us what you want on the cake, e.g. gold drip, name and age, flowers in pink." value={String(config.decorationDescription || '')} onChange={(value) => setValue('decorationDescription', value)} multiline placeholder="Describe the details you'd love..." /><label className="field-label">Upload inspiration image <small>Preview only in this demo; show us your inspiration.</small><input type="file" accept="image/*" onChange={(event) => setImageName(event.target.files?.[0]?.name || '')} />{imageName && <span className="file-selected">✓ {imageName}</span>}</label><Field label="Message on the cake" hint="A short message, name or age for the cake." value={String(config.message || '')} onChange={(value) => setValue('message', value)} placeholder="e.g. Happy 30th, Tola!" /></>
      if (key === 'cake' && step === 5) return <><Field label="Delivery date" hint="Custom cakes need at least 3 days' notice." type="date" min={addDays(3)} value={String(config.date || addDays(3))} onChange={(value) => setValue('date', value)} /><div className="field-heading"><b>Number of cakes</b><small>Order between 1 and 5.</small></div><Stepper value={Number(config.quantity || 1)} onChange={(value) => setValue('quantity', value)} max={5} /></>
      if (key === 'jollof-personal') return <><div className="field-heading"><b>Number of plates</b><small>{formatMoney(PRICES.jollof.personalPlate)} per plate, with smokey jollof and fried plantain.</small></div><Stepper value={Number(config.quantity || 1)} onChange={(value) => setValue('quantity', value)} min={1} max={50} /><div className="field-heading"><b>Proteins per plate</b><small>Each piece is added to every plate. Maximum 4 pieces total per plate.</small></div>{proteinsControls('proteins', true)}<Field label="Notes" hint="Allergies, no pepper, extra stew, etc." value={String(config.notes || '')} onChange={(value) => setValue('notes', value)} multiline placeholder="A note for our kitchen..." /></>
      if (key === 'egusi') return <><div className="field-heading"><b>Choose your proteins</b><small>Two pieces of beef are included in your starting selection.</small></div>{proteinsControls('proteins', true)}<Field label="Swallow" hint={`Semo is ${formatMoney(PRICES.egusi.semo)} per wrap; Pounded yam is ${formatMoney(PRICES.egusi.poundedYam)} per wrap.`} value={String(config.swallow)} onChange={(value) => setValue('swallow', value)} options={['None', 'Semo', 'Pounded yam']} />{config.swallow !== 'None' && <div className="field-heading"><b>Number of wraps</b><small>Choose how many you'd like.</small><Stepper value={Number(config.swallowQty || 0)} onChange={(value) => setValue('swallowQty', value)} max={20} /></div>}<Field label="Number of bowls" hint="Each bowl serves one litre." type="number" min="1" max="20" value={String(config.quantity)} onChange={(value) => setValue('quantity', Number(value))} /><Field label="Notes" hint="Allergies or special instructions." value={String(config.notes || '')} onChange={(value) => setValue('notes', value)} multiline /></>
      if (key === 'chops-personal') return <><div className="field-heading"><b>Build your plate</b><small>Adjust each item to create your perfect mix.</small></div>{chopsControls}<div className="plate-total"><span>Plate price</span><b>{formatMoney(PRICES.smallChops.packaging + (config.chops as number[]).reduce((sum, number, i) => sum + number * chopsPrices[i], 0))}</b></div><Field label="Number of packs" hint="Choose between 1 and 500." type="number" min="1" max="500" value={String(config.quantity)} onChange={(value) => setValue('quantity', Number(value))} /><Field label="Notes" hint="Any allergies or special requests?" value={String(config.notes || '')} onChange={(value) => setValue('notes', value)} multiline /></>
      if (key === 'ponmo') return <><div className="field-heading"><b>Choose your pot size</b><small>Serving estimates help you pick the right size.</small></div><OptionCards value={String(config.size)} onChange={(value) => setValue('size', value)} options={ [['small', 'Small', `Serves 4 to 5 · ${formatMoney(PRICES.ponmo.small)}`, ''], ['medium', 'Medium', `Serves 8 to 10 · ${formatMoney(PRICES.ponmo.medium)}`, ''], ['large', 'Large', `Serves 15 to 20 · ${formatMoney(PRICES.ponmo.large)}`, '']] } /><Field label="Spice level" hint="Choose the heat that's right for you." value={String(config.spice)} onChange={(value) => setValue('spice', value)} options={['Mild', 'Medium', 'Hot']} /><div className="field-heading"><b>Extra beef</b><small>{formatMoney(PRICES.ponmo.extraBeef)} per piece.</small><Stepper value={Number(config.extraBeef || 0)} onChange={(value) => setValue('extraBeef', value)} max={40} /></div><Field label="Quantity" hint="Choose between 1 and 10 pots." type="number" min="1" max="10" value={String(config.quantity)} onChange={(value) => setValue('quantity', Number(value))} /><Field label="Notes" hint="Tell us anything else we should know." value={String(config.notes || '')} onChange={(value) => setValue('notes', value)} multiline /></>
      if (key === 'spaghetti') return <><div className="field-heading"><b>Proteins per plate</b><small>Choose 0 to 3 pieces of each protein.</small></div>{proteinsControls('proteins', true)}<Field label="Number of plates" hint={`${formatMoney(PRICES.spaghetti.base)} base per plate. Choose 1 to 50.`} type="number" min="1" max="50" value={String(config.quantity)} onChange={(value) => setValue('quantity', Number(value))} /><Field label="Notes" hint="Allergies, no pepper, or other requests." value={String(config.notes || '')} onChange={(value) => setValue('notes', value)} multiline /></>
      if (key === 'bucket') return <><div className="field-heading"><b>Choose your pieces</b><small>At least 20 pieces total. Beef {formatMoney(PRICES.bucket.beef)}, fish {formatMoney(PRICES.bucket.fish)}, chicken {formatMoney(PRICES.bucket.chicken)} each.</small></div>{['Beef', 'Fish', 'Chicken'].map((name, index) => <div className="sizing-row" key={name}><span>{name}<small>{formatMoney([PRICES.bucket.beef, PRICES.bucket.fish, PRICES.bucket.chicken][index])} per piece</small></span><Stepper value={Number((config.proteins as number[])[index])} onChange={(value) => setArr('proteins', index, value)} max={200} /></div>)}<p className={`hint-block ${(config.proteins as number[]).reduce((a, b) => a + b, 0) < 20 ? 'warning-hint' : ''}`}>{(config.proteins as number[]).reduce((a, b) => a + b, 0) < 20 ? `Choose ${20 - (config.proteins as number[]).reduce((a, b) => a + b, 0)} more pieces to meet the 20-piece minimum.` : `20-piece minimum reached. Bucket container fee: ${formatMoney(PRICES.bucket.container)}.`}</p><Field label="Number of buckets" hint="Choose between 1 and 10 buckets." type="number" min="1" max="10" value={String(config.quantity)} onChange={(value) => setValue('quantity', Number(value))} /><Field label="Notes" hint="Let us know how you'd like it prepared." value={String(config.notes || '')} onChange={(value) => setValue('notes', value)} multiline /></>
      if (key === 'cupcakes') return <><div className="field-heading"><b>Box size</b><small>Choose how many cupcakes to share.</small></div><OptionCards value={String(config.size)} onChange={(value) => setValue('size', value)} options={[['six', '6 cupcakes', formatMoney(PRICES.cupcakes.six), ''], ['twelve', '12 cupcakes', formatMoney(PRICES.cupcakes.twelve), ''], ['twentyFour', '24 cupcakes', formatMoney(PRICES.cupcakes.twentyFour), '']]} /><Field label="Flavour" hint={`Red Velvet adds ${formatMoney(PRICES.cupcakes.redVelvetPerSix)} per 6 cupcakes.`} value={String(config.flavour)} onChange={(value) => setValue('flavour', value)} options={['Vanilla', 'Chocolate', 'Red Velvet']} /><Field label="Delivery date" hint="Choose a date at least 3 days from today." type="date" min={addDays(3)} value={String(config.date)} onChange={(value) => setValue('date', value)} /><Field label="Number of boxes" hint="Choose between 1 and 10." type="number" min="1" max="10" value={String(config.quantity)} onChange={(value) => setValue('quantity', Number(value))} /><Field label="Notes" hint="A message for our team." value={String(config.notes || '')} onChange={(value) => setValue('notes', value)} multiline /></>
      return null
    })()
    const addLabel = isReview ? `Add to Cart · ${formatMoney(price)}` : isWizard ? `Next · ${formatMoney(price)}` : `Add to Cart · ${formatMoney(price)}`
    return <div className="overlay modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}><section className={`product-modal ${isWizard ? 'wizard-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <div className="modal-top"><div><span className="overline">{eventMode ? 'LET’S MAKE YOUR DAY' : 'MADE JUST FOR YOU'}</span><h2 id="modal-heading">{title}</h2></div><button className="close-btn" onClick={close} aria-label="Close customization">×</button></div>
      {isWizard && <div className="wizard-progress"><div className="progress-caption"><span>{modalStepTitle(key, step)}</span><b>Step {step} of {count}</b></div><div className="progress-track"><span style={{ width: `${step / count * 100}%` }} /></div></div>}
      <div className="modal-scroll"><div className="modal-body">{content}</div></div>
      <div className="modal-sticky"><div className="live-total"><span>{eventMode || isReview ? 'Estimated value' : 'Total'}</span><b key={price} className="price-change">{formatMoney(price)}</b></div><div className="modal-controls">{isWizard && <button className="back-button" onClick={goBack}>{step === 1 ? 'Cancel' : '← Back'}</button>}<button className="btn btn-gold modal-submit" onClick={validateNext}>{addLabel}<span>{isWizard && !isReview ? '→' : '✓'}</span></button></div></div>
    </section></div>
  }
}

function modalStepTitle(key: ProductKey, step: number) {
  if (key === 'jollof-event') return ['Your Event', 'Serving Style', 'Quantity & Proteins', 'Catering Service', 'Event Decoration', 'Review'][step - 1]
  if (key === 'chops-event') return ['Your Event', 'Customize the Plate', 'Quantity & Display', 'Service', 'Review'][step - 1]
  if (key === 'cake') return ['Size & Layers', 'Flavours', 'Icing', 'Theme & Decoration', 'Delivery Date', 'Review'][step - 1]
  return ['Your Event', 'Decoration Scope', 'Venue Size & Location', 'Review'][step - 1]
}

function Field({ label, hint, value, onChange, type = 'text', options, multiline = false, placeholder, min, max }: { label: string; hint: string; value: string; onChange: (value: string) => void; type?: string; options?: string[]; multiline?: boolean; placeholder?: string; min?: string; max?: string }) {
  function handleChange(input: string) {
    if (type !== 'number') { onChange(input); return }
    const low = min === undefined ? 0 : Number(min)
    const high = max === undefined ? Number.MAX_SAFE_INTEGER : Number(max)
    const parsed = Number(input)
    onChange(String(Math.min(high, Math.max(low, Number.isFinite(parsed) ? parsed : low))))
  }
  return <label className="field-label">{label}<small>{hint}</small>{options ? <select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select> : multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} /> : <input type={type} min={min} max={max} value={value} onChange={(event) => handleChange(event.target.value)} placeholder={placeholder} />}</label>
}

function Stepper({ value, onChange, min = 0, max = 99 }: { value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return <div className="stepper"><button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button><span>{value}</span><button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button></div>
}

function Pills({ value, onChange, options, suffix = '' }: { value: string; onChange: (value: string) => void; options: string[]; suffix?: string }) {
  return <div className="pills">{options.map((option) => <button key={option} className={value === option ? 'selected' : ''} onClick={() => onChange(option)}>{option}{suffix}</button>)}</div>
}

function OptionCards({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: [string, string, string, string][] }) {
  return <div className="option-cards">{options.map(([id, title, price, image]) => <button key={id} className={`option-card ${value === id ? 'selected' : ''}`} onClick={() => onChange(id)}>{image ? <img src={image} alt={`${title} option preview`} loading="lazy" onError={imageFallback} /> : <span className="option-illustration" aria-hidden="true">✳</span>}<span className="option-card-text"><b>{title}</b><small>{price}</small></span><i>{value === id ? '✓' : ''}</i></button>)}</div>
}

function SavedEventSelector({ events, value, onChange }: { events: EventInfo[]; value: string; onChange: (value: string) => void }) {
  return <label className="field-label saved-event-label">Use a saved event<small>Bring over event details you've already added.</small><select value={value} onChange={(event) => onChange(event.target.value)}><option value="">Create a new event</option>{events.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.date}</option>)}</select></label>
}

function CartContents({ cart, subtotal, hasEventItems, editLine, removeLine, startCheckout, changeQuantity }: { cart: CartLine[]; setCart: Dispatch<SetStateAction<CartLine[]>>; subtotal: number; hasEventItems: boolean; editLine: (line: CartLine) => void; removeLine: (id: string) => void; startCheckout: () => void; changeQuantity: (id: string, quantity: number) => void }) {
  const groups = new Map<string, CartLine[]>()
  cart.forEach((line) => { const key = line.event?.id || 'Personal Orders'; groups.set(key, [...(groups.get(key) || []), line]) })
  return <><div className="cart-content">{Array.from(groups.entries()).map(([groupId, lines]) => <section className="cart-group" key={groupId}><div className="cart-group-heading"><span>✳</span><div><b>{lines[0].event?.name || 'Personal Orders'}</b>{lines[0].event && <small>{lines[0].event.date} · {lines[0].event.venue}</small>}</div></div>{lines.map((line) => <article className="cart-line" key={line.id}><div className={`cart-thumb ${line.image ? '' : 'image-gradient'}`}>{line.image ? <img src={line.image} alt={line.name} loading="lazy" onError={imageFallback} /> : <span>✳</span>}</div><div className="cart-line-main"><b>{line.name}{line.estimated && <em>Estimate</em>}</b><small>{line.summary}</small><div className="cart-line-actions">{line.key !== 'quick' && <button onClick={() => editLine(line)}>Edit</button>}<button onClick={() => removeLine(line.id)}>Remove</button></div>{line.key === 'quick' && <Stepper value={Number(line.config.quantity || 1)} onChange={(value) => changeQuantity(line.id, value)} max={99} />}</div><strong>{formatMoney(line.price)}</strong></article>)}</section>)}</div><div className="cart-sticky"><div className="subtotal-row"><span>Subtotal</span><b>{formatMoney(subtotal)}</b></div>{hasEventItems && <small className="cart-estimate-note">Event orders are estimates. Final amount is confirmed on WhatsApp.</small>}<button className="btn btn-gold full-button" onClick={startCheckout}>Checkout on WhatsApp <span>↗</span></button><small className="whatsapp-assurance">No card payment · Confirm and pay on WhatsApp</small></div></>
}

function CheckoutForm({ form, setField, areaFee, subtotal, estimated, minDate, back, placeOrder }: { form: { name: string; phone: string; method: string; area: string; address: string; date: string; time: string; notes: string }; setField: (field: keyof typeof form, value: string) => void; areaFee: number; subtotal: number; estimated: boolean; minDate: string; back: () => void; placeOrder: () => void }) {
  const [error, setError] = useState('')
  function submit() {
    if (!form.name.trim() || !form.phone.trim() || !form.date || !form.time || (form.method === 'Delivery' && !form.address.trim())) { setError('Please complete your name, phone, date, time and delivery address.'); return }
    if (form.date < minDate) { setError('Please choose a delivery date that meets the lead time for your order.'); return }
    setError('')
    placeOrder()
  }
  return <><div className="checkout-content"><button className="back-link" onClick={back}>← Back to your cart</button><p className="delivery-notice">We deliver within Osogbo, Osun State only.</p><label className="field-label">Full name<small>Who should we prepare this order for?</small><input value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Your full name" /></label><label className="field-label">Phone number<small>Use the number we can reach you on.</small><input type="tel" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="+234..." /></label><label className="field-label">Delivery method<small>Pickup or delivery within Osogbo.</small><select value={form.method} onChange={(event) => setField('method', event.target.value)}><option>Pickup</option><option>Delivery</option></select></label>{form.method === 'Delivery' && <><label className="field-label">Delivery area<small>Delivery fees are added to your order.</small><select value={form.area} onChange={(event) => setField('area', event.target.value)}><option value="central">Central Osogbo · {formatMoney(PRICES.delivery.central)}</option><option value="greater">Greater Osogbo (outskirts) · {formatMoney(PRICES.delivery.greater)}</option><option value="event">Event delivery · {formatMoney(PRICES.delivery.event)}</option></select></label><label className="field-label">Delivery address<small>Osogbo, Osun State</small><input value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Street, area, Osogbo" /></label></>}<div className="checkout-two"><label className="field-label">Preferred date<small>Pick a convenient date.</small><input type="date" min={minDate} value={form.date} onChange={(event) => setField('date', event.target.value)} /></label><label className="field-label">Time<small>When should it arrive?</small><input type="time" value={form.time} onChange={(event) => setField('time', event.target.value)} /></label></div><label className="field-label">Order notes<small>Anything else we should know?</small><textarea rows={3} value={form.notes} onChange={(event) => setField('notes', event.target.value)} placeholder="Add a note..." /></label>{error && <p className="form-error" role="alert">{error}</p>}</div><div className="cart-sticky checkout-sticky"><div className="subtotal-row"><span>Subtotal</span><b>{formatMoney(subtotal)}</b></div><div className="subtotal-row"><span>Delivery fee</span><b>{formatMoney(areaFee)}</b></div><div className="subtotal-row total-row"><span>{estimated ? 'Estimated total' : 'Total'}</span><b>{formatMoney(subtotal + areaFee)}</b></div>{estimated && <small className="cart-estimate-note">Final amount is confirmed on WhatsApp.</small>}<button className="btn whatsapp-btn full-button" onClick={submit}>Place Order on WhatsApp <span>↗</span></button></div></>
}

export default App
