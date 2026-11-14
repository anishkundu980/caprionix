import { useEffect, useState } from 'react'
import fallback from './products.json'

const roles = [['Aqua','Base'],['Glycerin','Hydration'],['Propylene Glycol','Skin conditioning'],['Mineral oil','Moisture lock'],['Glyceryl Monostearate','Emulsifier'],['Cetearyl Alcohol','Rheology modifier'],['Hydroxypropyl Methylcellulose','Viscosity modifier'],['Zea Mays Starch','Texture modifier and absorbent'],['Disodium EDTA','Chelating agent']]
const lavenderSizes = [{ size: '65 mL', price: 449 }, { size: '100 mL', price: 749 }]
const lavenderScents = ['Lavender', 'coffee', 'Strawberry', 'coco vanilla', 'Non-scented']
const price = p => (p.price ? `₹${p.price}` : '')

export default function App() {
  const [products, setProducts] = useState(fallback)
  const [cart, setCart] = useState({})
  const [bump, setBump] = useState(false)
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [pick, setPick] = useState('lavender')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [selectedProductSize, setSelectedProductSize] = useState('65 mL')
  const [selectedProductScent, setSelectedProductScent] = useState('Lavender')
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

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
  const selectedProduct = products.find(p => p.id === selectedProductId)
  const selectedLavenderSize = lavenderSizes.find(option => option.size === selectedProductSize) || lavenderSizes[0]
  const selectedProductPrice = selectedProduct?.id === 'lavender' ? selectedLavenderSize.price : selectedProduct?.price
  const selectedProductImages = selectedProduct ? [
    { src: selectedProduct.image, alt: `${selectedProduct.name}, ${selectedProduct.scent}`, label: 'Product photo' },
    ...(selectedProduct.id === 'lavender' ? [
      { src: '/images/lavender-label-front.png', alt: 'Front label of the Lavender Glycerin Hydra-Body Moisturiser', label: 'Front label' },
      { src: '/images/lavender-label-back.png', alt: 'Ingredients and product information on the back label', label: 'Ingredients and formula details' },
      { src: '/images/lavender-product-information.png', alt: 'Directions, storage, batch and pricing information for the moisturiser', label: 'Directions and product information' },
    ] : []),
  ] : []
  const go = () => {
    setMenu(false)
    setSelectedProductId(null)
  }
  const openProduct = product => {
    setSelectedProductId(product.id)
    setSelectedProductSize('65 mL')
    setSelectedProductScent('Lavender')
    setSelectedProductQuantity(1)
    setActiveImageIndex(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

      {selectedProduct ? (
        <main id="top">
          <section className="product-detail" style={{ '--accent': selectedProduct.accent, '--soft': selectedProduct.soft }}>
            <button className="back-link" onClick={go}>← Back to the range</button>
            <div className="product-detail-layout">
              <div className="product-image-gallery">
                <div className="product-detail-img">
                  <img key={selectedProductImages[activeImageIndex].src} src={selectedProductImages[activeImageIndex].src} alt={selectedProductImages[activeImageIndex].alt} />
                  {selectedProductImages.length > 1 && (
                    <div className="product-image-pagination" role="group" aria-label="Choose a product image">
                      {selectedProductImages.map((image, index) => (
                        <button
                          key={image.src}
                          className={`product-image-dot ${activeImageIndex === index ? 'active' : ''}`}
                          type="button"
                          aria-label={`Show ${image.label.toLowerCase()}`}
                          aria-current={activeImageIndex === index ? 'true' : undefined}
                          onClick={() => setActiveImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="product-detail-copy">
                <p className="tag">{selectedProduct.category === 'moisturiser' ? 'Body care' : 'Hair care'}</p>
                <h1>{selectedProduct.name}</h1>
                {selectedProduct.id !== 'lavender' && <p className="product-detail-scent"><i />{selectedProduct.scent} scent</p>}
                <p className="product-detail-description">
                  {selectedProduct.id === 'lavender' ? (
                    <>
                      <strong>90% Water. Nothing Unnecessary.</strong>
                      Lightweight hydration powered by glycerin, designed to replenish moisture and leave skin feeling soft, smooth, and comfortably hydrated. Simple formulation. Purposeful ingredients. Everyday hydration.
                    </>
                  ) : selectedProduct.blurb}
                </p>
                {selectedProduct.id === 'lavender' ? (
                  <div className="product-size-selector">
                    <p id="product-size-label">Select size</p>
                    <div className="product-size-options" role="group" aria-labelledby="product-size-label">
                      {lavenderSizes.map(option => (
                        <button
                          key={option.size}
                          className={`product-size-option ${selectedProductSize === option.size ? 'active' : ''}`}
                          type="button"
                          aria-pressed={selectedProductSize === option.size}
                          onClick={() => setSelectedProductSize(option.size)}
                        >
                          <span>{option.size}</span>
                        </button>
                      ))}
                    </div>
                    <div className="product-scent-selector">
                      <p id="product-scent-label">Select Scent</p>
                      <div className="product-size-options product-scent-options" role="group" aria-labelledby="product-scent-label">
                        {lavenderScents.map(scent => (
                          <button
                            key={scent}
                            className={`product-size-option ${selectedProductScent === scent ? 'active' : ''}`}
                            type="button"
                            aria-pressed={selectedProductScent === scent}
                            onClick={() => setSelectedProductScent(scent)}
                          >
                            <span>{scent}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="product-detail-facts">
                    <div><span>Size</span><strong>{selectedProduct.size}</strong></div>
                    <div><span>Scent</span><strong>{selectedProduct.scent}</strong></div>
                  </div>
                )}
                <section className="product-price" aria-label="Product price">
                  <p className="product-price-label">PRICE</p>
                  <div className="product-price-card">
                    <span>MRP</span>
                    <div className="product-price-amount">
                      <strong>{selectedProductPrice ? `₹${selectedProductPrice}` : 'Coming soon'}</strong>
                      {selectedProductPrice && <small>(incl. of all taxes)</small>}
                    </div>
                  </div>
                </section>
                <div className="product-detail-buy">
                  <div className="quantity quantity--product" aria-label={`${selectedProduct.name} quantity`}>
                    <button
                      type="button"
                      aria-label={`Reduce ${selectedProduct.name} quantity`}
                      onClick={() => setSelectedProductQuantity(quantity => Math.max(1, quantity - 1))}
                    >−</button>
                    <span aria-live="polite">{selectedProductQuantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${selectedProduct.name} quantity`}
                      onClick={() => setSelectedProductQuantity(quantity => quantity + 1)}
                    >+</button>
                  </div>
                  <button
                    className="btn product-add-to-cart"
                    type="button"
                    onClick={() => updateQuantity(selectedProduct.id, selectedProductQuantity)}
                  >ADD TO CART</button>
                </div>
                <section className="delivery-details" aria-labelledby="delivery-details-title">
                  <h2 id="delivery-details-title">Delivery Details</h2>
                  <div className="delivery-pincode">
                    <input type="text" aria-label="Enter your pincode" placeholder="Enter your pincode" />
                    <button type="button">Check</button>
                  </div>
                </section>
                {selectedProduct.id === 'lavender' && (
                  <div className="product-information">
                    <section className="product-info-section" aria-labelledby="product-ingredients-title">
                      <h2 id="product-ingredients-title">Ingredients</h2>
                      <dl className="product-ingredients">
                        {roles.map(([ingredient, purpose]) => (
                          <div key={ingredient}><dt>{ingredient}</dt><dd>{purpose}</dd></div>
                        ))}
                      </dl>
                      <p className="product-info-note">Science fact: Tiny traces of metals can affect a cosmetic formula. Disodium EDTA binds them, helping keep the product stable.</p>
                    </section>

                    <details className="product-accordion">
                      <summary>How to use</summary>
                      <p>Apply an appropriate amount to clean, dry skin. Gently massage until fully absorbed. Use twice daily, morning and evening. Reapply as needed, especially when skin feels dry. Use regularly to help maintain soft, hydrated skin.</p>
                    </details>

                    <details className="product-accordion">
                      <summary>Ideal for</summary>
                      <p>Everyday body care for skin that feels dry or needs lightweight hydration.</p>
                    </details>

                    <details className="product-accordion">
                      <summary>Caution</summary>
                      <p>For external use only. Avoid contact with eyes. If irritation occurs, discontinue use. Keep out of reach of children.</p>
                      <p><strong>Storage instructions:</strong> Store refrigerated at approximately 10°C (50°F). Protect from direct sunlight and heat. Keep tightly closed after use. This preservative-free formulation should be stored as recommended to preserve product quality.</p>
                    </details>

                  </div>
                )}
              </div>
            </div>
            <section className="you-might-like" aria-labelledby="you-might-like-title">
              <h2 id="you-might-like-title">You might also like</h2>
              <div className="grid">
                {products.filter(product => product.id !== selectedProduct.id).map(product => (
                  <article className="card" key={product.id + product.category} style={{ '--accent': product.accent, '--soft': product.soft }}>
                    <button className="card-image-button card-img" type="button" aria-label={`View details for ${product.name}, ${product.scent}`} onClick={() => openProduct(product)}>
                      <img src={product.image} alt={`${product.name}, ${product.scent}`} loading="lazy" />
                    </button>
                    <div className="card-body">
                      <h3><button className="card-title-button" type="button" onClick={() => openProduct(product)}>{product.name}</button></h3>
                      <p className="scent"><i />{product.scent} scent</p>
                      <p className="small">{product.blurb}</p>
                      <div className="card-foot"><span>{product.size}{product.price ? ` | ${price(product)}` : ''}</span>
                        {cart[product.id] ? (
                          <div className="quantity quantity--small" aria-label={`${product.name} quantity`}>
                            <button aria-label={`Remove one ${product.name}`} onClick={() => updateQuantity(product.id, -1)}>−</button>
                            <span aria-live="polite">{cart[product.id]}</span>
                            <button aria-label={`Add one ${product.name}`} onClick={() => updateQuantity(product.id, 1)}>+</button>
                          </div>
                        ) : <button className="btn btn--sm" onClick={() => updateQuantity(product.id, 1)}>Add to bag</button>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
        </main>
      ) : (
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
                <button className="card-image-button card-img" type="button" aria-label={`View details for ${p.name}, ${p.scent}`} onClick={() => openProduct(p)}>
                  <img src={p.image} alt={`${p.name}, ${p.scent}`} loading="lazy" />
                </button>
                <div className="card-body">
                  <h3><button className="card-title-button" type="button" onClick={() => openProduct(p)}>{p.name}</button></h3>
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
      )}

      <footer id="contact" className="foot">
        <div><span className="logo">CAPRIONIX</span><p>Research-led beauty. Made in India.</p></div>
        <div><p>www.caprionix.com</p></div>
        <div><p>For external use only.</p><p>Store refrigerated at about 10°C.</p></div>
      </footer>
    </>
  )
}
