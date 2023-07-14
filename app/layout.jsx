import '../styles/globals.css';

export default function RootLayout({ children, modal }) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}
