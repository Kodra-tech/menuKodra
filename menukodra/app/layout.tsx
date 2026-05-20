import type { Metadata } from 'next'
import { Karla, Playfair_Display } from 'next/font/google'
import './globals.css'

const karla = Karla({
  variable: '--font-karla',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MenuKodra',
  description: 'Menú digital para restaurantes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${karla.variable} ${playfair.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: 'var(--font-karla), system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  )
}
