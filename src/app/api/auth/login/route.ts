import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    if (user.password !== password) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    const token = await createToken(user.id)
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}