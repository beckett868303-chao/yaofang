import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export default function Home() {
  return (
    <div className="space-y-8">
      {/* 功能导航 - 只保留两个核心功能 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/upload" className="tcm-card hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center p-8">
            <Plus className="w-16 h-16 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-2">药方上传</h3>
            <p className="text-gray-600 text-center">拍照或选择图片上传药方，AI智能识别药材和克数</p>
          </div>
        </Link>

        <Link href="/patients" className="tcm-card hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center p-8">
            <Search className="w-16 h-16 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-2">病人查询</h3>
            <p className="text-gray-600 text-center">通过姓名、手机号或症状快速查找病人信息</p>
          </div>
        </Link>
      </div>
    </div>
  )
}