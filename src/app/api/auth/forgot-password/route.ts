import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: '请输入邮箱' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: '该邮箱不存在' }, { status: 404 })
    }

    // 生成重置令牌
    const resetToken = await createToken(user.id)
    
    // 构建重置链接
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    // 在生产环境中，这里应该发送邮件
    console.log('密码重置链接:', resetUrl)
    console.log('重置链接已生成，在生产环境中会发送到邮箱:', email)

    // 为了演示，我们直接返回重置链接
    return NextResponse.json({
      success: true,
      message: '重置链接已发送到您的邮箱',
      resetUrl // 在开发环境中返回链接以便测试
    })
  } catch (error) {
    console.error('发送重置邮件失败:', error)
    return NextResponse.json({ error: '发送重置邮件失败' }, { status: 500 })
  }
}