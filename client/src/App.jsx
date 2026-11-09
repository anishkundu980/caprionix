import { useEffect, useState } from 'react'
import fallback from './products.json'

const roles = [['Aqua','Base'],['Glycerin','Hydration'],['Propylene Glycol','Skin conditioning'],['Mineral oil','Moisture lock'],['Glyceryl Monostearate','Emulsifier'],['Cetearyl Alcohol','Rheology modifier'],['Hydroxypropyl Methylcellulose','Viscosity modifier'],['Zea Mays Starch','Texture modifier and absorbent'],['Disodium EDTA','Chelating agent']]
const price = p => (p.price ? `₹${p.price}` : '')

export default function App() {
  const [products, setProducts] = useState(fallback)
  const [cart, setCart] = useState({})
  const [bump, setBump] = useState(false)
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [pick, setPick] = useState('lavender')

  useEffect(() => {
    fetch('/api/products').then(r => (r.ok ? r.json() : Promise.reject())).then(d => d.length && setProducts(d)).catch(() => {})
    const on = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const bag = Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  const updateQuantity = (productId, change) => {
    setCart(current => {
      const quantity = Math.max(0, (current[productId] || 0) + change)
      const next = { ...current }
      if (quantity === 0) delete next[productId]
      else next[productId] = quantity
      return next
    })
    if (change > 0) {
      setBump(true)
      setTimeout(() => setBump(false), 450)
    }
  }
  const scents = products.filter(p => p.category === 'moisturiser')
  const sel = scents.find(p => p.id === pick) || scents[0]
  const go = () => setMenu(false)

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
        <a href="#top" className="logo">CAPRIONIX</a>
        <nav className={`links ${menu ? 'open' : ''}`}>
          <a href="#shop" onClick={go}>Shop</a>
          <a href="#customise" onClick={go}>Customise</a>
          <a href="#ingredients" onClick={go}>Ingredients</a>
          <a href="#contact" onClick={go}>Contact</a>
        </nav>
        <div className="nav-end">
          <button className={`bag ${bump ? 'bump' : ''}`} aria-label={`Bag, ${bag} items`}>Bag <span>{bag}</span></button>
          <button className="burger" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(m => !m)}><i /><i /></button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="tag">Research-led beauty</p>
            <h1>Simple formulas, made&nbsp;your&nbsp;own.</h1>
            <p className="lede">Skincare and haircare where every ingredient has a job and nothing else gets in. Pick your scent, keep your routine honest.</p>
            <div className="cta"><a className="btn" href="#customise">Choose your scent</a><a className="btn btn--ghost" href="#shop">Shop all</a></div>
          </div>
          <div className="hero-art">
            <div className="arch"><img src="/images/lavender-bottle.jpg" alt="Caprionix lavender body moisturiser bottle" /></div>
            <div className="float"><img src="/images/coffee-jar.jpg" alt="" /><p><b>3 scents</b><br />90% water + glycerin</p></div>
          </div>
        </section>

        <section className="facts">
          <p>Deep hydration</p><p>Non-greasy, fast absorbing</p><p>Preservative-free</p><p>Not tested on animals</p>
        </section>

        <section id="customise" className="custom" style={{ '--accent': sel.accent, '--soft': sel.soft }}>
          <div className="custom-img"><img key={sel.id} src={sel.image} alt={`${sel.scent} moisturiser jar`} /></div>
          <div className="custom-body">
            <h2>Make it yours</h2>
            <p className="lede">One base, three scents. Select yours and see it on the shelf.</p>
            <div className="swatches" role="radiogroup" aria-label="Scent">
              {scents.map(s => (
                <button key={s.id} role="radio" aria-checked={s.id === sel.id} className={s.id === sel.id ? 'on' : ''} onClick={() => setPick(s.id)}>
                  <i style={{ background: s.accent }} />{s.scent}
                </button>
              ))}
            </div>
            <p className="blurb" key={sel.id + 'b'}>{sel.blurb}</p>
            <div className="buy"><span>{sel.size} &nbsp;|&nbsp; {price(sel)} incl. taxes</span>
              {cart[sel.id] ? (
                <div className="quantity" aria-label={`${sel.scent} quantity`}>
                  <button aria-label={`Remove one ${sel.scent} moisturiser`} onClick={() => updateQuantity(sel.id, -1)}>−</button>
                  <span aria-live="polite">{cart[sel.id]}</span>
                  <button aria-label={`Add one ${sel.scent} moisturiser`} onClick={() => updateQuantity(sel.id, 1)}>+</button>
                </div>
              ) : <button className="btn btn--accent" onClick={() => updateQuantity(sel.id, 1)}>Add {sel.scent.toLowerCase()} to bag</button>}
            </div>
          </div>
        </section>

        <section id="shop" className="shop">
          <div className="head"><h2>The range</h2></div>
          <div className="grid">
            {products.map(p => (
              <article className="card" key={p.id + p.category} style={{ '--accent': p.accent, '--soft': p.soft }}>
                <div className="card-img"><img src={p.image} alt={`${p.name}, ${p.scent}`} loading="lazy" /></div>
                <div className="card-body">
                  <h3>{p.name}</h3>
                  <p className="scent"><i />{p.scent} scent</p>
                  <p className="small">{p.blurb}</p>
                  <div className="card-foot"><span>{p.size}{p.price ? ` | ${price(p)}` : ''}</span>
                    {cart[p.id] ? (
                      <div className="quantity quantity--small" aria-label={`${p.name} quantity`}>
                        <button aria-label={`Remove one ${p.name}`} onClick={() => updateQuantity(p.id, -1)}>−</button>
                        <span aria-live="polite">{cart[p.id]}</span>
                        <button aria-label={`Add one ${p.name}`} onClick={() => updateQuantity(p.id, 1)}>+</button>
                      </div>
                    ) : <button className="btn btn--sm" onClick={() => updateQuantity(p.id, 1)}>Add to bag</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="ingredients" className="ingr">
          <div className="ingr-l">
            <h2>Every ingredient has a job.</h2>
            <p className="lede">The full Hydra-Body formula, with the reason each one is there.</p>
            <blockquote>Mineral oil forms a protective film on the skin’s surface, helping reduce transepidermal water loss.</blockquote>
            <blockquote>A chelating agent binds tiny traces of metals, helping keep the product stable.</blockquote>
          </div>
          <dl className="ingr-r">{roles.map(([n, r]) => <div key={n}><dt>{n}</dt><dd>{r}</dd></div>)}</dl>
        </section>
      </main>

      <footer id="contact" className="foot">
        <div><span className="logo">CAPRIONIX</span><p>Research-led beauty. Made in India.</p></div>
        <div><p>wecare@caprionix.com</p><p>www.caprionix.com</p></div>
        <div><p>For external use only.</p><p>Store refrigerated at about 10°C.</p></div>
      </footer>
    </>
  )
}
