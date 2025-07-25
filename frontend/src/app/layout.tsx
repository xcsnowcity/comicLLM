import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { ToastProvider } from '@/components/Toast'
import { I18nProvider } from '@/lib/i18nContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ComicLLM',
  description: 'Local comic text extraction and translation tool using LLMs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          <ToastProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Navigation />
              {children}
            </div>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  )
}