import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchTerm = request.nextUrl.searchParams.get('term') || ''
    
    if (!searchTerm.trim()) {
      return NextResponse.json({ results: [] })
    }

    // 搜索病人
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { phone: { contains: searchTerm } },
          { allergies: { contains: searchTerm } }
        ]
      },
      include: {
        visits: {
          include: {
            prescriptions: true
          }
        }
      }
    })

    // 搜索就诊记录
    const visits = await prisma.visit.findMany({
      where: {
        OR: [
          { symptoms: { contains: searchTerm } },
          { patient: { name: { contains: searchTerm } } },
          { patient: { phone: { contains: searchTerm } } }
        ]
      },
      include: {
        patient: true,
        prescriptions: true
      }
    })

    // 搜索药方
    const prescriptions = await prisma.prescriptionImage.findMany({
      where: {
        OR: [
          { ocrResult: { contains: searchTerm } },
          { visit: { patient: { name: { contains: searchTerm } } } },
          { visit: { patient: { phone: { contains: searchTerm } } } }
        ]
      },
      include: {
        visit: {
          include: {
            patient: true
          }
        }
      }
    })

    // 构建搜索结果
    const results = []

    // 添加病人结果
    for (const patient of patients) {
      results.push({
        id: patient.id,
        type: 'patient' as const,
        patientName: patient.name,
        phone: patient.phone,
        allergies: patient.allergies || undefined,
        relevance: 0.95
      })
    }

    // 添加就诊记录结果
    for (const visit of visits) {
      results.push({
        id: visit.id,
        type: 'visit' as const,
        patientName: visit.patient.name,
        visitDate: visit.visitDate.toISOString(),
        diagnosis: visit.symptoms || undefined,
        relevance: 0.90
      })
    }

    // 添加药方结果
    for (const prescription of prescriptions) {
      results.push({
        id: prescription.id,
        type: 'prescription' as const,
        patientName: prescription.visit.patient.name,
        visitDate: prescription.visit.visitDate.toISOString(),
        prescriptionId: prescription.id,
        imagePath: prescription.imagePath,
        relevance: 0.85
      })
    }

    // 按相关度排序
    results.sort((a, b) => b.relevance - a.relevance)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('搜索失败:', error)
    return NextResponse.json({ error: '搜索失败' }, { status: 500 })
  }
}
