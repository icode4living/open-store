'use client'
import { useState } from "react";
import { ProfileLayout } from "@/components/ProfileLayout";
import { Button, Input } from "@/components/ui";

export default function SecurityPage() {
  const [form, setForm]   = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = async () => {
    if (!form.current || !form.newPass || form.newPass !== form.confirm) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false); setSuccess(true);
  };

  return (
    <ProfileLayout active="Security">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400, marginBottom: 'var(--space-xl)' }}>Security</h2>
      <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: 'var(--space-2xl)', maxWidth: 480 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, marginBottom: 'var(--space-xl)' }}>Change Password</h3>
        {success ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
            <p style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>✓</p>
            <p style={{ fontWeight: 600 }}>Password updated successfully</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <Input type="text" label="Current Password" placeholder="••••••••" value={form.current} onChange={(v) => setForm({ ...form, current: v })} />
            <Input type="text" label="New Password" placeholder="Min. 8 characters" value={form.newPass} onChange={(v) => setForm({ ...form, newPass: v })} />
            <Input type="text" label="Confirm Password" placeholder="Repeat new password" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} error={form.confirm && form.newPass !== form.confirm ? 'Passwords do not match' : ''} />
            <Button title="Update Password" action={handleChange} variant={loading ? 'disabled' : 'solid'} size="lg" loading={loading} classes="" />
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}
