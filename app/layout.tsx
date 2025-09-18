import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Islanders Cricket Club | San Antonio Cricket League',
  description: 'Official website of Islanders Cricket Club - Premier cricket team in San Antonio Cricket League (SACL). Match fixtures, results, player profiles, and team updates.',
  keywords: 'cricket, San Antonio, SACL, Islanders Cricket Club, cricket team, matches, fixtures, results',
  authors: [{ name: 'Islanders Cricket Club' }],
  openGraph: {
    title: 'Islanders Cricket Club | SACL',
    description: 'Premier cricket team in San Antonio Cricket League',
    url: 'https://islanderscricketclub.org',
    siteName: 'Islanders Cricket Club',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Islanders Cricket Club',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Islanders Cricket Club | SACL',
    description: 'Premier cricket team in San Antonio Cricket League',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}