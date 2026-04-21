'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'

interface OcrResult {
  id: number
  imagePath: string
  ocrText: string
  confidence: number
  patientName: string
  visitDate: string
}

export default function OcrPage() {
  const [ocrResults, setOcrResults] = useState<OcrResult[]>([])
  const [selectedResult, setSelectedResult] = useState<OcrResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // 模拟获取OCR识别结果
    const mockOcrResults: OcrResult[] = [
      {
        id: 1,
        imagePath: 'https://via.placeholder.com/400x500?text=药方1',
        ocrText: '麻黄 10g, 桂枝 10g, 杏仁 10g, 甘草 6g\n连翘 12g, 银花 12g, 桔梗 6g\n薄荷 6g, 竹叶 6g, 生石膏 30g',
        confidence: 0.95,
        patientName: '张三',
        visitDate: '2026-04-20'
      },
      {
        id: 2,
        imagePath: 'https://via.placeholder.com/400x500?text=药方2',
        ocrText: '四君子汤加减\n党参 15g, 白术 12g, 茯苓 12g, 甘草 6g\n陈皮 10g, 半夏 10g, 木香 6g',
        confidence: 0.92,
        patientName: '李四',
        visitDate: '2026-04-19'
      },
      {
        id: 3,
        imagePath: 'https://via.placeholder.com/400x500?text=药方3',
        ocrText: '六味地黄丸加减\n熟地 20g, 山茱萸 12g, 山药 12g\n泽泻 10g, 丹皮 10g, 茯苓 12g\n枸杞子 15g, 菊花 10g',
        confidence: 0.90,
        patientName: '王五',
        visitDate: '2026-04-18'
      }
    ]
    setOcrResults(mockOcrResults)
    setSelectedResult(mockOcrResults[0])
  }, [])

  const handleReprocess = () => {
    setIsProcessing(true)
    // 模拟重新识别过程
    setTimeout(() => {
      setIsProcessing(false)
      alert('重新识别完成！')
    }, 2000)
  }

  return (
    <div className="space-y-8">
      {/* 页面标题和返回按钮 */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center text-primary hover:text-primary/80">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>返回首页</span>
        </Link>
        <h2 className="text-2xl font-bold text-primary">智能识别展示</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：OCR结果列表 */}
        <div className="lg:col-span-1">
          <div className="tcm-card h-full">
            <h3 className="text-lg font-semibold mb-4">识别记录</h3>
            <div className="space-y-3">
              {ocrResults.map(result => (
                <div
                  key={result.id}
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${selectedResult?.id === result.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{result.patientName}</span>
                    <span className="text-sm text-gray-500">{result.visitDate}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {result.ocrText.substring(0, 50)}...
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      置信度: {Math.round(result.confidence * 100)}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedResult(result)
                      }}
                      className="text-primary text-sm hover:underline"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：详细识别结果 */}
        <div className="lg:col-span-2">
          <div className="tcm-card">
            {selectedResult ? (
              <div className="space-y-6">
                {/* 识别信息 */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedResult.patientName}</h3>
                    <p className="text-sm text-gray-500">
                      就诊日期: {selectedResult.visitDate} | 置信度: {Math.round(selectedResult.confidence * 100)}%
                    </p>
                  </div>
                  <button
                    onClick={handleReprocess}
                    disabled={isProcessing}
                    className="flex items-center space-x-2 bg-white text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary/5 transition-colors"
                  >
                    {isProcessing ? (
                      <span>处理中...</span>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>重新识别</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 图片和识别结果 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 原图 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">原图</h4>
                    <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center p-4 h-80">
                      <img
                        src={selectedResult.imagePath}
                        alt="药方原图"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* 识别文字 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">识别结果</h4>
                    <div className="border border-gray-200 rounded-md p-4 h-80 overflow-y-auto bg-gray-50">
                      <pre className="text-sm whitespace-pre-wrap">{selectedResult.ocrText}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-500">请选择一个识别记录查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}