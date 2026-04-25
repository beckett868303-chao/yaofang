import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const searchTerm = request.nextUrl.searchParams.get('name') || ''
    
    if (!searchTerm.trim()) {
      return NextResponse.json([])
    }

    const patients = await prisma.patient.findMany({
      where: {
        userId: userId,
        name: {
          contains: searchTerm
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('搜索病人失败:', error)
    return NextResponse.json({ error: '搜索病人失败' }, { status: 500 })
  }
}