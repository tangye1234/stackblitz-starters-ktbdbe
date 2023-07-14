import Link from 'next/link';

export const runtime = 'edge';

export default function Index() {
  return <Link href="/login">Login</Link>;
}
