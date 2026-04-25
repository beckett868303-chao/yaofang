'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function NavBar() {
  const { user, loading, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:text-secondary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <h1 className="text-2xl font-bold">个人病历系统 2.1</h1>
          </Link>
          <div className="flex items-center space-x-4">
            {loading ? (
              <span className="text-sm">加载中...</span>
            ) : user ? (
              <>
                <span className="text-sm">
                  {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors text-sm"
                >
                  登出
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-white text-primary rounded hover:bg-gray-100 transition-colors font-medium"
              >
                登录/注册
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}