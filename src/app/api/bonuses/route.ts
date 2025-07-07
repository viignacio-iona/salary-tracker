import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const helperId = searchParams.get('helperId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: Record<string, unknown> = {}
    
    if (helperId) where.helperId = helperId
    if (month) where.month = month
    if (year) where.year = parseInt(year)

    const bonuses = await prisma.bonus.findMany({
      where,
      include: {
        helper: true,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { date: 'desc' },
      ],
    })
    
    return NextResponse.json(bonuses)
  } catch (error) {
    console.error('Error fetching bonuses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bonuses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { helperId, purpose, amount, date, month, year } = await request.json()
    
    if (!helperId || !purpose || !amount || !date || !month || !year) {
      return NextResponse.json(
        { error: 'Helper ID, purpose, amount, date, month, and year are required' },
        { status: 400 }
      )
    }

    const bonus = await prisma.bonus.create({
      data: {
        helperId,
        purpose: purpose.trim(),
        amount: parseFloat(amount),
        date: new Date(date),
        month,
        year: parseInt(year),
      },
      include: { helper: true },
    })

    return NextResponse.json(bonus, { status: 201 })
  } catch (error) {
    console.error('Error creating bonus:', error)
    return NextResponse.json(
      { error: 'Failed to create bonus' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Bonus ID is required' }, { status: 400 })
    }
    await prisma.bonus.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bonus:', error)
    return NextResponse.json({ error: 'Failed to delete bonus' }, { status: 500 })
  }
} 