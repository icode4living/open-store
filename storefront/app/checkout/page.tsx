// app/checkout/page.tsx
//
// Checkout flow — progressive disclosure model:
//
//   STEP 0  Review cart items
//   STEP 1  Identity  → email first (detect if logged-in / existing account)
//                     → Google autofill shortcut
//                     → guest-to-account opt-in
//   STEP 2  Delivery  → if logged-in: pick from saved addresses OR add new
//                     → guest: inline address form (fields revealed progressively)
//   STEP 3  Payment   → coupon → payment gateway
//
// API sequence:
//   1. createGuestCustomer(email, name, phone)   → customerId
//   2. createAddress({ ...fields, customerID })  → addressId
//   3. placeOrder(cartId, customerId, addressId) → orderId  (stub)
//
'use client';

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { Button, Input } from '@/components/ui';
import { api } from '@/lib/api';
import {
  type Cart, type CartItem,
  cartSubtotal, shippingCost, cartTotal, cartItemCount, SHIPPING_THRESHOLD,
} from '@/types/cart';
import type { AddressInput, Address } from '@/types/address';
import type { Customer} from '@/types/customer'; // re-exported below

// ─── Extended types ────────────────────────────────────────────────────────────

// Session stub — replace with real NextAuth session hook
interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  addresses?: Address[];
}

// Google Identity Services credential payload (subset)
interface GoogleCredential {
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  picture?: string;
  sub: string; // Google user ID
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isPhone = (v: string) => /^[0-9+\s\-()]{7,15}$/.test(v.trim());

function validate(fields: Partial<AddressInput>): Record<string, string> {
  const e: Record<string, string> = {};
  if (!fields.firstName?.trim())  e.firstName    = 'First name is required';
  if (!fields.lastName?.trim())   e.lastName     = 'Last name is required';
  if (!fields.email?.trim())      e.email        = 'Email is required';
  else if (!isEmail(fields.email)) e.email       = 'Enter a valid email address';
  if (!fields.phone?.trim())      e.phone        = 'Phone number is required';
  else if (!isPhone(fields.phone)) e.phone       = 'Enter a valid phone number';
  if (!fields.addressLine1?.trim()) e.addressLine1 = 'Street address is required';
  if (!fields.city?.trim())       e.city         = 'City is required';
  if (!fields.state?.trim())      e.state        = 'State is required';
  if (!fields.country?.trim())    e.country      = 'Country is required';
  return e;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NGN = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(n ?? 0);

const STEPS = [
  { num: 1, label: 'Review'   },
  { num: 2, label: 'You'      },
  { num: 3, label: 'Delivery' },
  { num: 4, label: 'Payment'  },
];

// ─── Mock saved addresses for logged-in demo ──────────────────────────────────
const MOCK_SESSION: SessionUser | null = {
  id: 'usr-001',
  name: 'Afolabi Samuel',
  email: 'samuelsamafolabi@outlook.com',
  phone: '09036771120',
  image: undefined,
  addresses: [
    {
      id: 'addr-saved-001',
      firstName: 'Afolabi', lastName: 'Samuel',
     //email: 'samuelsamafolabi@outlook.com',
      //phone: '09036771120',
      addressLine1: '6 Liberty Road',
      city: 'Ibadan', state: 'Oyo',
      postalCode: '200001', country: 'Nigeria',
      //customerID: 'usr-001',
    },
  ],
};

// Toggle this to test guest flow
const USE_MOCK_SESSION = false;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Inline validation-aware input wrapper */
function Field({
  label, type = 'text', placeholder, value, onChange, error, hint, required,
}: {
  label: string;
  type?: 'text' | 'email' | 'number' | 'password';
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="co-field">
      <label className="co-field__label">
        {label}{required && <span className="co-field__req">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`co-field__input${error ? ' co-field__input--err' : ''}`}
        autoComplete={
          type === 'email' ? 'email'
          : label.toLowerCase().includes('first') ? 'given-name'
          : label.toLowerCase().includes('last') ? 'family-name'
          : label.toLowerCase().includes('phone') ? 'tel'
          : label.toLowerCase().includes('city') ? 'address-level2'
          : label.toLowerCase().includes('state') ? 'address-level1'
          : label.toLowerCase().includes('country') ? 'country-name'
          : label.toLowerCase().includes('postal') ? 'postal-code'
          : label.toLowerCase().includes('address') ? 'street-address'
          : undefined
        }
      />
      {error && <p className="co-field__err">{error}</p>}
      {hint && !error && <p className="co-field__hint">{hint}</p>}
    </div>
  );
}

/** Progress stepper */
function Stepper({ step, total }: { step: number; total: typeof STEPS }) {
  return (
    <div className="co-stepper">
      {total.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="co-stepper__item">
            <div className={[
              'co-stepper__dot',
              i < step  ? 'co-stepper__dot--done'   : '',
              i === step ? 'co-stepper__dot--active' : '',
            ].filter(Boolean).join(' ')}>
              {i < step
                ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                : s.num
              }
            </div>
            <span className={`co-stepper__lbl${i === step ? ' co-stepper__lbl--active' : ''}`}>
              {s.label}
            </span>
          </div>
          {i < total.length - 1 && (
            <div className={`co-stepper__line${i < step ? ' co-stepper__line--done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/** Cart review row */
function ReviewItem({ item }: { item: CartItem }) {
  const p = item.product;
  const [imgErr, setImgErr] = useState(false);
  const price = (p?.salePrice ?? 0) * item.quantity;
  return (
    <div className="co-review-row">
      <div className="co-review-row__img-wrap">
        <img
          src={!imgErr && p?.mainImageURL ? p.mainImageURL : 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=100&q=60'}
          alt={p?.name}
          className="co-review-row__img"
          onError={() => setImgErr(true)}
        />
      </div>
      <div className="co-review-row__info">
        <p className="co-review-row__name">{p?.name ?? 'Item'}</p>
        <p className="co-review-row__desc">{p?.shortDescription}</p>
        <p className="co-review-row__qty">Qty: {item.quantity}</p>
      </div>
      <p className="co-review-row__price">{NGN(price)}</p>
    </div>
  );
}

/** Saved address card */
function AddressCard({
  address, selected, onSelect,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`addr-card${selected ? ' addr-card--selected' : ''}`}
      onClick={onSelect}
      type="button"
    >
      <div className="addr-card__check">
        {selected && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        )}
      </div>
      <div className="addr-card__body">
        <p className="addr-card__name">{address.firstName} {address.lastName}</p>
        <p className="addr-card__line">{address.addressLine1}</p>
        <p className="addr-card__line">{address.city}, {address.state}{address.postalCode ? ` ${address.postalCode}` : ''}</p>
        <p className="addr-card__line">{address.country} </p>
      </div>
    </button>
  );
}

/** Order summary sidebar */
function OrderSummary({
  cart, couponRate, couponCode,
}: {
  cart: Cart; couponRate: number; couponCode: string;
}) {
  const items    = cart.items ?? [];
  const sub      = cartSubtotal(items);
  const discount = sub * couponRate;
  const ship     = shippingCost(sub);
  const total    = cartTotal(items, discount);
  const count    = cartItemCount(items);

  const rows = [
    { label: `Subtotal (${count} item${count !== 1 ? 's' : ''})`, value: sub,       muted: false },
    ...(discount > 0 ? [{ label: `Coupon (${Math.round(couponRate * 100)}%)`, value: -discount, muted: false }] : []),
    { label: 'Shipping', value: ship, muted: true },
  ];

  return (
    <aside className="co-summary">
      <h3 className="co-summary__title">Order Summary</h3>
      <div className="co-summary__lines">
        {rows.map((r) => (
          <div key={r.label} className="co-summary__line">
            <span className={r.muted ? 'co-summary__ll--muted' : ''}>{r.label}</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '.88rem',
              color: r.value < 0 ? 'var(--color-success)' : r.muted ? 'var(--color-text-muted)' : 'inherit',
            }}>
              {r.value === 0 && r.label === 'Shipping'
                ? <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Free</span>
                : `${r.value < 0 ? '−' : ''}${NGN(Math.abs(r.value))}`}
            </span>
          </div>
        ))}
      </div>
      <div className="co-summary__div" />
      <div className="co-summary__total">
        <span>Total</span>
        <span>{NGN(total)}</span>
      </div>
      {/* Mini cart preview */}
      <div className="co-summary__items">
        {items.slice(0, 3).map((item) => {
          const p = item.product;
          return (
            <div key={item.productID} className="co-summary__item">
              <div className="co-summary__item-img-wrap">
                <img
                  src={p?.mainImageURL || 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=60&q=60'}
                  alt={p?.name}
                  className="co-summary__item-img"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=60&q=60'; }}
                />
                <span className="co-summary__item-qty">{item.quantity}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="co-summary__item-name">{p?.name}</p>
                <p className="co-summary__item-price">{NGN((p?.salePrice ?? 0) * item.quantity)}</p>
              </div>
            </div>
          );
        })}
        {items.length > 3 && (
          <p style={{ fontSize: '.72rem', color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 'var(--space-sm)' }}>
            +{items.length - 3} more item{items.length - 3 > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main CheckoutPage
// ═══════════════════════════════════════════════════════════════════
export default function CheckoutPage() {
  // ── Session / auth ─────────────────────────────────────────────
  const session: SessionUser | null = USE_MOCK_SESSION ? MOCK_SESSION : null;
  const isLoggedIn = !!session;

  // ── Steps: 0=Review 1=Identity 2=Delivery 3=Payment ───────────
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  // ── Cart ───────────────────────────────────────────────────────
  const [cart, setCart]           = useState<Cart>({ id: '', items: [] });
  const [cartLoading, setCartLoad] = useState(true);

  // ── Identity step state ────────────────────────────────────────
  const [email, setEmail]               = useState(session?.email ?? '');
  const [emailChecked, setEmailChecked] = useState(isLoggedIn);
  const [emailLoading, setEmailLoad]    = useState(false);
  const [accountExists, setAccExists]   = useState(isLoggedIn);
  const [firstName, setFirstName]       = useState(session ? session.name.split(' ')[0] : '');
  const [lastName, setLastName]         = useState(session ? session.name.split(' ').slice(1).join(' ') : '');
  const [phone, setPhone]               = useState(session?.phone ?? '');
  const [createAccount, setCreateAcc]   = useState(false);
  const [password, setPassword]         = useState('');
  const [googleUser, setGoogleUser]     = useState<GoogleCredential | null>(null);

  // ── Delivery step state ────────────────────────────────────────
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    session?.addresses?.[0]?.id ?? ''
  );
  const [addingNew, setAddingNew]   = useState(!isLoggedIn);
  const [addressForm, setAddr]      = useState<Omit<AddressInput, 'customerID' | 'firstName' | 'lastName' | 'email' | 'phone'>>({
    addressLine1: '', city: '', state: '', postalCode: '', country: 'Nigeria',
  });
  // Progressive disclosure: how many address fields have been revealed
  const [addrReveal, setAddrReveal] = useState(1); // 1 = only street shown

  // ── Payment step state ─────────────────────────────────────────
  const [coupon, setCoupon]             = useState('');
  const [couponCode, setCouponCode]     = useState('');
  const [couponRate, setCouponRate]     = useState(0);
  const [couponLoading, setCoupLoad]    = useState(false);
  const [couponErr, setCouponErr]       = useState('');
  const [paymentMethod, setPayMethod]   = useState<'paystack' | 'flutterwave' | 'offline'|''>('');

  // ── Submission state ───────────────────────────────────────────
  const [submitting, setSubmitting]     = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [apiError, setApiError]         = useState('');
  const [customerId, setCustomerId]     = useState(session?.id ?? '');
  const [addressId, setAddressId]       = useState(session?.addresses?.[0]?.id ?? '');
  const [orderPlaced, setOrderPlaced]   = useState(false);
  const [orderId, setOrderId]           = useState('');

  const COUPONS: Record<string, number> = { MAISON10: 0.10, LUXURY20: 0.20, WELCOME5: 0.05 };

  // ── Load cart ──────────────────────────────────────────────────
  useEffect(() => {
    api.getCart().then(( data ) => {
      setCart(data);
      setCartLoad(false);
    }).catch(() => setCartLoad(false));
  }, []);

  const items    = cart.items ?? [];
  const subtotal = cartSubtotal(items);

  // ── Google Sign-In ─────────────────────────────────────────────
  // Injects the Google Identity Services script and renders the one-tap button.
  // In production: replace CLIENT_ID with your real Google OAuth client ID.
  useEffect(() => {
    if (isLoggedIn || step !== 1) return;
    const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? 'YOUR_GOOGLE_CLIENT_ID';

    const script = document.createElement('script');
    script.src   = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      (window as any).google?.accounts?.id.initialize({
        client_id: CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      (window as any).google?.accounts?.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: 360, text: 'continue_with', shape: 'rectangular' }
      );
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [step, isLoggedIn]);

  // Decode the Google JWT credential (no library needed — just parse the payload)
  const handleGoogleCallback = useCallback((response: { credential: string }) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1])) as GoogleCredential;
      setGoogleUser(payload);
      setEmail(payload.email);
      setFirstName(payload.given_name);
      setLastName(payload.family_name);
      setEmailChecked(true);
      setAccExists(false); // treat as new guest unless API says otherwise
    } catch { /* malformed JWT */ }
  }, []);

  // ── Email check ────────────────────────────────────────────────
  // Simulates "check if account exists" — replace with real API call.
  const checkEmail = async () => {
    if (!isEmail(email)) { setErrors({ email: 'Enter a valid email' }); return; }
    setEmailLoad(true); setErrors({});
    await new Promise((r) => setTimeout(r, 600));
    // Mock: if email includes "maison" → existing account
    const exists = email.toLowerCase().includes('maison');
    setAccExists(exists);
    setEmailChecked(true);
    setEmailLoad(false);
    if (exists && isLoggedIn) {
      // Auto-fill from session
      setFirstName(session!.name.split(' ')[0]);
      setLastName(session!.name.split(' ').slice(1).join(' '));
      setPhone(session?.phone ?? '');
    }
  };

  // ── Field-level progressive reveal for address form ────────────
  // Each field appears only after the previous one has a value
  const revealAddr = (fieldIdx: number, val: string) => {
    if (val.trim() && fieldIdx + 1 > addrReveal) {
      setAddrReveal(fieldIdx + 1);
    }
  };

  // ── Step validation ────────────────────────────────────────────
  const validateStep = (): boolean => {
    setApiError('');
    if (step === 1) {
      const e: Record<string, string> = {};
      if (!firstName.trim()) e.firstName = 'Required';
      if (!lastName.trim())  e.lastName  = 'Required';
      if (!isPhone(phone))   e.phone     = 'Enter a valid phone number';
      if (createAccount && password.length < 8) e.password = 'Minimum 8 characters';
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    if (step === 2 && addingNew) {
      const e: Record<string, string> = {};
      if (!addressForm.addressLine1.trim()) e.addressLine1 = 'Required';
      if (!addressForm.city.trim())         e.city         = 'Required';
      if (!addressForm.state.trim())        e.state        = 'Required';
      if (!addressForm.country.trim())      e.country      = 'Required';
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    if (step === 2 && !addingNew && !selectedAddressId) {
      setApiError('Please select a delivery address.');
      return false;
    }
    if (step === 3 && !paymentMethod) {
      setApiError('Please select a payment method.');
      return false;
    }
    return true;
  };

  // ── Create customer + address (called when leaving step 1→2) ──
  const createCustomerAndAddress = async (): Promise<boolean> => {
    try {
      // 1. Create customer
      const custRes = await api.createGuestCustomer({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      });
      if (!custRes?.id) { setApiError('Could not create account. Please try again.'); return false; }
      setCustomerId(custRes.id);
      return true;
    } catch (err) {
      setApiError('Server error. Please try again.');
      return false;
    }
  };

  const createDeliveryAddress = async (cId: string): Promise<boolean> => {
    try {
      const addrInput: AddressInput = addingNew ? {
        firstName, lastName, email, phone,
        addressLine1: addressForm.addressLine1,
        city: addressForm.city,
        state: addressForm.state,
        postalCode: addressForm.postalCode,
        country: addressForm.country,
        customerID: cId,
      } : {
        ...(session!.addresses!.find((a) => a.id === selectedAddressId)!),
        customerID: cId,
      };
      const res = await api.createAddress(addrInput);
      if (!res?.id) { setApiError('Could not save address. Please try again.'); return false; }
      setAddressId(res.id);
      return true;
    } catch {
      setApiError('Server error. Please try again.');
      return false;
    }
  };

  // ── Place order stub ───────────────────────────────────────────
  const placeOrder = async (): Promise<boolean> => {
    const res = await api.checkout(email, paymentMethod)
   /*
    await new Promise((r) => setTimeout(r, 900));
    const id = `ORD-${Date.now().toString().slice(-6)}`;
    setOrderId(id);*/
    return true;
  };

  // ── Step navigation ────────────────────────────────────────────
  const handleNext = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setApiError('');
    try {
      if (step === 1) {
        // Submit customer info first, then advance to delivery
        if (!isLoggedIn) {
          const ok = await createCustomerAndAddress();
          if (!ok) { setSubmitting(false); return; }
        }
      }
      if (step === 2) {
        // Now create address
        const cId = customerId || session!.id;
        const ok = await createDeliveryAddress(cId);
        if (!ok) { setSubmitting(false); return; }
      }
      if (step === 3) {
        const ok = await placeOrder();
        if (!ok) { setSubmitting(false); return; }
        setOrderPlaced(true);
        setSubmitting(false);
        return;
      }
      setStep((s) => (s + 1) as any);
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    setApiError('');
    setErrors({});
    setStep((s) => Math.max(0, s - 1) as any);
  };

  // ── Coupon apply ───────────────────────────────────────────────
  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCoupLoad(true); setCouponErr('');
    await new Promise((r) => setTimeout(r, 500));
    const rate = COUPONS[coupon.trim().toUpperCase()];
    if (rate) { setCouponCode(coupon.trim().toUpperCase()); setCouponRate(rate); setCoupon(''); }
    else setCouponErr('Invalid or expired code. Try MAISON10.');
    setCoupLoad(false);
  };

  // ──────────────────────────────────────────────────────────────
  // Order placed — success screen
  // ──────────────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="co-success">
        <div className="co-success__card animate-scale-in">
          <div className="co-success__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="co-success__h1">Order Confirmed!</h1>
          <p className="co-success__order">Order #{orderId}</p>
          <p className="co-success__msg">
            Thank you for your purchase. A confirmation email has been sent to <strong>{email}</strong>.
            We'll notify you when your order ships.
          </p>
          <div className="co-success__actions">
            <a href="/profile/orders" className="btn btn--solid btn--lg">Track My Order</a>
            <a href="/" className="btn btn--outline btn--dark btn--lg">Continue Shopping</a>
          </div>
        </div>
        <style>{STYLES}</style>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Main checkout UI
  // ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Minimal header */}
      <header className="co-header">
        <a href="/" className="co-header__logo">Maison</a>
        <div className="co-header__center">
          {step > 0 && <Stepper step={step - 0} total={STEPS} />}
        </div>
        <a href="/cart" className="co-header__back">
          ← Cart
        </a>
      </header>

      <main className="co-main">
        <div className="container co-container">

          {/* Left: step content */}
          <div className="co-content animate-fade-up" key={step}>

            {/* ══════════════════════════════════════════════════
                STEP 0 — Review cart
            ══════════════════════════════════════════════════ */}
            {step === 0 && (
              <div>
                <div className="co-step-head">
                  <span className="co-step-head__num">1</span>
                  <h2 className="co-step-head__title">Review Your Order</h2>
                </div>

                {cartLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {[1,2].map((i) => (
                      <div key={i} className="skeleton" style={{ height: 84, borderRadius: 'var(--radius-lg)' }} />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="co-empty">
                    <p>Your cart is empty.</p>
                    <a href="/category/all" className="btn btn--solid btn--sm" style={{ marginTop: 'var(--space-md)' }}>
                      Browse Products
                    </a>
                  </div>
                ) : (
                  <div className="co-review-list">
                    {items.map((item) => <ReviewItem key={item.productID} item={item} />)}
                  </div>
                )}

                <a href="/cart" className="co-edit-cart">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit cart
                </a>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                STEP 1 — Identity (email → name → phone → opt-in)
                Progressive disclosure: each group revealed only
                after the previous has a valid value.
            ══════════════════════════════════════════════════ */}
            {step === 1 && (
              <div>
                <div className="co-step-head">
                  <span className="co-step-head__num">2</span>
                  <h2 className="co-step-head__title">Your Details</h2>
                  <p className="co-step-head__sub">We'll use this to confirm your order and keep you updated.</p>
                </div>

                {/* ── If logged in: show prefilled identity card ── */}
                {isLoggedIn ? (
                  <div className="co-identity-card">
                    <div className="co-identity-card__avatar">
                      {session.image
                        ? <img src={session.image} alt={session.name} />
                        : session.name.charAt(0).toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="co-identity-card__name">{session.name}</p>
                      <p className="co-identity-card__email">{session.email}</p>
                      {session.phone && <p className="co-identity-card__phone">{session.phone}</p>}
                    </div>
                    <span className="co-identity-card__badge">Signed in</span>
                  </div>
                ) : (
                  <>
                    {/* ── Google autofill ── */}
                    {!googleUser && !emailChecked && (
                      <div className="co-google-section">
                        <p className="co-google-section__label">Quick checkout with Google</p>
                        <div id="google-signin-btn" />
                        <div className="co-or"><span>or continue with email</span></div>
                      </div>
                    )}

                    {/* ── Google prefilled banner ── */}
                    {googleUser && (
                      <div className="co-google-prefilled">
                        <img
                          src={googleUser.picture ?? `https://ui-avatars.com/api/?name=${googleUser.given_name}&background=C8A96E&color=0A0A0A`}
                          alt={googleUser.name}
                          className="co-google-prefilled__avatar"
                        />
                        <div>
                          <p className="co-google-prefilled__name">{googleUser.name}</p>
                          <p className="co-google-prefilled__email">{googleUser.email}</p>
                        </div>
                        <button
                          className="co-google-prefilled__remove"
                          onClick={() => { setGoogleUser(null); setEmail(''); setFirstName(''); setLastName(''); setEmailChecked(false); }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* ── Email field (always visible) ── */}
                    <Field
                      label="Email address"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(v) => { setEmail(v); setEmailChecked(false); setErrors({}); }}
                      error={errors.email}
                      required
                    />

                    {/* Email check button (shown if not yet checked) */}
                    {!emailChecked && (
                      <button
                        className="btn btn--solid btn--sm co-email-next"
                        onClick={checkEmail}
                        disabled={emailLoading || !email.trim()}
                      >
                        {emailLoading
                          ? <><span className="btn__loader" style={{ width: 12, height: 12 }} /> Checking…</>
                          : 'Continue →'
                        }
                      </button>
                    )}

                    {/* ── Revealed after email check: name + phone ── */}
                    {emailChecked && (
                      <div className="co-reveal animate-fade-up">
                        {accountExists && (
                          <div className="co-returning">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                            </svg>
                            Welcome back! Sign in or continue as guest.
                          </div>
                        )}

                        <div className="co-name-row">
                          <Field label="First name" placeholder="Afolabi" value={firstName}
                            onChange={(v) => { setFirstName(v); setErrors((e) => ({ ...e, firstName: '' })); }}
                            error={errors.firstName} required />
                          <Field label="Last name" placeholder="Samuel" value={lastName}
                            onChange={(v) => { setLastName(v); setErrors((e) => ({ ...e, lastName: '' })); }}
                            error={errors.lastName} required />
                        </div>

                        {/* Phone revealed after both name fields have values */}
                        {(firstName.trim() || googleUser) && (
                          <div className="animate-fade-up">
                            <Field label="Phone number" type="text" placeholder="0803 000 0000"
                              value={phone}
                              onChange={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: '' })); }}
                              error={errors.phone}
                              hint="We'll only contact you about your delivery"
                              required />
                          </div>
                        )}

                        {/* Guest-to-account opt-in — revealed after phone has a value */}
                        {phone.trim().length > 5 && !isLoggedIn && (
                          <div className="co-create-account animate-fade-up">
                            <label className="co-toggle">
                              <input
                                type="checkbox"
                                checked={createAccount}
                                onChange={(e) => setCreateAcc(e.target.checked)}
                                className="co-toggle__input"
                              />
                              <span className="co-toggle__track">
                                <span className="co-toggle__thumb" />
                              </span>
                              <span className="co-toggle__label">
                                Save my details — create a free account
                              </span>
                            </label>
                            <p className="co-create-account__hint">
                              Track orders, reorder easily, and get exclusive offers.
                            </p>

                            {createAccount && (
                              <div className="animate-fade-up" style={{ marginTop: 'var(--space-md)' }}>
                                <Field label="Create password" type="password"
                                  placeholder="At least 8 characters"
                                  value={password}
                                  onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: '' })); }}
                                  error={errors.password}
                                  hint={password.length > 0 && password.length < 8 ? `${8 - password.length} more characters needed` : undefined}
                                  required />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                STEP 2 — Delivery address
            ══════════════════════════════════════════════════ */}
            {step === 2 && (
              <div>
                <div className="co-step-head">
                  <span className="co-step-head__num">3</span>
                  <h2 className="co-step-head__title">Delivery Address</h2>
                  <p className="co-step-head__sub">Where should we send your order?</p>
                </div>

                {/* Saved addresses (logged-in only) */}
                {isLoggedIn && session.addresses && session.addresses.length > 0 && (
                  <>
                    {!addingNew && (
                      <div className="co-addr-list">
                        {session.addresses.map((a) => (
                          <AddressCard
                            key={a.id}
                            address={a}
                            selected={selectedAddressId === a.id}
                            onSelect={() => setSelectedAddressId(a.id)}
                          />
                        ))}
                        <button
                          className="co-addr-new-btn"
                          onClick={() => { setAddingNew(true); setErrors({}); }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          Add a new address
                        </button>
                      </div>
                    )}

                    {addingNew && (
                      <button className="co-addr-cancel" onClick={() => setAddingNew(false)}>
                        ← Use a saved address
                      </button>
                    )}
                  </>
                )}

                {/* Address form — progressive disclosure */}
                {addingNew && (
                  <div className="co-addr-form animate-fade-up">
                    {/* Street address — always visible first */}
                    <Field label="Street address" placeholder="12 Marina Road"
                      value={addressForm.addressLine1}
                      onChange={(v) => {
                        setAddr((a) => ({ ...a, addressLine1: v }));
                        setErrors((e) => ({ ...e, addressLine1: '' }));
                        revealAddr(0, v);
                      }}
                      error={errors.addressLine1} required />

                    {/* City — revealed after street is filled */}
                    {(addrReveal > 0 || addressForm.addressLine1) && (
                      <div className="animate-fade-up">
                        <Field label="City" placeholder="Lagos"
                          value={addressForm.city}
                          onChange={(v) => {
                            setAddr((a) => ({ ...a, city: v }));
                            setErrors((e) => ({ ...e, city: '' }));
                            revealAddr(1, v);
                          }}
                          error={errors.city} required />
                      </div>
                    )}

                    {/* State — revealed after city */}
                    {(addrReveal > 1 || addressForm.city) && (
                      <div className="animate-fade-up">
                        <Field label="State / Province" placeholder="Lagos"
                          value={addressForm.state}
                          onChange={(v) => {
                            setAddr((a) => ({ ...a, state: v }));
                            setErrors((e) => ({ ...e, state: '' }));
                            revealAddr(2, v);
                          }}
                          error={errors.state} required />
                      </div>
                    )}

                    {/* Postal + Country in a row — revealed after state */}
                    {(addrReveal > 2 || addressForm.state) && (
                      <div className="co-name-row animate-fade-up">
                        <Field label="Postal code" placeholder="100001"
                          value={addressForm.postalCode ?? ''}
                          onChange={(v) => setAddr((a) => ({ ...a, postalCode: v }))} />
                        <Field label="Country" placeholder="Nigeria"
                          value={addressForm.country}
                          onChange={(v) => {
                            setAddr((a) => ({ ...a, country: v }));
                            setErrors((e) => ({ ...e, country: '' }));
                          }}
                          error={errors.country} required />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                STEP 3 — Payment
            ══════════════════════════════════════════════════ */}
            {step === 3 && (
              <div>
                <div className="co-step-head">
                  <span className="co-step-head__num">4</span>
                  <h2 className="co-step-head__title">Payment</h2>
                  <p className="co-step-head__sub">Your order total is <strong>{NGN(cartTotal(items, cartSubtotal(items) * couponRate))}</strong></p>
                </div>

                {/* Coupon */}
                <div className="co-coupon-box">
                  <p className="co-coupon-box__lbl">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    Apply a coupon code
                  </p>
                  {couponCode ? (
                    <div className="co-coupon-applied">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                      <span><strong>{couponCode}</strong> — {Math.round(couponRate * 100)}% off applied</span>
                      <button onClick={() => { setCouponCode(''); setCouponRate(0); }} className="co-coupon-applied__x">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="co-coupon-row">
                        <input className="co-coupon-input" type="text" placeholder="e.g. MAISON10"
                          value={coupon}
                          onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponErr(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                          disabled={couponLoading}
                          autoCapitalize="characters"
                        />
                        <button className="btn btn--solid btn--sm" onClick={applyCoupon}
                          disabled={couponLoading || !coupon.trim()}>
                          {couponLoading ? <span className="btn__loader" style={{ width: 12, height: 12 }} /> : 'Apply'}
                        </button>
                      </div>
                      {couponErr && <p className="co-coupon-err">{couponErr}</p>}
                    </>
                  )}
                </div>

                {/* Payment method selection */}
                <div className="co-pay-methods">
                  <p className="co-pay-methods__lbl">Select payment method</p>
                  <div className="co-pay-grid">
                    {([
                      { id: 'paystack',    name: 'Paystack',    icon: '🔐', desc: 'Cards, USSD, bank transfer' },
                      { id: 'flutterwave', name: 'Flutterwave', icon: '⚡', desc: 'Cards, mobile money, QR' },
                      { id: 'offline', name: 'Bank Transfer', icon: '⚡', desc: 'Bank transfer' },

                    ] as const).map((m) => (
                      <button
                        key={m.id}
                        className={`co-pay-option${paymentMethod === m.id ? ' co-pay-option--selected' : ''}`}
                        onClick={() => setPayMethod(m.id)}
                        type="button"
                      >
                        <span className="co-pay-option__icon">{m.icon}</span>
                        <span className="co-pay-option__name">{m.name}</span>
                        <span className="co-pay-option__desc">{m.desc}</span>
                        {paymentMethod === m.id && (
                          <span className="co-pay-option__check">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust */}
                <div className="co-trust">
                  {[
                    ['🔒', 'SSL encrypted checkout'],
                    ['↩️', '30-day easy returns'],
                    ['💳', 'Visa · Mastercard · Verve'],
                  ].map(([icon, txt]) => (
                    <span key={txt} className="co-trust__item"><span>{icon}</span>{txt}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── API error ── */}
            {apiError && (
              <div className="co-api-err animate-fade-up">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {apiError}
              </div>
            )}

            {/* ── Navigation buttons ── */}
            <div className="co-nav">
              <Button
                title={
                  step === 0 ? 'Continue to Details →' :
                  step === 1 ? (submitting ? 'Saving…' : 'Continue to Delivery →') :
                  step === 2 ? (submitting ? 'Saving…' : 'Continue to Payment →') :
                  submitting ? 'Placing Order…' : 'Place Order'
                }
                action={handleNext}
                variant={submitting ? 'disabled' : 'solid'}
                size="lg"
                loading={submitting}
                classes="co-nav__next"
              />
              {step > 0 && (
                <button className="co-nav__back" onClick={goBack} disabled={submitting}>
                  ← Back
                </button>
              )}
            </div>
          </div>

          {/* Right: order summary */}
          <OrderSummary cart={cart} couponRate={couponRate} couponCode={couponCode} />

        </div>
      </main>

      <style>{STYLES}</style>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `

/* ── Header ── */
.co-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 var(--space-xl); height: 64px;
  background: rgba(248,245,240,.97); backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
  position: sticky; top: 0; z-index: 100;
  gap: var(--space-xl);
}
.co-header__logo { font-family: var(--font-display); font-size: 1.4rem; font-weight: 300; letter-spacing: .15em; text-transform: uppercase; flex-shrink: 0; }
.co-header__center { flex: 1; display: flex; justify-content: center; }
.co-header__back { font-size: .72rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--color-text-muted); flex-shrink: 0; transition: color var(--transition-fast); }
.co-header__back:hover { color: var(--color-primary); }

/* ── Stepper ── */
.co-stepper { display: flex; align-items: center; gap: 0; }
.co-stepper__item { display: flex; align-items: center; gap: 6px; }
.co-stepper__dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 700; border: 1.5px solid var(--color-border); color: var(--color-text-muted); background: white; flex-shrink: 0; transition: all .25s ease; }
.co-stepper__dot--active { border-color: var(--color-accent); background: var(--color-accent); color: var(--color-primary); }
.co-stepper__dot--done   { border-color: var(--color-primary); background: var(--color-primary); color: white; }
.co-stepper__lbl { font-size: .62rem; letter-spacing: .06em; text-transform: uppercase; color: var(--color-text-muted); white-space: nowrap; }
.co-stepper__lbl--active { color: var(--color-primary); font-weight: 700; }
.co-stepper__line { width: 28px; height: 1px; background: var(--color-border); margin: 0 4px; }
.co-stepper__line--done { background: var(--color-primary); }
@media (max-width: 600px) { .co-stepper__lbl { display: none; } .co-stepper__line { width: 16px; } }

/* ── Layout ── */
.co-main { background: var(--color-surface); min-height: calc(100vh - 64px); padding-bottom: var(--space-4xl); }
.co-container { display: grid; grid-template-columns: 1fr 360px; gap: var(--space-3xl); align-items: start; padding-top: var(--space-3xl); }

/* ── Step head ── */
.co-step-head { margin-bottom: var(--space-2xl); }
.co-step-head__num { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: var(--color-primary); color: white; border-radius: 50%; font-size: .72rem; font-weight: 700; margin-bottom: var(--space-sm); }
.co-step-head__title { font-family: var(--font-display); font-size: 1.75rem; font-weight: 300; line-height: 1.2; }
.co-step-head__sub { font-size: .85rem; color: var(--color-text-muted); margin-top: var(--space-sm); }

/* ── Fields ── */
.co-field { display: flex; flex-direction: column; gap: .3rem; }
.co-field__label { font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--color-text-muted); }
.co-field__req { color: var(--color-error); margin-left: 2px; }
.co-field__input { border: 1.5px solid var(--color-border); border-radius: var(--radius-md); padding: .72rem var(--space-md); font-size: .92rem; font-family: var(--font-body); color: var(--color-text); background: white; outline: none; transition: border-color .15s, box-shadow .15s; width: 100%; }
.co-field__input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 12%, transparent); }
.co-field__input--err { border-color: var(--color-error); }
.co-field__input--err:focus { box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 12%, transparent); }
.co-field__err  { font-size: .72rem; color: var(--color-error); }
.co-field__hint { font-size: .72rem; color: var(--color-text-muted); }

/* ── Content panel ── */
.co-content {
  background: white; border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: var(--space-2xl);
  display: flex; flex-direction: column; gap: var(--space-lg);
}

/* ── Google section ── */
.co-google-section { margin-bottom: var(--space-md); }
.co-google-section__label { font-size: .72rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: var(--space-md); }
.co-or { position: relative; text-align: center; margin: var(--space-lg) 0 var(--space-md); }
.co-or::before { content: ''; position: absolute; inset: 50% 0 auto; height: 1px; background: var(--color-border); }
.co-or span { position: relative; background: white; padding: 0 var(--space-md); font-size: .72rem; color: var(--color-text-muted); }

/* ── Google prefilled banner ── */
.co-google-prefilled { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md) var(--space-lg); background: #f0f7ff; border: 1.5px solid #b3d0ff; border-radius: var(--radius-lg); margin-bottom: var(--space-lg); }
.co-google-prefilled__avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.co-google-prefilled__name { font-weight: 600; font-size: .88rem; }
.co-google-prefilled__email { font-size: .75rem; color: var(--color-text-muted); }
.co-google-prefilled__remove { margin-left: auto; display: flex; color: var(--color-text-muted); padding: 4px; border-radius: 50%; transition: background .15s, color .15s; }
.co-google-prefilled__remove:hover { background: var(--color-border); color: var(--color-error); }

/* ── Email next ── */
.co-email-next { margin-top: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

/* ── Returning user notice ── */
.co-returning { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: #f0faf4; border: 1px solid var(--color-success); border-radius: var(--radius-md); font-size: .8rem; color: var(--color-success); margin-bottom: var(--space-md); }

/* ── Name row (2 col) ── */
.co-name-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
.co-reveal { display: flex; flex-direction: column; gap: var(--space-lg); }

/* ── Identity card (logged in) ── */
.co-identity-card { display: flex; align-items: center; gap: var(--space-lg); padding: var(--space-lg) var(--space-xl); background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border); }
.co-identity-card__avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--color-accent); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.2rem; font-weight: 500; flex-shrink: 0; overflow: hidden; }
.co-identity-card__avatar img { width: 100%; height: 100%; object-fit: cover; }
.co-identity-card__name  { font-weight: 600; }
.co-identity-card__email { font-size: .78rem; color: var(--color-text-muted); }
.co-identity-card__phone { font-size: .78rem; color: var(--color-text-muted); margin-top: 1px; }
.co-identity-card__badge { margin-left: auto; font-size: .62rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--color-success); padding: .2rem .6rem; border: 1px solid var(--color-success); border-radius: var(--radius-full); }

/* ── Guest-to-account toggle ── */
.co-create-account { padding: var(--space-lg); background: var(--color-surface); border-radius: var(--radius-lg); border: 1.5px dashed var(--color-border); display: flex; flex-direction: column; gap: var(--space-sm); }
.co-create-account__hint { font-size: .75rem; color: var(--color-text-muted); }
.co-toggle { display: flex; align-items: center; gap: var(--space-md); cursor: pointer; }
.co-toggle__input { position: absolute; opacity: 0; width: 0; height: 0; }
.co-toggle__track { width: 40px; height: 22px; background: var(--color-border); border-radius: var(--radius-full); position: relative; flex-shrink: 0; transition: background .2s; }
.co-toggle__input:checked ~ .co-toggle__track { background: var(--color-primary); }
.co-toggle__thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; background: white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .2s; }
.co-toggle__input:checked ~ .co-toggle__track .co-toggle__thumb { transform: translateX(18px); }
.co-toggle__label { font-size: .85rem; font-weight: 500; }

/* ── Saved address cards ── */
.co-addr-list { display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-lg); }
.addr-card { display: flex; align-items: flex-start; gap: var(--space-md); padding: var(--space-lg); border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); background: white; text-align: left; cursor: pointer; transition: border-color .15s, background .15s, box-shadow .15s; width: 100%; }
.addr-card:hover { border-color: var(--color-text-muted); box-shadow: var(--shadow-sm); }
.addr-card--selected { border-color: var(--color-primary); background: var(--color-surface); }
.addr-card__check { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--color-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; transition: all .15s; }
.addr-card--selected .addr-card__check { background: var(--color-primary); border-color: var(--color-primary); color: white; }
.addr-card__name { font-weight: 600; font-size: .88rem; margin-bottom: 3px; }
.addr-card__line { font-size: .78rem; color: var(--color-text-muted); line-height: 1.5; }
.co-addr-new-btn { display: flex; align-items: center; gap: var(--space-sm); font-size: .78rem; font-weight: 600; letter-spacing: .04em; color: var(--color-primary); padding: var(--space-md); border: 1.5px dashed var(--color-border); border-radius: var(--radius-lg); width: 100%; justify-content: center; transition: all .15s; }
.co-addr-new-btn:hover { border-color: var(--color-primary); background: var(--color-surface); }
.co-addr-cancel { font-size: .75rem; font-weight: 500; color: var(--color-text-muted); letter-spacing: .04em; margin-bottom: var(--space-lg); display: inline-flex; align-items: center; gap: 4px; }
.co-addr-cancel:hover { color: var(--color-primary); }
.co-addr-form { display: flex; flex-direction: column; gap: var(--space-lg); }

/* ── Coupon ── */
.co-coupon-box { background: var(--color-surface); border: 1.5px dashed var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); margin-bottom: var(--space-xl); }
.co-coupon-box__lbl { display: flex; align-items: center; gap: var(--space-sm); font-size: .68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: var(--space-sm); }
.co-coupon-row { display: flex; gap: var(--space-sm); }
.co-coupon-input { flex: 1; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); padding: .5rem var(--space-md); font-family: var(--font-mono); font-size: .85rem; font-weight: 700; letter-spacing: .06em; color: var(--color-primary); background: white; outline: none; transition: border-color .15s; }
.co-coupon-input:focus { border-color: var(--color-accent); }
.co-coupon-input::placeholder { font-family: var(--font-body); font-weight: 400; letter-spacing: 0; color: var(--color-text-muted); }
.co-coupon-applied { display: flex; align-items: center; gap: var(--space-md); background: #f0faf4; border: 1.5px solid var(--color-success); border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md); font-size: .82rem; font-weight: 500; }
.co-coupon-applied__x { margin-left: auto; display: flex; color: var(--color-text-muted); padding: 3px; border-radius: 50%; transition: background .15s, color .15s; }
.co-coupon-applied__x:hover { background: var(--color-border); color: var(--color-error); }
.co-coupon-err { color: var(--color-error); font-size: .74rem; margin-top: var(--space-sm); }

/* ── Payment method ── */
.co-pay-methods { margin-bottom: var(--space-xl); }
.co-pay-methods__lbl { font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: var(--space-md); }
.co-pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.co-pay-option { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 3px; padding: var(--space-lg); border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); background: white; cursor: pointer; text-align: left; transition: all .15s; }
.co-pay-option:hover { border-color: var(--color-text-muted); box-shadow: var(--shadow-sm); }
.co-pay-option--selected { border-color: var(--color-primary); background: var(--color-surface); }
.co-pay-option__icon { font-size: 1.3rem; margin-bottom: 2px; }
.co-pay-option__name { font-weight: 700; font-size: .88rem; }
.co-pay-option__desc { font-size: .72rem; color: var(--color-text-muted); }
.co-pay-option__check { position: absolute; top: var(--space-sm); right: var(--space-sm); width: 20px; height: 20px; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; }

/* ── Trust strip ── */
.co-trust { display: flex; flex-wrap: wrap; gap: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--color-border); margin-top: var(--space-md); }
.co-trust__item { display: flex; align-items: center; gap: var(--space-sm); font-size: .72rem; color: var(--color-text-muted); }

/* ── API error ── */
.co-api-err { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-md) var(--space-lg); background: #fef0f0; border: 1px solid var(--color-error); border-radius: var(--radius-md); font-size: .82rem; color: var(--color-error); }

/* ── Nav buttons ── */
.co-nav { display: flex; align-items: center; gap: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--color-border); margin-top: var(--space-md); }
.co-nav__next { flex-shrink: 0; }
.co-nav__back { font-size: .78rem; font-weight: 500; color: var(--color-text-muted); transition: color .15s; }
.co-nav__back:hover:not(:disabled) { color: var(--color-primary); }

/* ── Review list ── */
.co-review-list { display: flex; flex-direction: column; gap: var(--space-sm); }
.co-review-row { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border); }
.co-review-row__img-wrap { width: 64px; height: 64px; border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0; background: var(--color-border); }
.co-review-row__img { width: 100%; height: 100%; object-fit: cover; }
.co-review-row__info { flex: 1; min-width: 0; }
.co-review-row__name { font-weight: 600; font-size: .9rem; }
.co-review-row__desc { font-size: .74rem; color: var(--color-text-muted); margin-top: 1px; }
.co-review-row__qty  { font-size: .72rem; color: var(--color-text-muted); margin-top: 3px; }
.co-review-row__price { font-family: var(--font-mono); font-weight: 600; flex-shrink: 0; }

.co-edit-cart { display: inline-flex; align-items: center; gap: 5px; font-size: .72rem; font-weight: 500; letter-spacing: .05em; text-transform: uppercase; color: var(--color-text-muted); margin-top: var(--space-md); transition: color .15s; }
.co-edit-cart:hover { color: var(--color-primary); }

.co-empty { text-align: center; padding: var(--space-xl); color: var(--color-text-muted); }

/* ── Order summary ── */
.co-summary { background: white; border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-xl); position: sticky; top: 80px; }
.co-summary__title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 400; margin-bottom: var(--space-lg); }
.co-summary__lines { display: flex; flex-direction: column; gap: var(--space-md); }
.co-summary__line { display: flex; justify-content: space-between; align-items: center; font-size: .85rem; }
.co-summary__ll--muted { color: var(--color-text-muted); }
.co-summary__div { height: 1px; background: var(--color-border); margin: var(--space-lg) 0; }
.co-summary__total { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 1rem; font-weight: 700; margin-bottom: var(--space-xl); }
.co-summary__items { display: flex; flex-direction: column; gap: var(--space-sm); padding-top: var(--space-lg); border-top: 1px solid var(--color-border); }
.co-summary__item { display: flex; align-items: center; gap: var(--space-md); }
.co-summary__item-img-wrap { position: relative; width: 44px; height: 44px; border-radius: var(--radius-md); overflow: hidden; background: var(--color-border); flex-shrink: 0; }
.co-summary__item-img { width: 100%; height: 100%; object-fit: cover; }
.co-summary__item-qty { position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; background: var(--color-primary); color: white; border-radius: 50%; font-size: .58rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.co-summary__item-name  { font-size: .78rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.co-summary__item-price { font-family: var(--font-mono); font-size: .74rem; color: var(--color-text-muted); }

/* ── Success screen ── */
.co-success { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-surface); padding: var(--space-xl); }
.co-success__card { background: white; border-radius: var(--radius-xl); border: 1px solid var(--color-border); padding: var(--space-3xl); text-align: center; max-width: 480px; width: 100%; box-shadow: var(--shadow-xl); }
.co-success__icon { width: 72px; height: 72px; border-radius: 50%; background: var(--color-success); color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-xl); }
.co-success__h1 { font-family: var(--font-display); font-size: 2rem; font-weight: 300; margin-bottom: var(--space-sm); }
.co-success__order { font-family: var(--font-mono); font-size: .85rem; color: var(--color-accent); font-weight: 600; margin-bottom: var(--space-xl); }
.co-success__msg { font-size: .88rem; color: var(--color-text-muted); line-height: 1.7; margin-bottom: var(--space-2xl); }
.co-success__actions { display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .co-container { grid-template-columns: 1fr; }
  .co-summary { position: static; order: -1; }
  .co-header__center { display: none; }
}
@media (max-width: 480px) {
  .co-content { padding: var(--space-lg); }
  .co-name-row { grid-template-columns: 1fr; }
  .co-pay-grid { grid-template-columns: 1fr; }
  .co-success__card { padding: var(--space-xl); }
}
`;