'use client';

import { useRouter, usePathname } from 'next/navigation';

export function Modal({ path, children }) {
  const router = useRouter();
  const pathname = usePathname();

  if (path !== pathname) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 700, height: 400, border: '1px solid black' }}>
        {children}
        <button onClick={() => router.back()}>Close me</button>
      </div>
    </div>
  );
}
