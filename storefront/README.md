# Maison — Luxury Fashion & Cosmetics Storefront

Modern, responsive Next.js storefront for fashion and cosmetics. Driven by a `theme-config.json` for runtime theming, GraphQL API integration, and reusable component library.

---

## Project Structure

```
storefront/
├── theme-config.json              # Dynamic theme configuration
├── styles/
│   ├── globals.css                # CSS variables + reset + typography
│   └── components.css             # All component styles
├── components/ui/
│   ├── Button.tsx                 # Button (solid | outline | disabled, sm | lg)
│   └── Components.tsx             # ProductCard, Input, Banner, Card
├── lib/
│   ├── api.ts                     # REST + GraphQL API client
│   └── useTheme.ts                # Theme loader hook (with caching)
└── app/
    ├── page.tsx                   # Home page
    ├── category/[slug]/page.tsx   # Category + 404 pages
    ├── product/[slug]/page.tsx    # Product detail (safe HTML)
    ├── checkout/page.tsx          # Checkout with stepper
    ├── auth/pages.tsx             # SignIn, SignUp (NextAuth + Google)
    ├── blog/pages.tsx             # Blog listing + detail (headless WP)
    └── profile/pages.tsx          # Orders, Wishlist, Address, Security
```

---

## Setup

```bash
npm install
# or
yarn install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_GRAPHQL_URL=https://your-api.com/graphql
NEXT_PUBLIC_API_URL=https://your-api.com
NEXT_PUBLIC_WP_URL=https://your-wordpress.com

# NextAuth
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
```

### Run

```bash
npm run dev
```

---

## Theme Configuration

Edit `theme-config.json` to change colors, typography, spacing, and more. The `useTheme()` hook:
1. Checks `sessionStorage` cache (1-hour TTL)
2. Fetches from `/api/theme-config` at runtime
3. Falls back to CSS `:root` defaults if no remote config

To serve the theme config dynamically, create `app/api/theme-config/route.ts`:

```ts
export async function GET() {
  const config = await db.getThemeConfig(); // from your DB/CMS
  return Response.json(config);
}
```

---

## Components

### Button
```tsx
<Button
  title="Add to Cart"
  action={() => handleAddToCart()}
  variant="solid"          // 'solid' | 'outline' | 'disabled'
  size="lg"                // 'sm' | 'lg'
  loading={false}
  classes="my-extra-class"
/>
```

### ProductCard
```tsx
<ProductCard
  product={product}
  onAddToCart={(p) => addToCart(p)}
  onWishlistToggle={(p) => toggleWishlist(p)}
  wishlisted={wishlist.has(product.id)}
/>
```

### Input
```tsx
<Input
  type="email"             // 'number' | 'text' | 'email' | 'search'
  label="Email Address"
  placeholder="you@example.com"
  value={email}
  onChange={(val) => setEmail(val)}
  error="Invalid email"
/>
```

### Banner
```tsx
<Banner
  size="hero"              // 'hero' | 'lg' | 'sm'
  title="New Season Collection"
  subtitle="Discover curated luxury"
  cta={{ label: 'Shop Now', href: '/category/new-in' }}
  backgroundImage="https://..."
/>
```

### Card
```tsx
<Card elevated onClick={() => navigate(href)}>
  <p>Card content</p>
</Card>
```

---

## API Integration

### GraphQL (Cart)
```ts
import { api } from '@/lib/api';

// Add to cart
await api.addToCart(productID, quantity);

// Get cart
const cart = await api.getCart();

// Update cart item
await api.updateCartItem(itemID, newQuantity);
```

### REST (Customer)
```ts
const customer = await api.createCustomer({
  email: 'user@example.com',
  first_name: 'Afolabi',
  last_name: 'Samuel',
  phone: '09036771120',
});
```

---

## Checkout Flow (Stepper)

1. **Confirm Items** — Review cart
2. **User Info** — Delivery details (creates customer + address)
3. **Payment** — Apply coupon → pay via Paystack/Flutterwave

---

## Auth (NextAuth)

Pages at `/auth/signin` and `/auth/signup` support:
- Email/password credentials
- Google OAuth (`provider: 'google'`)

Install & configure:
```bash
npm install next-auth
```

Add `app/api/auth/[...nextauth]/route.ts` with Google + Credentials providers.

---

## Blog (Headless WordPress)

Set `NEXT_PUBLIC_WP_URL` to your WordPress instance. Pages:
- `/blog` — Fetches posts from `wp-json/wp/v2/posts?_embed`
- `/blog/[slug]` — Fetches single post, renders safe HTML content

---

## Mobile Responsive

All pages are mobile-first responsive:
- Navbar collapses nav links on mobile
- Product grid: 4-col → 3-col → 2-col → 1-col
- Checkout layout stacks on mobile
- Profile sidebar hidden on mobile
- Blog grid: 3-col → 2-col → 1-col

---

## Design System

**Fonts:** Cormorant Garamond (display) + DM Sans (body)  
**Colors:** Warm ivory surfaces, deep charcoal primary, antique gold accent  
**Motion:** Fade-up reveals, staggered grid animation, hover scale effects  
**Theme:** All values via CSS custom properties — override any at runtime via `theme-config.json`