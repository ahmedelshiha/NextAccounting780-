'use client'

import React, { useMemo } from 'react'
import { WorkstationMainContentProps } from '../../types/workstation'
import './workstation.css'

/**
 * WorkstationMainContent Component
 * Central area containing:
 * - Quick actions bar
 * - Operations overview cards
 * - User directory table
 * - Pagination controls
 *
 * Features:
 * - Responsive layout (full-width main content)
 * - Scrollable table area
 * - Loading and empty states
 * - Performance-optimized with memoization
 */
export function WorkstationMainContent({
  users,
  stats,
  isLoading = false,
  onAddUser,
  onImport,
  onBulkOperation,
  onExport,
  onRefresh,
  className
}: WorkstationMainContentProps) {
  // Calculate stats display values
  const displayStats = useMemo(() => ({
    totalUsers: users?.length || 0,
    pending: stats?.pendingApprovals || 0,
    inProgress: stats?.inProgressWorkflows || 0,
    dueThisWeek: stats?.dueThisWeek || 0
  }), [users, stats])

  const handleRefresh = React.useCallback(async () => {
    if (onRefresh && !isLoading) {
      await onRefresh()
    }
  }, [onRefresh, isLoading])

  return (
    <div className={`workstation-main-content ${className || ''}`}>
      {/* Quick Actions Bar */}
      <section className="main-section actions-section" aria-label="Quick actions">
        <div className="quick-actions-container">
          {onAddUser && (
            <button
              onClick={onAddUser}
              className="action-btn add-btn"
              disabled={isLoading}
              aria-label="Add a new user"
            >
              + Add User
            </button>
          )}
          {onImport && (
            <button
              onClick={onImport}
              className="action-btn import-btn"
              disabled={isLoading}
              aria-label="Import users"
            >
              ⬆ Import
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="action-btn export-btn"
              disabled={isLoading}
              aria-label="Export users"
            >
              ⬇ Export
            </button>
          )}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="action-btn refresh-btn"
              disabled={isLoading}
              aria-label="Refresh user list"
              title="Refresh user list"
            >
              {isLoading ? '⟳ Refreshing...' : '⟳ Refresh'}
            </button>
          )}
        </div>
      </section>

      {/* Operations Overview Cards */}
      <section className="main-section metrics-section" aria-label="Overview metrics">
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Total Users</span>
            <span className="metric-value">{displayStats.totalUsers}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Pending Approvals</span>
            <span className="metric-value">{displayStats.pending}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">In Progress</span>
            <span className="metric-value">{displayStats.inProgress}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Due This Week</span>
            <span className="metric-value">{displayStats.dueThisWeek}</span>
          </div>
        </div>
      </section>

      {/* User Directory Header */}
      <section className="main-section directory-header" aria-label="User directory section">
        <h2 className="directory-title">User Directory</h2>
      </section>

      {/* User Directory Table */}
      <section className="main-section directory-section" aria-label="User list">
        <div className="users-table-container">
          {isLoading ? (
            <div className="loading-state" role="status" aria-live="polite">
              Loading users...
            </div>
          ) : users && users.length > 0 ? (
            <div className="table-placeholder">
              {/* Table component will be integrated in Phase 2 */}
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                Table component ready for integration ({users.length} users)
              </div>
            </div>
          ) : (
            <div className="empty-state" role="status">
              No users found. Try adjusting your filters or add a new user.
            </div>
          )}
        </div>
      </section>

      {/* Pagination Controls */}
      <section className="main-section pagination-section" aria-label="Pagination">
        <div className="pagination-container">
          <span className="pagination-info">Page 1 of 1 {users && users.length > 0 && `(${users.length} users)`}</span>
        </div>
      </section>
    </div>
  )
}

export default WorkstationMainContent
