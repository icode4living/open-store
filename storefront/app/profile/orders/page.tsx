'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { ProfileLayout } from "@/components/ProfileLayout";
import { api } from "@/lib/api";
import type { CustomerOrders } from "@/types/order";

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'var(--color-success)',
  PROCESSING: 'var(--color-accent)',
  PENDING: 'var(--color-accent)',
  CANCELLED: 'var(--color-error)',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);

const formatStatus = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase();

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<CustomerOrders[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!session?.user?.id) return;

    api
      .getOrders(session.user.id)
      .then((data) => {
        setOrders(data ?? []);
      })
      .catch((error) => {
        //console.error('Failed to load orders:', error);
      });
  }, [session?.user?.id]);

  const toggleOrderItems = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <ProfileLayout active="My Orders">
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.75rem',
          fontWeight: 400,
          marginBottom: '0.35rem',
        }}
      >
        My Orders
      </h2>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.92rem',
          marginBottom: 'var(--space-xl)',
        }}
      >
        Tap an order to quickly view its items and totals.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {orders.length === 0 ? (
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-xl)',
              color: 'var(--color-text-muted)',
            }}
          >
            Your orders will appear here once you place one.
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = Boolean(expandedOrders[order.id]);

            return (
              <div
                key={order.id}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-lg)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 'var(--space-md)',
                  }}
                >
                  <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        marginBottom: '0.25rem',
                        wordBreak: 'break-word',
                      }}
                    >
                      {order.ublinvoiceID}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      · {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: 'white',
                        background: STATUS_COLORS[order.status] || 'var(--color-primary)',
                      }}
                    >
                      {formatStatus(order.status)}
                    </span>
                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        marginTop: 'var(--space-sm)',
                      }}
                    >
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 'var(--space-md)',
                    paddingTop: 'var(--space-md)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleOrderItems(order.id)}
                    aria-expanded={isExpanded}
                    style={{
                      flex: '1 1 220px',
                      minHeight: '44px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      background: isExpanded ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: 'var(--color-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>{isExpanded ? 'Hide Order Items' : 'View Order Items'}</span>
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>{isExpanded ? '▴' : '▾'}</span>
                  </button>

                  {order.status === 'PENDING' && (
                    <button
                      type="button"
                      style={{
                        flex: '1 1 180px',
                        minHeight: '44px',
                        padding: '0.8rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid color-mix(in srgb, var(--color-accent) 45%, white)',
                        background: 'transparent',
                        color: 'var(--color-accent)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Track Order
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: 'var(--space-md)',
                      padding: 'var(--space-md)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {order.items.map((item, index) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          paddingBottom: index === order.items.length - 1 ? 0 : '0.75rem',
                          borderBottom:
                            index === order.items.length - 1
                              ? 'none'
                              : '1px solid var(--color-border)',
                        }}
                      >
                        <div
                          style={{
                            width: '3rem',
                            height: '3rem',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            background: 'white',
                            border: '1px solid var(--color-border)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontSize: '1rem' }}>🛍️</span>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 600,
                              wordBreak: 'break-word',
                            }}
                          >
                            {item.productName}
                          </p>
                          <p
                            style={{
                              margin: '0.2rem 0 0',
                              fontSize: '0.8rem',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            Qty: {item.qty}
                          </p>
                        </div>

                        <p
                          style={{
                            margin: 0,
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </ProfileLayout>
  );
}
