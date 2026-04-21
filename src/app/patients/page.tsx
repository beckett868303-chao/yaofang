'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search, Calendar, Edit, Save, X } from 'lucide-react'

interface Patient {
  id: number
  name: string
  age: number
  gender: string
  phone: string
  allergies: string | null
  createdAt: string
  visits: {
    id: number
    visitDate: string
    symptoms: string | null
  }[]
}

interface EditField {
  patientId: number
  field: string
  value: string
  originalValue: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<EditField | null>(null)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      }
    } catch (error) {
      console.error('获取病人列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    (patient.allergies && patient.allergies.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.visits && patient.visits.some(v => 
      v.symptoms && v.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  )

  const handleEditField = (patientId: number, field: string, value: string) => {
    setEditingField({
      patientId,
      field,
      value,
      originalValue: value
    })
  }

  const handleSaveField = async () => {
    if (!editingField) return

    try {
      const response = await fetch(`/api/patients/${editingField.patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [editingField.field]: editingField.value
        })
      })

      if (response.ok) {
        // 更新本地状态
        setPatients(prevPatients => prevPatients.map(patient => 
          patient.id === editingField.patientId 
            ? { ...patient, [editingField.field]: editingField.value } 
            : patient
        ))
        setEditingField(null)
      } else {
        alert('保存失败，请稍后重试')
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请稍后重试')
    }
  }

  const handleCancelEdit = () => {
    setEditingField(null)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <h2 className="text-2xl font-bold text-primary">病人查询</h2>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="搜索病人姓名、手机号、过敏史或症状..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 病人列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="tcm-card text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="tcm-card text-center py-12">
            <p className="text-gray-500">未找到匹配的病人记录</p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            // 获取最新的症候
            const latestVisit = patient.visits && patient.visits.length > 0 
              ? patient.visits.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())[0]
              : null
            
            return (
              <Link 
                key={patient.id} 
                href={`/patients/${patient.id}`}
                className="block"
              >
                <div className="tcm-card hover:shadow-lg transition-shadow p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
                        <span className="text-gray-500">{patient.age}岁 / {patient.gender}</span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span>手机号：</span>
                          {editingField && editingField.patientId === patient.id && editingField.field === 'phone' ? (
                            <div className="flex items-center ml-2">
                              <input
                                type="text"
                                value={editingField.value}
                                onChange={(e) => setEditingField(prev => prev ? { ...prev, value: e.target.value } : null)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                              <button 
                                onClick={handleSaveField}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={handleCancelEdit}
                                className="ml-2 text-gray-600 hover:text-gray-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span 
                              className="ml-2 text-primary cursor-pointer hover:underline"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditField(patient.id, 'phone', patient.phone);
                              }}
                            >
                              {patient.phone}
                            </span>
                          )}
                        </div>
                        {patient.allergies && (
                          <div className="flex items-center">
                            <span>过敏史：</span>
                            {editingField && editingField.patientId === patient.id && editingField.field === 'allergies' ? (
                              <div className="flex items-center ml-2">
                                <input
                                  type="text"
                                  value={editingField.value}
                                  onChange={(e) => setEditingField(prev => prev ? { ...prev, value: e.target.value } : null)}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <button 
                                  onClick={handleSaveField}
                                  className="ml-2 text-green-600 hover:text-green-800"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={handleCancelEdit}
                                  className="ml-2 text-gray-600 hover:text-gray-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span 
                                className="ml-2 text-primary cursor-pointer hover:underline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEditField(patient.id, 'allergies', patient.allergies || '');
                                }}
                              >
                                {patient.allergies}
                              </span>
                            )}
                          </div>
                        )}
                        {latestVisit && latestVisit.symptoms && (
                          <p className="text-primary font-medium">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            最新症候：{latestVisit.symptoms}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(patient.createdAt).toLocaleDateString('zh-CN')}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}