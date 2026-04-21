import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 })
    }

    // 生成唯一文件名
    const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', uniqueName)
    const imagePath = `/uploads/${uniqueName}`

    // 读取文件内容并写入到服务器
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(uploadPath, buffer)

    return NextResponse.json({ 
      success: true, 
      imagePath, 
      fileName: uniqueName 
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    return NextResponse.json({ error: '文件上传失败' }, { status: 500 })
  }
}