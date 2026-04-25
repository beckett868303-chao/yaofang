import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}