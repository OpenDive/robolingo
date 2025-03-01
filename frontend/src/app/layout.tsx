import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ChallengeProvider } from '@/contexts/ChallengeContext'
import { WalletProvider } from '@/contexts/WalletContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Language Learning App',
  description: 'Learn languages with friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <ChallengeProvider>
            {children}
          </ChallengeProvider>
        </WalletProvider>
      </body>
    </html>
  )
}