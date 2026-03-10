'use client'
import { Button, Input } from '@/components/ui';
import { ProfileLayout } from '../../../components/ProfileLayout';

export default function ShippingAddressPage() {
  const addresses = [
    { id: '1', name: 'Afolabi Samuel', line1: '6 Liberty Road', city: 'Ibadan', state: 'Oyo', phone: '09036771120', primary: true },
  ];

  return (
    <ProfileLayout active="Shipping Address">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400 }}>Shipping Addresses</h2>
        <Button title="+ Add Address" action={() => {}} variant="outline" size="sm" classes="btn--dark" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-lg)' }}>
        {addresses.map((addr) => (
          <div key={addr.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${addr.primary ? 'var(--color-accent)' : 'var(--color-border)'}`, padding: 'var(--space-xl)', position: 'relative' }}>
            {addr.primary && <span style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>Primary</span>}
            <p style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>{addr.name}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{addr.line1}<br />{addr.city}, {addr.state}<br />{addr.phone}</p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
              <button style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit</button>
              <button style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </ProfileLayout>
  );
}