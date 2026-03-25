'use client'
import { ProfileLayout } from "@/components/ProfileLayout";
import { useSession } from "next-auth/react";
import { CustomerOrders } from "@/types/order";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
const MOCK_ORDERS = [
  { id: 'ORD-0012', date: '2026-02-15', status: 'Delivered', total: 22000, items: 2 },
  { id: 'ORD-0009', date: '2026-01-28', status: 'In Transit', total: 12000, items: 1 },
  { id: 'ORD-0005', date: '2025-12-10', status: 'Delivered', total: 34000, items: 3 },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered: 'var(--color-success)',
  //'In Transit': 'var(--color-warning)',
  Processing: 'var(--color-accent)',
  Cancelled: 'var(--color-error)',
};

export default function OrdersPage() {
    const { data: session } = useSession();
    const [orders, setOrders ] = useState<CustomerOrders[]>()
useEffect(()=>{
if(session?.user?.id) return
  api.getOrders(session?.user?.id).then((data)=>{
    setOrders(data)
  })
},[session?.user?.id])
  return (
    <ProfileLayout active="My Orders">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400, marginBottom: 'var(--space-xl)' }}>My Orders</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {orders?.map((order) => (
          <div key={order.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
              <div>
                <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>{order.ublinvoiceID}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'white', background: STATUS_COLORS[order.status] || 'gray' }}>
                  {order.status}
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: 'var(--space-sm)' }}>
                  {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(order.total)}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-md)' }}>
              <button style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>View Details →</button>
              {order.status === 'PENDING' && (
                <button style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Track Order</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ProfileLayout>
  );
}
