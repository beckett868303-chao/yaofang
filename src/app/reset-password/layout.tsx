import { Suspense } from 'react'

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      {children}
    </Suspense>
  )
}