import type { ReactNode } from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/hooks/useAuth"
import "./globals.css"

export const metadata: Metadata = {
  title: "SplitChain Pay – Decentralized Payment Splitting",
  description: "Split payments with friends and merchants using crypto on the Internet Computer",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-white text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
