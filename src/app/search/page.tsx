'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Search, User, Phone, FileText, Calendar, Image as ImageIcon, X } from 'lucide-react'

interface SearchResult {
  id: number
  type: 'patient' | 'visit' | 'prescription'
  patientName: string
  phone?: string
  allergies?: string
  visitDate?: string
  diagnosis?: string
  prescriptionId?: number
  imagePath?: string
  relevance: number
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath)
  }

  const handleClosePreview = () => {
    setSelectedImage(null)
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch(`/api/search?term=${encodeURIComponent(searchTerm)}`)
      
      if (!response.ok) {
        throw new Error('搜索失败')
      }
      
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('搜索出错:', error)
      alert('搜索失败，请稍后重试')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient':
        return <User className="w-5 h-5 text-primary" />
      case 'visit':
        return <Calendar className="w-5 h-5 text-primary" />
      case 'prescription':
        return <FileText className="w-5 h-5 text-primary" />
      default:
        return <Search className="w-5 h-5 text-primary" />
    }
  }

  const getResultDescription = (result: SearchResult) => {
    switch (result.type) {
      case 'patient':
        return (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <Phone className="w-4 h-4 inline mr-1" /> {result.phone}
            </p>
            <p className="text-sm text-gray-600">
              过敏史: {result.allergies || '无'}
            </p>
          </div>
        )
      case 'visit':
        return (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <Calendar className="w-4 h-4 inline mr-1" /> {result.visitDate ? new Date(result.visitDate).toLocaleString('zh-CN') : ''}
            </p>
            <p className="text-sm text-gray-600">
              诊断: {result.diagnosis}
            </p>
          </div>
        )
      case 'prescription':
        return (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <Calendar className="w-4 h-4 inline mr-1" /> {result.visitDate ? new Date(result.visitDate).toLocaleString('zh-CN') : ''}
            </p>
            <p className="text-sm text-gray-600">
              药方ID: {result.prescriptionId}
            </p>
            {result.imagePath && (
              <div className="mt-2">
                <img
                  src={`/api/images/${encodeURIComponent((result.imagePath || '').replace('/uploads/', ''))}?t=${Date.now()}`}
                  alt="药方"
                  className="w-24 h-32 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(`/api/images/${encodeURIComponent((result.imagePath || '').replace('/uploads/', ''))}`)}
                />
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* 页面标题和返回按钮 */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center text-primary hover:text-primary/80">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>返回首页</span>
        </Link>
        <h2 className="text-2xl font-bold text-primary">深度检索系统</h2>
      </div>

      {/* 搜索框 */}
      <div className="tcm-card">
        <div className="flex space-x-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索病人姓名、手机号或过敏史/诊断关键词..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="tcm-button px-6 py-3 flex items-center space-x-2 whitespace-nowrap"
          >
            {isSearching ? (
              <span>搜索中...</span>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>搜索</span>
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          支持通过病人姓名、手机号、过敏史或诊断关键词进行搜索
        </p>
      </div>

      {/* 搜索结果 */}
      {results.length > 0 ? (
        <div className="tcm-card">
          <h3 className="text-lg font-semibold mb-4">搜索结果</h3>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium">{result.patientName}</h4>
                      <span className="text-sm bg-secondary text-primary px-2 py-1 rounded">
                        {result.type === 'patient' ? '病人' : result.type === 'visit' ? '就诊' : '药方'}
                      </span>
                    </div>
                    {getResultDescription(result)}
                    <div className="mt-2 flex justify-between items-center">
                      <Link
                        href={`/patients/${result.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        查看详情
                      </Link>
                      <span className="text-xs text-gray-500">
                        相关度: {Math.round(result.relevance * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchTerm ? (
        <div className="tcm-card">
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">未找到相关结果，请尝试其他关键词</p>
          </div>
        </div>
      ) : (
        <div className="tcm-card">
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">请输入搜索关键词</p>
          </div>
        </div>
      )}

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              onClick={handleClosePreview}
              className="absolute top-4 right-4 bg-white rounded-full p-2 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={`${selectedImage}?t=${Date.now()}`}
              alt="预览"
              className="max-w-full max-h-[90vh] object-contain"
              onError={(e) => {
                console.error('预览图片加载失败:', selectedImage)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}