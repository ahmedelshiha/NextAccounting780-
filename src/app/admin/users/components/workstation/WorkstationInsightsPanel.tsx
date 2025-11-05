'use client'

import React, { useMemo } from 'react'
import { X } from 'lucide-react'
import { WorkstationInsightsPanelProps } from '../../types/workstation'
import './workstation.css'

/**
 * WorkstationInsightsPanel Component
 * Right panel (300px fixed) containing:
 * - User growth chart
 * - Role distribution chart
 * - Department distribution chart
 * - Recommended actions
 *
 * Features:
 * - Fixed width (300px on desktop)
 * - Scrollable content area
 * - Lazy loading support (Phase 3)
 * - Mobile-friendly close button
 * - Real-time insights and recommendations
 */
export function WorkstationInsightsPanel({
  isOpen = true,
  onClose,
  stats,
  analyticsData,
  className
}: WorkstationInsightsPanelProps) {
  // Memoize insights data to prevent unnecessary recalculations
  const insightsContent = useMemo(() => ({
    hasStats: !!stats,
    hasAnalytics: !!analyticsData,
    totalUsers: stats?.totalUsers || 0,
    activeRate: stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0,
    pendingCount: stats?.pendingApprovals || 0
  }), [stats])

  const handleClose = React.useCallback(() => {
    onClose?.()
    if (process.env.WORKSTATION_LOGGING_ENABLED === 'true') {
      console.log('[Workstation] Insights panel closed')
    }
  }, [onClose])

  return (
    <div className={`workstation-insights-panel ${className || ''}`}>
      {/* Header with Close Button */}
      <div className="insights-header">
        <h3 className="insights-title" id="insights-title">
          Insights & Analytics
        </h3>
        {onClose && (
          <button
            onClick={handleClose}
            className="insights-close-btn"
            aria-label="Close insights panel"
            title="Close insights panel"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Charts Section */}
      <div className="insights-content" role="region" aria-labelledby="insights-title">
        {/* Quick Stats Summary */}
        {insightsContent.hasStats && (
          <section className="insights-section">
            <h4 className="section-title">Summary</h4>
            <div className="insights-stats-summary">
              <div className="summary-item">
                <span className="summary-label">Total Users</span>
                <span className="summary-value">{insightsContent.totalUsers}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Active Rate</span>
                <span className="summary-value">{insightsContent.activeRate}%</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pending</span>
                <span className="summary-value">{insightsContent.pendingCount}</span>
              </div>
            </div>
          </section>
        )}

        {/* User Growth Chart */}
        <section className="insights-section">
          <h4 className="section-title">User Growth</h4>
          <div
            className="chart-placeholder"
            role="status"
            aria-label="User growth chart placeholder"
          >
            Chart will be loaded in Phase 3
          </div>
        </section>

        {/* Role Distribution Chart */}
        <section className="insights-section">
          <h4 className="section-title">By Role</h4>
          <div
            className="chart-placeholder"
            role="status"
            aria-label="Role distribution chart placeholder"
          >
            Chart will be loaded in Phase 3
          </div>
        </section>

        {/* Department Distribution Chart */}
        <section className="insights-section">
          <h4 className="section-title">By Department</h4>
          <div
            className="chart-placeholder"
            role="status"
            aria-label="Department distribution chart placeholder"
          >
            Chart will be loaded in Phase 3
          </div>
        </section>

        {/* Recommended Actions */}
        <section className="insights-section">
          <h4 className="section-title">Recommended Actions</h4>
          <div
            className="actions-placeholder"
            role="status"
            aria-label="Recommended actions placeholder"
          >
            <div style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              • Review pending approvals<br/>
              • Archive inactive users<br/>
              • Audit admin accounts<br/>
              <br/>
              <em style={{ fontSize: '0.75rem' }}>Recommendations will be enhanced in Phase 3</em>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default WorkstationInsightsPanel
