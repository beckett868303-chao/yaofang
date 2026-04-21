'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react'

interface Patient {
  id: number
  name: string
  age: number
  phone: string
}

interface Visit {
  id: number
  patientId: number
  visitDate: string
  diagnosis: string
  prescriptions: Prescription[]
}

interface Prescription {
  id: number
  imagePath: string
  ocrResult: string
}

export default function TimelinePage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)

  useEffect(() => {
    // 模拟病人列表
    const mockPatients: Patient[] = [
      { id: 1, name: '张三', age: 35, phone: '13800138000' },
      { id: 2, name: '李四', age: 42, phone: '13900139000' },
      { id: 3, name: '王五', age: 28, phone: '13700137000' }
    ]
    setPatients(mockPatients)
    setSelectedPatient(1)
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      // 模拟该病人的就诊记录
      const mockVisits: Visit[] = [
        {
          id: 1,
          patientId: selectedPatient,
          visitDate: '2026-04-20',
          diagnosis: '风寒感冒',
          prescriptions: [
            {
              id: 1,
              imagePath: 'https://via.placeholder.com/300x400?text=药方1',
              ocrResult: '麻黄 10g, 桂枝 10g, 杏仁 10g, 甘草 6g'
            },
            {
              id: 2,
              imagePath: 'https://via.placeholder.com/300x400?text=药方2',
              ocrResult: '银翘散加减'
            }
          ]
        },
        {
          id: 2,
          patientId: selectedPatient,
          visitDate: '2026-04-15',
          diagnosis: '脾胃不和',
          prescriptions: [
            {
              id: 3,
              imagePath: 'https://via.placeholder.com/300x400?text=药方3',
              ocrResult: '四君子汤加减'
            }
          ]
        },
        {
          id: 3,
          patientId: selectedPatient,
          visitDate: '2026-04-10',
          diagnosis: '失眠',
          prescriptions: [
            {
              id: 4,
              imagePath: 'https://via.placeholder.com/300x400?text=药方4',
              ocrResult: '安神补脑汤'
            }
          ]
        }
      ]
      setVisits(mockVisits)
      setSelectedVisit(mockVisits[0])
    }
  }, [selectedPatient])

  return (
    <div className="space-y-8">
      {/* 页面标题和返回按钮 */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center text-primary hover:text-primary/80">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>返回首页</span>
        </Link>
        <h2 className="text-2xl font-bold text-primary">历史溯源</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：病人选择 */}
        <div className="lg:col-span-1">
          <div className="tcm-card">
            <h3 className="text-lg font-semibold mb-4">选择病人</h3>
            <div className="space-y-3">
              {patients.map(patient => (
                <div
                  key={patient.id}
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${selectedPatient === patient.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setSelectedPatient(patient.id)}
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.age}岁 | {patient.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* 时间轴 */}
          <div className="tcm-card">
            <h3 className="text-lg font-semibold mb-6">就诊时间轴</h3>
            <div className="relative">
              {/* 时间轴中心线 */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20"></div>
              
              {/* 时间轴节点 */}
              <div className="space-y-8 relative">
                {visits.map((visit, index) => (
                  <div key={visit.id} className="relative pl-12">
                    {/* 节点 */}
                    <div className={`absolute left-2 top-1 w-6 h-6 rounded-full flex items-center justify-center ${selectedVisit?.id === visit.id ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    
                    {/* 内容 */}
                    <div className={`border rounded-md p-4 cursor-pointer transition-colors ${selectedVisit?.id === visit.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
                         onClick={() => setSelectedVisit(visit)}>
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{visit.visitDate}</h4>
                        <span className="bg-secondary text-primary px-2 py-1 rounded text-sm">
                          {visit.diagnosis}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {visit.prescriptions.length} 张药方
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 选中日期的药方照片 */}
          {selectedVisit && (
            <div className="tcm-card">
              <h3 className="text-lg font-semibold mb-4">
                {selectedVisit.visitDate} 的药方照片
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedVisit.prescriptions.map(prescription => (
                  <div key={prescription.id} className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <FileText className="w-5 h-5 text-primary mr-2" />
                        <span className="font-medium">药方 {prescription.id}</span>
                      </div>
                      <img
                        src={prescription.imagePath}
                        alt={`药方 ${prescription.id}`}
                        className="w-full h-48 object-cover rounded mb-3"
                      />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">识别结果：</p>
                        <p className="bg-gray-50 p-2 rounded">{prescription.ocrResult}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}