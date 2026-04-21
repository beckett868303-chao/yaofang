import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '中医影像病历管理系统',
  description: '专业的中医影像病历管理系统，支持多图上传、智能识别和深度检索',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* 导航栏 */}
          <header className="bg-primary text-white shadow-md">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3 hover:text-secondary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <h1 className="text-2xl font-bold">中医影像病历管理系统</h1>
                </Link>
              </div>
            </div>
          </header>
          
          {/* 主内容区 */}
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          
          {/* 页脚 */}
          <footer className="bg-primary text-white py-4">
            <div className="container mx-auto px-4 text-center">
              <p>© 2026 中医影像病历管理系统 - 专业、高效、安全</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}