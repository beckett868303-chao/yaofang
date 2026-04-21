import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        visits: {
          include: {
            prescriptions: true
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
    const body = await request.json()
    const { name, age, gender, phone, allergies } = body

    if (!name || !age || !phone) {
      return NextResponse.json({ error: '姓名、年龄和手机号不能为空' }, { status: 400 })
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        age: parseInt(age),
        gender: gender || '男',
        phone,
        allergies: allergies || null
      }
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '创建病人失败' }, { status: 500 })
  }
}