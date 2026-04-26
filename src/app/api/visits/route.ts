import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { patientId, visitDate, symptoms, prescriptions } = body

    if (!patientId || !visitDate) {
      return NextResponse.json({ error: '病人ID和就诊日期不能为空' }, { status: 400 })
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: parseInt(patientId),
        userId: userId
      }
    })

    if (!patient) {
      return NextResponse.json({ error: '病人不存在' }, { status: 404 })
    }

    const visit = await prisma.visit.create({
      data: {
        patientId: parseInt(patientId),
        visitDate: new Date(visitDate),
        symptoms: symptoms || null,
        prescriptions: prescriptions ? {
          create: prescriptions.map((p: { imagePath: string; ocrResult?: string }) => ({
            imagePath: p.imagePath,
            ocrResult: p.ocrResult || null
          }))
        } : undefined
      },
      include: {
        prescriptions: true
      }
    })

    return NextResponse.json(visit, { status: 201 })
  } catch (error) {
    console.error('创建就诊记录失败:', error)
    return NextResponse.json({ error: '创建就诊记录失败' }, { status: 500 })
  }
}