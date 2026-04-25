import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const patients = await prisma.patient.findMany({
      where: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(patients)
  } catch (error) {
    return NextResponse.json({ error: '获取病人列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { name, age, gender, phone, allergies } = body

    if (!name || !age) {
      return NextResponse.json({ error: '姓名和年龄不能为空' }, { status: 400 })
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        age: parseInt(age),
        gender: gender || '男',
        phone: phone || null,
        allergies: allergies || null,
        userId: userId
      }
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('创建病人失败:', error)
    return NextResponse.json({ error: '创建病人失败' }, { status: 500 })
  }
}