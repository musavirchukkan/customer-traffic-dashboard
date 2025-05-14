// apps/frontend/src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Customer Traffic Dashboard',
  description: 'Monitor and analyze customer traffic in stores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '1rem'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              Customer Traffic Dashboard
            </h1>
          </div>
        </header>
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
          {children}
        </main>
        <footer style={{
          backgroundColor: 'white',
          boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '1rem',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          &copy; {new Date().getFullYear()} Customer Traffic Dashboard
        </footer>
      </body>
    </html>
  );
}