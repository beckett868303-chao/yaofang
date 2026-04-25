import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let userId = await getCurrentUserId()
    
    // 如果未登录，使用默认用户 ID 1
    if (!userId) {
      userId = 1
    }
    
    const { id } = await params
    const patient = await prisma.patient.findFirst({
      where: { 
        id: parseInt(id),
        userId: userId
      },
      include: {
        visits: {
          include: {
            prescriptions: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            visitDate: 'desc'
          }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: '病人不存在' }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    return NextResponse.json({ error: '获取病人信息失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let userId = await getCurrentUserId()
    
    // 如果未登录，使用默认用户 ID 1
    if (!userId) {
      userId = 1
    }
    
    const { id } = await params
    const body = await request.json()
    const { name, age, gender, phone, allergies } = body

    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: parseInt(id),
        userId: userId
      }
    })

    if (!existingPatient) {
      return NextResponse.json({ error: '病人不存在' }, { status: 404 })
    }

    const patient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        name,
        age: parseInt(age),
        gender,
        phone,
        allergies
      }
    })

    return NextResponse.json(patient)
  } catch (error) {
    return NextResponse.json({ error: '更新病人信息失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let userId = await getCurrentUserId()
    
    // 如果未登录，使用默认用户 ID 1
    if (!userId) {
      userId = 1
    }
    
    const { id } = await params
    
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: parseInt(id),
        userId: userId
      }
    })

    if (!existingPatient) {
      return NextResponse.json({ error: '病人不存在' }, { status: 404 })
    }

    await prisma.patient.delete({
      where: { id: parseInt(id) }
    })
    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    return NextResponse.json({ error: '删除病人失败' }, { status: 500 })
  }
}