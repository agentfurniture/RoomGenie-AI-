import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RoomGenie AI — AI Interior Design Platform',
  description: 'Transform any room into your dream space using AI. Upload a photo, choose a style, get a photorealistic redesign in seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
