'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { WorkstationContextType, QuickStatsData } from '../types/workstation'
import { UserFilters } from '../components/AdvancedUserFilters'

/**
 * WorkstationProvider
 * Manages state for the Oracle Fusion-inspired workstation layout
 * Includes layout visibility, filter state, selections, and bulk operations
 */
const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined)

/**
 * Hook to use the WorkstationContext
 * @throws {Error} If used outside of WorkstationProvider
 */
export function useWorkstationContext(): WorkstationContextType {
  const context = useContext(WorkstationContext)
  if (!context) {
    throw new Error('useWorkstationContext must be used within WorkstationProvider')
  }
  return context
}

interface WorkstationProviderProps {
  children: ReactNode
  initialStats?: QuickStatsData
}

/**
 * WorkstationProvider Component
 * Manages all workstation state and provides it to child components
 */
export function WorkstationProvider({ 
  children,
  initialStats = {
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    inProgressWorkflows: 0,
    refreshedAt: new Date()
  }
}: WorkstationProviderProps) {
  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [insightsPanelOpen, setInsightsPanelOpen] = useState(true)

  // Main Content Layout
  const [mainContentLayout, setMainContentLayout] = useState<'full' | 'split'>('split')

  // Filter State
  const [selectedFilters, setSelectedFilters] = useState<UserFilters>({
    search: '',
    role: undefined,
    status: undefined,
    department: undefined,
    dateRange: 'all'
  })

  // Quick Stats
  const [quickStats, setQuickStats] = useState<QuickStatsData | null>(initialStats)
  const [quickStatsLoading, setQuickStatsLoading] = useState(false)

  // User Selection State
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())

  // Bulk Actions
  const [bulkActionType, setBulkActionType] = useState<string>('')
  const [bulkActionValue, setBulkActionValue] = useState<string>('')
  const [isApplyingBulkAction, setIsApplyingBulkAction] = useState(false)

  // General State
  const [isLoading, setIsLoading] = useState(false)

  // Helper methods
  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }, [])

  const selectAllUsers = useCallback((userIds: string[]) => {
    setSelectedUserIds(new Set(userIds))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedUserIds(new Set())
  }, [])

  const refreshQuickStats = useCallback(async () => {
    setQuickStatsLoading(true)
    try {
      // This will be implemented in Phase 2 with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setQuickStats(prev => prev ? {
        ...prev,
        refreshedAt: new Date()
      } : null)
    } finally {
      setQuickStatsLoading(false)
    }
  }, [])

  const applyBulkAction = useCallback(async () => {
    if (!bulkActionType || !bulkActionValue || selectedUserIds.size === 0) {
      return
    }

    setIsApplyingBulkAction(true)
    try {
      // This will be implemented in Phase 2 with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      clearSelection()
      await refreshQuickStats()
    } finally {
      setIsApplyingBulkAction(false)
      setBulkActionType('')
      setBulkActionValue('')
    }
  }, [bulkActionType, bulkActionValue, selectedUserIds, clearSelection, refreshQuickStats])

  const value: WorkstationContextType = {
    // Layout State
    sidebarOpen,
    insightsPanelOpen,
    setSidebarOpen,
    setInsightsPanelOpen,

    // Main Content Layout
    mainContentLayout,
    setMainContentLayout,

    // Filter State
    selectedFilters,
    setSelectedFilters,

    // Quick Stats
    quickStats,
    quickStatsLoading,
    refreshQuickStats,

    // User Selection State
    selectedUserIds,
    setSelectedUserIds,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,

    // Bulk Actions
    bulkActionType,
    setBulkActionType,
    bulkActionValue,
    setBulkActionValue,
    applyBulkAction,
    isApplyingBulkAction,

    // General State
    isLoading
  }

  return (
    <WorkstationContext.Provider value={value}>
      {children}
    </WorkstationContext.Provider>
  )
}

export { WorkstationContext }
