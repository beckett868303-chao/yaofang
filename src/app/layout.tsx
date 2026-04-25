import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { AuthProvider } from '@/contexts/AuthContext'
import NavBar from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '个人病历系统 2.0',
  description: '个人病历系统 2.0，支持多图上传、智能识别和深度检索',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <NavBar />
            
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            
            <footer className="bg-primary text-white py-4">
              <div className="container mx-auto px-4 text-center">
                <p>© 2026 个人病历系统 2.0 - 专业、高效、安全</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}