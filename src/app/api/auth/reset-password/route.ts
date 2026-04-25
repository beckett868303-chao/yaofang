import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email, newPassword } = body

    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: '密码至少需要6个字符' }, { status: 400 })
    }

    // 验证令牌
    const userId = await verifyToken(token)
    if (!userId) {
      return NextResponse.json({ error: '重置链接无效或已过期' }, { status: 401 })
    }

    // 验证用户存在且邮箱匹配
    const user = await prisma.user.findUnique({
      where: { id: userId, email }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword }
    })

    return NextResponse.json({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    })
  } catch (error) {
    console.error('重置密码失败:', error)
    return NextResponse.json({ error: '重置密码失败' }, { status: 500 })
  }
}