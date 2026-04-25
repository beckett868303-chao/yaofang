import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createToken, setAuthCookie, verifyPassword } from '@/lib/auth'

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

    // 检查密码是否已经哈希，如果没有，直接比较
    if (user.password.length !== 64) {
      // 密码未哈希，直接比较
      if (password !== user.password) {
        return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
      }
    } else {
      // 密码已哈希，使用验证函数
      if (!verifyPassword(password, user.password)) {
        return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
      }
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