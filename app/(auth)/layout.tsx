// src/app/(auth)/layout.tsx
import { Inter } from 'next/font/google'

// Load font without className to avoid hydration mismatch
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Add this for better font loading behavior
  variable: '--font-inter' // Use CSS variable instead
})

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-50 font-sans">
        <main className="min-h-screen flex items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  )
}