import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RoomForge AI - AI Real Estate Staging Studio',
  description: 'AI-powered room staging and object removal for real estate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

