'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { ArrowLeft, Camera, Upload, Save, Trash2, CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'

interface UploadedImage {
  id: string
  file: File
  preview: string
  imagePath: string
  ocrResult: string
  isUploading: boolean
  isUploaded: boolean
  isOCRProcessing: boolean
  ocrError: string | null
}

export default function UploadPage() {
  const router = useRouter()
  const [visitDate, setVisitDate] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })
  const [images, setImages] = useState<UploadedImage[]>([])
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '男',
    phone: '',
    allergies: ''
  })
  const [symptoms, setSymptoms] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 图片压缩配置
  const compressionOptions = {
    maxSizeMB: 0.8, // 最大800KB
    maxWidthOrHeight: 2000, // 最大宽度2000px
    useWebWorker: true
  }

  // 将File转换为Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
      reader.readAsDataURL(file)
    })
  }

  // 压缩图片
  const compressImage = async (file: File): Promise<File> => {
    try {
      const compressedFile = await imageCompression(file, compressionOptions)
      console.log('图片压缩成功，原大小:', file.size, '压缩后大小:', compressedFile.size)
      return compressedFile
    } catch (error) {
      console.error('图片压缩失败:', error)
      return file // 压缩失败则使用原图
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: UploadedImage[] = []
      
      for (const file of Array.from(files)) {
        // 压缩图片
        const compressedFile = await compressImage(file)
        
        const newImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
          imagePath: '',
          ocrResult: '识别中...',
          isUploading: false,
          isUploaded: false,
          isOCRProcessing: true,
          ocrError: null
        }
        newImages.push(newImage)
      }
      
      setImages(prevImages => [...prevImages, ...newImages])
      
      // 对每个新图片进行OCR识别
      newImages.forEach(image => {
        handleOCR(image)
      })
    }
  }

  const handleCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: UploadedImage[] = []
      
      for (const file of Array.from(files)) {
        // 压缩图片
        const compressedFile = await compressImage(file)
        
        const newImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
          imagePath: '',
          ocrResult: '识别中...',
          isUploading: false,
          isUploaded: false,
          isOCRProcessing: true,
          ocrError: null
        }
        newImages.push(newImage)
      }
      
      setImages(prevImages => [...prevImages, ...newImages])
      
      // 对每个新图片进行OCR识别
      newImages.forEach(image => {
        handleOCR(image)
      })
    }
  }

  const handleOCR = async (image: UploadedImage) => {
    console.log('开始OCR识别:', image.id)
    try {
      // 将文件转换为Base64
      const base64Image = await fileToBase64(image.file)
      console.log('文件转换为Base64成功，长度:', base64Image.length)

      console.log('发送OCR请求...')
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Image })
      })

      console.log('OCR响应状态:', response.status)
      const data = await response.json()
      console.log('OCR响应数据:', data)

      if (data.success) {
        // 更新图片的OCR结果
        setImages(prevImages => prevImages.map(img => 
          img.id === image.id 
            ? { ...img, ocrResult: data.ocrResult, isOCRProcessing: false } 
            : img
        ))
        
        // 尝试从识别结果中提取病人信息并自动填充
        extractPatientInfo(data.ocrResult)
      } else {
        setImages(prevImages => prevImages.map(img => 
          img.id === image.id 
            ? { ...img, ocrError: JSON.stringify(data), isOCRProcessing: false } 
            : img
        ))
      }
    } catch (error) {
      console.error('OCR识别失败:', error)
      setImages(prevImages => prevImages.map(img => 
        img.id === image.id 
          ? { ...img, ocrError: '识别失败', isOCRProcessing: false } 
          : img
      ))
    }
  }

  // 从OCR结果中提取病人信息
  const extractPatientInfo = async (ocrResult: string) => {
    // 这里可以根据实际的OCR结果格式来提取病人信息
    // 例如：姓名、年龄、性别等
    // 这里只是一个示例实现
    console.log('尝试提取病人信息...')
    
    // 示例：从OCR结果中提取姓名（支持多种格式）
    const nameMatch = ocrResult.match(/姓名[:：]\s*([^\n,，]+)/)
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim()
      setPatientInfo(prev => ({ ...prev, name }))
      console.log('提取到姓名:', name)
      
      // 搜索历史病人
      try {
        const response = await fetch(`/api/patients/search?name=${encodeURIComponent(name)}`)
        const patients = await response.json()
        if (patients.length > 0) {
          const matchedPatient = patients[0]
          setPatientInfo(prev => ({
            ...prev,
            name: matchedPatient.name,
            age: matchedPatient.age.toString(),
            gender: matchedPatient.gender,
            phone: matchedPatient.phone || '',
            allergies: matchedPatient.allergies || ''
          }))
          console.log('自动匹配到历史病人:', matchedPatient.name)
        }
      } catch (error) {
        console.error('搜索历史病人失败:', error)
      }
    }
    
    // 示例：从OCR结果中提取年龄（支持多种格式）
    const ageMatch = ocrResult.match(/年龄[:：]\s*(\d+)\s*岁?/)
    if (ageMatch && ageMatch[1]) {
      const age = ageMatch[1]
      setPatientInfo(prev => ({ ...prev, age }))
      console.log('提取到年龄:', age)
    }
    
    // 示例：从OCR结果中提取性别（支持多种格式）
    const genderMatch = ocrResult.match(/性别[:：]\s*(男|女)/)
    if (genderMatch && genderMatch[1]) {
      const gender = genderMatch[1]
      setPatientInfo(prev => ({ ...prev, gender }))
      console.log('提取到性别:', gender)
    }
    
    // 示例：从OCR结果中提取手机号
    const phoneMatch = ocrResult.match(/手机[:：]\s*(1[3-9]\d{9})/)
    if (phoneMatch && phoneMatch[1]) {
      const phone = phoneMatch[1]
      setPatientInfo(prev => ({ ...prev, phone }))
      console.log('提取到手机号:', phone)
    }
    
    // 示例：从OCR结果中提取过敏史
    const allergiesMatch = ocrResult.match(/过敏史[:：]\s*([^\n]+)/)
    if (allergiesMatch && allergiesMatch[1]) {
      const allergies = allergiesMatch[1].trim()
      setPatientInfo(prev => ({ ...prev, allergies }))
      console.log('提取到过敏史:', allergies)
    }
  }

  const handleImageUpload = async (image: UploadedImage) => {
    try {
      setImages(prevImages => prevImages.map(img => 
        img.id === image.id ? { ...img, isUploading: true } : img
      ))

      const formData = new FormData()
      formData.append('file', image.file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setImages(prevImages => prevImages.map(img => 
          img.id === image.id 
            ? { ...img, imagePath: data.imagePath, isUploading: false, isUploaded: true } 
            : img
        ))
      } else {
        setImages(prevImages => prevImages.map(img => 
          img.id === image.id 
            ? { ...img, isUploading: false, ocrError: '上传失败' } 
            : img
        ))
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      setImages(prevImages => prevImages.map(img => 
        img.id === image.id 
          ? { ...img, isUploading: false, ocrError: '上传失败' } 
          : img
      ))
    }
  }

  const handleRemoveImage = (imageId: string) => {
    setImages(prevImages => prevImages.filter(img => img.id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (images.length === 0) {
      alert('请至少上传一张药方图片')
      return
    }

    if (!patientInfo.name || !patientInfo.age) {
      alert('请填写病人基本信息')
      return
    }

    // 检查是否所有图片都已完成OCR识别
    const hasUnprocessedImages = images.some(img => img.isOCRProcessing)
    if (hasUnprocessedImages) {
      alert('请等待所有图片OCR识别完成后再保存')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. 上传所有图片
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          if (image.isUploaded) {
            return image
          }
          // 上传图片
          const formData = new FormData()
          formData.append('file', image.file)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          const data = await response.json()

          if (data.success) {
            return {
              ...image,
              imagePath: data.imagePath,
              isUploading: false,
              isUploaded: true
            }
          } else {
            throw new Error('图片上传失败')
          }
        })
      )

      // 2. 创建或更新病人信息
      let patientId: string
      
      // 尝试通过姓名和手机号的组合查找病人
      const patientResponse = await fetch('/api/patients')
      const patients = await patientResponse.json()
      
      // 优先按姓名和手机号组合匹配
      let existingPatient = null
      if (Array.isArray(patients)) {
        existingPatient = patients.find((p: any) => {
          if (patientInfo.phone) {
            // 有手机号时，按姓名和手机号组合匹配
            return p.name === patientInfo.name && p.phone === patientInfo.phone
          } else {
            // 无手机号时，按姓名匹配
            return p.name === patientInfo.name
          }
        })
      }

      if (existingPatient) {
        patientId = existingPatient.id.toString()
      } else {
        // 创建新病人
        const createPatientResponse = await fetch('/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: patientInfo.name,
            age: Number(patientInfo.age),
            gender: patientInfo.gender,
            phone: patientInfo.phone || null,
            allergies: patientInfo.allergies || null
          })
        })

        if (!createPatientResponse.ok) {
          const errorData = await createPatientResponse.json()
          throw new Error(`创建病人失败: ${errorData.error || '未知错误'}`)
        }

        const newPatient = await createPatientResponse.json()
        patientId = newPatient.id.toString()
      }

      // 3. 创建就诊记录
      const prescriptions = uploadedImages.map(img => ({
        imagePath: img.imagePath,
        ocrResult: img.ocrResult || ''
      }))

      console.log('创建就诊记录，处方数据:', prescriptions)

      const visitResponse = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId,
          visitDate,
          symptoms: symptoms || '',
          prescriptions
        })
      })

      if (!visitResponse.ok) {
        const errorData = await visitResponse.json()
        throw new Error(`创建就诊记录失败: ${errorData.error || '未知错误'}`)
      }

      alert('上传成功！')
      router.push('/patients')
    } catch (error) {
      console.error('保存失败:', error)
      alert(`保存失败: ${(error as Error).message || '请稍后重试'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 页面标题和返回按钮 */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center text-primary hover:text-primary/80">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>返回主页</span>
        </Link>
        <h2 className="text-2xl font-bold text-primary">新增就诊记录</h2>
      </div>

      {/* 图片上传区域 - 移到最上方 */}
      <div className="tcm-card">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">上传药方图片</h3>
        <div className="flex space-x-4 mb-4">
          <label htmlFor="file-upload" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 cursor-pointer transition-colors">
            <Upload className="w-5 h-5 mr-2" />
            选择图片
          </label>
          <label htmlFor="camera-upload" className="inline-flex items-center px-6 py-3 bg-secondary text-primary rounded-md hover:bg-secondary/90 cursor-pointer transition-colors">
            <Camera className="w-5 h-5 mr-2" />
            拍照
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            id="camera-upload"
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleCameraChange}
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-500 mb-4">支持一次性上传多张图片，每张图片将与该病人的就诊日期绑定</p>
        
        {/* 已上传图片 */}
        {images.length > 0 && (
          <div className="mt-4 space-y-4">
            {images.map((image) => (
              <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={image.preview}
                      alt="药方预览"
                      className="w-32 h-40 object-cover rounded"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">识别结果：</h4>
                      <div className="flex space-x-2">
                        {!image.isUploaded && (
                          <button
                            onClick={() => handleImageUpload(image)}
                            disabled={image.isUploading}
                            className="flex items-center text-sm text-primary hover:text-primary/80"
                          >
                            {image.isUploading ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4 mr-1" />
                            )}
                            上传
                          </button>
                        )}
                        {image.isUploaded && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <button
                          onClick={() => handleRemoveImage(image.id)}
                          className="text-sm text-red-500 hover:text-red-700 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      {image.isOCRProcessing ? (
                        <div className="flex items-center text-gray-500">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          识别中...
                        </div>
                      ) : image.ocrError ? (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-red-600 text-sm font-medium mb-1">识别失败</p>
                          <pre className="text-red-500 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                            {image.ocrError}
                          </pre>
                        </div>
                      ) : (
                        <textarea
                          value={image.ocrResult}
                          onChange={(e) => {
                            setImages(prevImages => prevImages.map(img => 
                              img.id === image.id 
                                ? { ...img, ocrResult: e.target.value } 
                                : img
                            ))
                          }}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-40"
                          placeholder="识别结果"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 病人信息 */}
      <div className="tcm-card">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">病人信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={patientInfo.name}
              onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="请输入病人姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              年龄 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={patientInfo.age}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="请输入病人年龄"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性别
            </label>
            <select
              value={patientInfo.gender}
              onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              手机号
            </label>
            <input
              type="tel"
              value={patientInfo.phone}
              onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="请输入病人手机号（选填）"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              过敏史
            </label>
            <input
              type="text"
              value={patientInfo.allergies}
              onChange={(e) => setPatientInfo({ ...patientInfo, allergies: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="请输入病人过敏史"
            />
          </div>
        </div>
      </div>

      {/* 就诊日期 */}
      <div className="tcm-card">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">就诊信息</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              就诊时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              症候描述
            </label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="请输入病人当前症状"
            />
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-center space-x-4">
        {images.length > 0 && (
          <button
            onClick={() => {
              if (confirm('确定要清空所有图片吗？')) {
                setImages([])
              }
            }}
            className="flex items-center px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            清空所有
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-400 transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          保存并上传
        </button>
      </div>
    </div>
  )
}