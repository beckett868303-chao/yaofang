import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const imagePath = path.join(process.cwd(), 'public', 'uploads', filename)

    const imageBuffer = await fs.readFile(imagePath)
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'

    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    }

    const contentType = mimeTypes[ext] || 'image/jpeg'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('图片读取失败:', error)
    return NextResponse.json({ error: '图片不存在' }, { status: 404 })
  }
}