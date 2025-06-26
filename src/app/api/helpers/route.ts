import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const helpers = await prisma.helper.findMany({
      include: {
        salaries: true,
        deductions: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(helpers)
  } catch (error) {
    console.error('Error fetching helpers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch helpers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Helper name is required' },
        { status: 400 }
      )
    }

    const helper = await prisma.helper.create({
      data: {
        name: name.trim(),
      },
    })

    return NextResponse.json(helper, { status: 201 })
  } catch (error) {
    console.error('Error creating helper:', error)
    return NextResponse.json(
      { error: 'Failed to create helper' },
      { status: 500 }
    )
  }
} 