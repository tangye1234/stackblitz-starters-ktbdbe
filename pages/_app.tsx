import '@styles/globals.css';
import { AppProps } from 'next/app';
import { useState } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export default function App({ Component, pageProps }: AppProps) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
