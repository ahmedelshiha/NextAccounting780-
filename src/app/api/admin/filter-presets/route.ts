import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/admin/filter-presets
 * List all saved filter presets for the current tenant
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: { Tenant: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json(
        { error: 'No tenant found' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType') || 'users'
    const isPublic = searchParams.get('isPublic') === 'true'
    const includeShared = searchParams.get('includeShared') !== 'false'

    const whereClause: any = {
      tenantId: user.tenantId,
      entityType,
    }

    if (isPublic) {
      whereClause.isPublic = true
    } else if (includeShared) {
      whereClause.OR = [
        { isPublic: true },
        { createdBy: session.user.id },
      ]
    } else {
      whereClause.createdBy = session.user.id
    }

    const presets = await prisma.filter_presets.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        entityType: true,
        filterConfig: true,
        filterLogic: true,
        isPublic: true,
        isDefault: true,
        icon: true,
        color: true,
        usageCount: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({
      success: true,
      presets: presets.map((p) => ({
        ...p,
        filterConfig: typeof p.filterConfig === 'string' ? JSON.parse(p.filterConfig) : p.filterConfig,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch filter presets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presets' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/filter-presets
 * Create a new filter preset
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: { Tenant: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json(
        { error: 'No tenant found' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      entityType = 'users',
      filterConfig,
      isPublic = false,
      icon,
      color,
    } = body

    if (!name || !filterConfig) {
      return NextResponse.json(
        { error: 'Missing required fields: name, filterConfig' },
        { status: 400 }
      )
    }

    // Check if preset with same name exists
    const existing = await prisma.filter_presets.findFirst({
      where: {
        tenantId: user.tenantId,
        name,
        createdBy: session.user.id,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Preset with this name already exists' },
        { status: 409 }
      )
    }

    const filterLogic = filterConfig.logic || 'AND'

    const preset = await prisma.filter_presets.create({
      data: {
        tenantId: user.tenantId,
        name,
        description: description || null,
        entityType,
        filterConfig: JSON.stringify(filterConfig),
        filterLogic,
        isPublic,
        icon: icon || null,
        color: color || null,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        ...preset,
        filterConfig: JSON.parse(preset.filterConfig),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create filter preset:', error)
    return NextResponse.json(
      { error: 'Failed to create preset' },
      { status: 500 }
    )
  }
}
