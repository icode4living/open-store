'use client';
import React, { useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui';
import useTheme from '@/lib/useTheme';
import { Cart } from '@/types/cart';
type Step = 0 | 1 | 2;

const STEPS = [
  { label: 'Confirm Items', num: 1 },
  { label: 'Your Info',     num: 2 },
  { label: 'Payment',       num: 3 },
];

// Mock cart items
const MOCK_ITEMS = [
  { id: '1', name: 'Long Sleeve Shirt', price: 12000, qty: 2, img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&q=80' },
  { id: '2', name: 'Men Polo',          price: 10000, qty: 1, img: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=200&q=80' },
];


export default function CheckoutPage() {
  const [step, setStep]   = useState<Step>(0);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartItem, setCartItem] = useState<Cart>()
  const { config, loading: themeLoading, store } = useTheme();

  const [info, setInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '',
  });

  const subtotal = cartItem?.items!.reduce((acc, i) => acc + i.product?.regularPrice * i.quantity, 0);
  //const discount = couponApplied ? subtotal * 0.1 : 0;
  const shipping  = 2000;
  const total     = subtotal //- discount + shipping;

  const handleNextStep = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    if (step < 2) setStep((step + 1) as Step);
  };

function formatNGN(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: store?.currency, minimumFractionDigits: 0 }).format(n);
}
//load cart items
useEffect(()=>{
     import('@/lib/api').then(({ api }) =>
      api.getCart().then(({data})=>{
        setCartItem(data)
      })
     );
},[])
  return (
    <>
      <header className="navbar">
        <a href="/" className="navbar__logo">Maison</a>
        <div className="navbar__actions">
          <a href="/" style={{ fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>← Continue Shopping</a>
        </div>
      </header>

      <main style={{ background: 'var(--color-surface)', minHeight: '100vh', paddingBottom: 'var(--space-4xl)' }}>
        <div className="container" style={{ paddingTop: 'var(--space-3xl)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, marginBottom: 'var(--space-3xl)' }}>Checkout</h1>

          {/* Stepper */}
          <div className="stepper">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="stepper__step">
                  <div className={`stepper__num${i < step ? ' stepper__num--done' : i === step ? ' stepper__num--active' : ''}`}>
                    {i < step ? '✓' : s.num}
                  </div>
                  <span className={`stepper__label${i === step ? ' stepper__label--active' : ''}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`stepper__line${i < step ? ' stepper__line--done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="checkout-layout">
            {/* Left: Step content */}
            <div className="checkout-main animate-fade-up">

              {/* ── Step 0: Confirm Items ── */}
              {step === 0 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, marginBottom: 'var(--space-xl)' }}>Review Your Order</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {cartItem?.items.map((item) => (
                      <div key={item.product.id} style={{ display: 'flex', gap: 'var(--space-lg)', background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', border: '1px solid var(--color-border)', alignItems: 'center' }}>
                        <img src={item.product?.mainImageURL} alt={item.product.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.product.name}</p>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Qty: {item.quantity}</p>
                        </div>
                        <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{formatNGN(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 1: User Info ── */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, marginBottom: 'var(--space-xl)' }}>Delivery Information</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                    <Input type="text" label="First Name" placeholder="Afolabi" value={info.firstName} onChange={(v) => setInfo({ ...info, firstName: v })} />
                    <Input type="text" label="Last Name" placeholder="Samuel" value={info.lastName} onChange={(v) => setInfo({ ...info, lastName: v })} />
                    <Input type="email" label="Email Address" placeholder="you@example.com" value={info.email} onChange={(v) => setInfo({ ...info, email: v })} />
                    <Input type="number" label="Phone Number" placeholder="0803..." value={info.phone} onChange={(v) => setInfo({ ...info, phone: v })} />
                    <div style={{ gridColumn: 'span 2' }}>
                      <Input type="text" label="Address" placeholder="6 Liberty Road" value={info.address} onChange={(v) => setInfo({ ...info, address: v })} />
                    </div>
                    <Input type="text" label="City" placeholder="Ibadan" value={info.city} onChange={(v) => setInfo({ ...info, city: v })} />
                    <Input type="text" label="State" placeholder="Oyo" value={info.state} onChange={(v) => setInfo({ ...info, state: v })} />
                  </div>
                </div>
              )}

              {/* ── Step 2: Payment + Coupon ── */}
              {step === 2 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, marginBottom: 'var(--space-xl)' }}>Payment</h2>

                  {/* Coupon */}
                  <div style={{ padding: 'var(--space-lg)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-xl)' }}>
                    <p className="t-caption" style={{ marginBottom: 'var(--space-md)' }}>Apply Coupon</p>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                      <Input type="text" placeholder="Enter coupon code" value={coupon} onChange={setCoupon} />
                      <Button
                        title={couponApplied ? 'Applied ✓' : 'Apply'}
                        action={() => { if (coupon.trim()) setCouponApplied(true); }}
                        variant={couponApplied ? 'disabled' : 'outline'}
                        size="sm"
                        classes="btn--dark"
                      />
                    </div>
                    {couponApplied && <p style={{ color: 'var(--color-success)', fontSize: '0.8rem', marginTop: 'var(--space-sm)' }}>10% discount applied!</p>}
                  </div>

                  {/* Payment method (placeholder for payment gateway) */}
                  <div style={{ padding: 'var(--space-xl)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>Secure payment powered by</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)', opacity: 0.5 }}>
                      {['Paystack', 'Flutterwave', 'Visa', 'Mastercard'].map((p) => (
                        <span key={p} style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.4rem 0.8rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'var(--space-2xl)' }}>
                <Button
                  title={step === 2 ? 'Place Order' : 'Continue'}
                  action={handleNextStep}
                  variant="solid"
                  size="lg"
                  loading={loading}
                  classes=""
                />
                {step > 0 && (
                  <button
                    onClick={() => setStep((step - 1) as Step)}
                    style={{ marginLeft: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: '0.8rem', textDecoration: 'underline' }}
                  >
                    Go back
                  </button>
                )}
              </div>
            </div>

            {/* Right: Order summary */}
            <div className="checkout-summary">
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-xl)', position: 'sticky', top: 90 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, marginBottom: 'var(--space-lg)' }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {[
                    { label: 'Subtotal', value: subtotal },
                    { label: 'Discount', value: -discount },
                    { label: 'Shipping', value: shipping },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      <span>{label}</span>
                      <span style={{ color: value < 0 ? 'var(--color-success)' : 'inherit' }}>{value < 0 ? `−${formatNGN(-value)}` : formatNGN(value)}</span>
                    </div>
                  ))}
                  <div className="divider" style={{ margin: 'var(--space-sm) 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>Total</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNGN(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .checkout-layout { display: grid; grid-template-columns: 1fr 360px; gap: var(--space-3xl); align-items: start; }
        @media (max-width: 900px) { .checkout-layout { grid-template-columns: 1fr; } .checkout-summary { order: -1; } }
      `}</style>
    </>
  );
}