'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, FileText, Edit, X, Save, CheckCircle } from 'lucide-react'

interface Patient {
  id: number
  name: string
  age: number
  gender: string
  phone: string
  allergies: string | null
  createdAt: string
  visits: Visit[]
}

interface Visit {
  id: number
  visitDate: string
  symptoms: string | null
  prescriptions: Prescription[]
}

interface Prescription {
  id: number
  imagePath: string
  ocrResult: string | null
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [editingVisit, setEditingVisit] = useState<number | null>(null)
  const [editingBasicInfo, setEditingBasicInfo] = useState<boolean>(false)
  const [editedPatientInfo, setEditedPatientInfo] = useState<{
    name: string
    age: string
    gender: string
    phone: string
    allergies: string
  }>({
    name: '',
    age: '',
    gender: '男',
    phone: '',
    allergies: ''
  })
  const [editedSymptoms, setEditedSymptoms] = useState<string>('')
  const [editedOcrResults, setEditedOcrResults] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    const fetchPatientDetail = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        
        // 从API获取病人详情
        const response = await fetch(`/api/patients/${id}`)
        
        if (!response.ok) {
          throw new Error('获取病人详情失败')
        }
        
        const patientData = await response.json()
        // 按就诊日期降序排序，最新的记录在前面
        patientData.visits.sort((a: Visit, b: Visit) => {
          return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
        })
        setPatient(patientData)
        
        // 初始化编辑的基本信息
        setEditedPatientInfo({
          name: patientData.name,
          age: patientData.age.toString(),
          gender: patientData.gender || '男',
          phone: patientData.phone,
          allergies: patientData.allergies || ''
        })
      } catch (err) {
        console.error('获取病人详情出错:', err)
        setError('获取病人详情失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    fetchPatientDetail()
  }, [id])

  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath)
  }

  const handleClosePreview = () => {
    setSelectedImage(null)
  }

  const handleEditBasicInfo = () => {
    if (patient) {
      setEditedPatientInfo({
        name: patient.name,
        age: patient.age.toString(),
        gender: patient.gender || '男',
        phone: patient.phone,
        allergies: patient.allergies || ''
      })
      setEditingBasicInfo(true)
    }
  }

  const handleSaveBasicInfo = async () => {
    if (!patient) return

    try {
      const response = await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editedPatientInfo.name,
          age: parseInt(editedPatientInfo.age),
          gender: editedPatientInfo.gender,
          phone: editedPatientInfo.phone,
          allergies: editedPatientInfo.allergies
        })
      })

      if (response.ok) {
        // 更新本地状态
        setPatient(prev => prev ? {
          ...prev,
          name: editedPatientInfo.name,
          age: parseInt(editedPatientInfo.age),
          gender: editedPatientInfo.gender,
          phone: editedPatientInfo.phone,
          allergies: editedPatientInfo.allergies
        } : null)
        setEditingBasicInfo(false)
        alert('保存成功！')
      } else {
        alert('保存失败，请稍后重试')
      }
    } catch (error) {
      console.error('保存基本信息失败:', error)
      alert('保存失败，请稍后重试')
    }
  }

  const handleEditVisit = (visit: Visit) => {
    setEditingVisit(visit.id)
    setEditedSymptoms(visit.symptoms || '')
    
    // 初始化编辑的OCR结果
    const ocrResults: { [key: number]: string } = {}
    visit.prescriptions.forEach(prescription => {
      ocrResults[prescription.id] = prescription.ocrResult || ''
    })
    setEditedOcrResults(ocrResults)
  }

  const handleSaveVisit = async (visitId: number) => {
    try {
      // 这里可以实现保存编辑的逻辑
      // 例如调用API更新就诊记录
      console.log('保存就诊记录:', visitId, editedSymptoms, editedOcrResults)
      
      // 保存成功后退出编辑模式
      setEditingVisit(null)
      
      // 重新获取病人详情
      if (id) {
        const response = await fetch(`/api/patients/${id}`)
        if (response.ok) {
          const patientData = await response.json()
          setPatient(patientData)
        }
      }
      alert('保存成功！')
    } catch (error) {
      console.error('保存就诊记录失败:', error)
      alert('保存失败，请稍后重试')
    }
  }

  if (loading) {
    return <div className="tcm-card">加载中...</div>
  }

  if (error) {
    return <div className="tcm-card text-red-600">{error}</div>
  }

  if (!patient) {
    return <div className="tcm-card">病人不存在</div>
  }

  return (
    <div className="space-y-8">
      {/* 页面标题和返回按钮 */}
      <div className="flex items-center space-x-4">
        <Link href="/patients" className="flex items-center text-primary hover:text-primary/80">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>返回病人列表</span>
        </Link>
        <h2 className="text-2xl font-bold text-primary">病人详情</h2>
      </div>

      {/* 病人基本信息 */}
      <div className="tcm-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">基本信息</h3>
          {!editingBasicInfo && (
            <button 
              onClick={handleEditBasicInfo}
              className="flex items-center text-primary hover:text-primary/80"
            >
              <Edit className="w-4 h-4 mr-1" />
              编辑
            </button>
          )}
        </div>
        
        {editingBasicInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editedPatientInfo.name}
                onChange={(e) => setEditedPatientInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年龄 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={editedPatientInfo.age}
                onChange={(e) => setEditedPatientInfo(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                性别
              </label>
              <select
                value={editedPatientInfo.gender}
                onChange={(e) => setEditedPatientInfo(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手机号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={editedPatientInfo.phone}
                onChange={(e) => setEditedPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                过敏史
              </label>
              <input
                type="text"
                value={editedPatientInfo.allergies}
                onChange={(e) => setEditedPatientInfo(prev => ({ ...prev, allergies: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2">
              <button 
                onClick={() => setEditingBasicInfo(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                取消
              </button>
              <button 
                onClick={handleSaveBasicInfo}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
              >
                <Save className="w-4 h-4 mr-1" />
                保存
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">姓名</p>
              <p className="text-lg font-medium">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">年龄</p>
              <p className="text-lg font-medium">{patient.age}岁</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">性别</p>
              <p className="text-lg font-medium">{patient.gender || '男'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">手机号</p>
              <p className="text-lg font-medium">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">过敏史</p>
              <p className="text-lg font-medium">{patient.allergies || '无'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">创建时间</p>
              <p className="text-lg font-medium">
                {new Date(patient.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 就诊历史 */}
      <div className="tcm-card">
        <h3 className="text-xl font-semibold mb-4">就诊历史</h3>
        <div className="space-y-6">
          {patient.visits && patient.visits.length > 0 ? (
            patient.visits.map((visit) => (
              <div key={visit.id} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-primary mr-2" />
                    <span className="font-medium">
                      {new Date(visit.visitDate).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="bg-secondary text-primary px-2 py-1 rounded text-sm">
                      {visit.symptoms || '未记录症候'}
                    </span>
                    <button 
                      onClick={() => handleEditVisit(visit)}
                      className="flex items-center text-primary hover:text-primary/80"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* 编辑模式 */}
                {editingVisit === visit.id && (
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        症候描述
                      </label>
                      <input
                        type="text"
                        value={editedSymptoms}
                        onChange={(e) => setEditedSymptoms(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setEditingVisit(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        取消
                      </button>
                      <button 
                        onClick={() => handleSaveVisit(visit.id)}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        保存
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 药方图片 */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visit.prescriptions && visit.prescriptions.map((prescription, index) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-primary mr-2" />
                          <span className="font-medium">药方 {index + 1}</span>
                        </div>
                        {editingVisit === visit.id && (
                          <button 
                            className="text-sm text-primary hover:text-primary/80 flex items-center"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-shrink-0">
                          {prescription.imagePath ? (
                            <img
                              src={prescription.imagePath}
                              alt={`药方 ${index + 1}`}
                              className="w-32 h-40 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => handleImageClick(prescription.imagePath)}
                              onError={(e) => {
                                console.error('图片加载失败:', prescription.imagePath)
                                // 可以在这里添加默认图片
                              }}
                            />
                          ) : (
                            <div className="w-32 h-40 bg-gray-200 rounded flex items-center justify-center">
                              <p className="text-gray-500 text-sm">无图片</p>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm text-gray-600">识别结果：</p>
                          {editingVisit === visit.id ? (
                            <textarea
                              value={editedOcrResults[prescription.id] || ''}
                              onChange={(e) => setEditedOcrResults(prev => ({
                                ...prev,
                                [prescription.id]: e.target.value
                              }))}
                              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-32"
                            />
                          ) : (
                            <p className="mt-1 text-sm bg-gray-50 p-2 rounded">
                              {prescription.ocrResult || '暂无识别结果'}
                            </p>
                          )}
                          {!editingVisit && (
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(prescription.ocrResult || '');
                                alert('已复制到剪贴板');
                              }}
                              className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center"
                            >
                              一键复制
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">暂无就诊记录</p>
          )}
        </div>
      </div>

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
              src={selectedImage}
              alt="预览"
              className="max-w-full max-h-[90vh] object-contain"
              onError={(e) => {
                console.error('预览图片加载失败:', selectedImage)
                // 可以在这里添加默认图片
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}