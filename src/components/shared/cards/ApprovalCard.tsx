'use client'

import React from 'react'
import { Approval } from '@/types/shared/entities/approval'
import { usePermissions } from '@/lib/use-permissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Clock, User, MessageSquare } from 'lucide-react'
import { ComponentVariant, CardComponentProps } from '../types'
import { formatDate, formatRelativeTime } from '@/lib/shared/formatters'

interface ApprovalCardProps extends CardComponentProps<Approval> {
  /** The approval to display */
  data: Approval
  /** Display variant */
  variant?: ComponentVariant
  /** Called when card is clicked */
  onClick?: () => void
  /** Called to approve (portal: respond) */
  onApprove?: (id: string) => void
  /** Called to reject (portal: respond with rejection) */
  onReject?: (id: string) => void
  /** Called to delete (admin only) */
  onDelete?: (id: string) => void
  /** Is loading */
  loading?: boolean
  /** Show action buttons */
  showActions?: boolean
}

/**
 * ApprovalCard Component
 *
 * Displays approval request information in a card format.
 * Portal variant: View and respond to approval requests
 * Admin variant: Full management of approvals
 * Compact variant: Minimal display for lists
 *
 * @example
 * ```tsx
 * // Portal usage
 * <ApprovalCard approval={approval} variant="portal" onApprove={handleApprove} />
 *
 * // Admin usage
 * <ApprovalCard approval={approval} variant="admin" onDelete={handleDelete} />
 * ```
 */
export default function ApprovalCard({
  data: approval,
  variant = 'portal',
  onClick,
  onApprove,
  onReject,
  onDelete,
  loading = false,
  showActions = true,
  className = '',
}: ApprovalCardProps) {
  const { has } = usePermissions()
  const canDeleteApproval = has('approvals:delete')

  if (!approval) return null

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
  }

  const isPending = approval.status === 'PENDING'
  const expiresAt = approval.expiresAt ? new Date(approval.expiresAt) : null
  const isExpired = expiresAt && expiresAt < new Date()

  // Compact variant
  if (variant === 'compact') {
    const requestedDate = approval.requestedAt ? new Date(approval.requestedAt) : null
    return (
      <div
        className={`flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer ${className}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`Approval request: ${approval.title}`}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{approval.title}</p>
          {requestedDate && (
            <p className="text-xs text-gray-500">
              Requested {formatRelativeTime(requestedDate)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Badge
            className={statusColors[approval.status] || 'bg-gray-100 text-gray-800'}
          >
            {approval.status}
          </Badge>
        </div>
      </div>
    )
  }

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onApprove && !loading && isPending) {
      onApprove(approval.id)
    }
  }

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onReject && !loading && isPending) {
      onReject(approval.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete && canDeleteApproval && !loading) {
      onDelete(approval.id)
    }
  }

  const requestedDate = approval.requestedAt ? new Date(approval.requestedAt) : null

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${className}`}
      onClick={onClick}
      role="article"
      aria-label={`Approval request: ${approval.title}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{approval.title}</CardTitle>
            {approval.description && (
              <CardDescription className="text-sm line-clamp-2">
                {approval.description}
              </CardDescription>
            )}
          </div>
          <Badge
            className={statusColors[approval.status] || 'bg-gray-100 text-gray-800'}
          >
            {approval.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
            {approval.status === 'APPROVED' && <Check className="h-3 w-3 mr-1" />}
            {approval.status === 'REJECTED' && <X className="h-3 w-3 mr-1" />}
            {approval.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Requested By */}
        {approval.requestedBy && (
          <div className="flex items-center gap-2 text-sm text-gray-700 pt-2 border-t">
            <User className="h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">{approval.requestedBy.name}</p>
              <p className="text-xs text-gray-500">Requested</p>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-1 gap-2 text-sm pt-2 border-t">
          {requestedDate && (
            <div>
              <p className="text-xs font-medium text-gray-600">Requested</p>
              <p className="text-gray-700">{formatDate(requestedDate, 'short')}</p>
            </div>
          )}
          {expiresAt && (
            <div>
              <p className={`text-xs font-medium ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                {isExpired ? 'Expired' : 'Expires'}
              </p>
              <p className={isExpired ? 'text-red-700 font-medium' : 'text-gray-700'}>
                {formatDate(expiresAt, 'short')}
              </p>
            </div>
          )}
        </div>

        {/* Approvers (Admin) */}
        {variant === 'admin' && approval.approvers && approval.approvers.length > 0 && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium text-gray-600">Approvers ({approval.approvers.length})</p>
            <div className="space-y-1">
              {approval.approvers.map((approver) => (
                <div
                  key={approver.id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                >
                  <span>{approver.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      approver.response === 'APPROVED'
                        ? 'bg-green-50 text-green-700'
                        : approver.response === 'REJECTED'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-yellow-50 text-yellow-700'
                    }
                  >
                    {approver.response || 'PENDING'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response From (Admin - if already responded) */}
        {variant === 'admin' && approval.respondedBy && (
          <div className="flex items-center gap-2 text-sm text-gray-700 pt-2 border-t">
            <User className="h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">{approval.respondedBy.name}</p>
              <p className="text-xs text-gray-500">
                {approval.status === 'APPROVED' ? 'Approved by' : 'Rejected by'}
              </p>
            </div>
          </div>
        )}

        {/* Comments */}
        {approval.comments && (
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Comments</p>
                <p className="text-gray-700 line-clamp-3">{approval.comments}</p>
              </div>
            </div>
          </div>
        )}

        {/* Priority Badge (if applicable) */}
        {approval.priority && (
          <div className="flex gap-2 pt-2 border-t">
            <Badge
              variant="outline"
              className={
                approval.priority === 'HIGH'
                  ? 'bg-red-50 text-red-700'
                  : approval.priority === 'MEDIUM'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-blue-50 text-blue-700'
              }
            >
              {approval.priority} Priority
            </Badge>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="pt-2 border-t space-y-2">
            {isPending ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  aria-label={`Approve ${approval.title}`}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label={`Reject ${approval.title}`}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-600 py-2">
                <p>
                  {approval.status === 'APPROVED' && '✓ Approved'}
                  {approval.status === 'REJECTED' && '✗ Rejected'}
                  {approval.status === 'EXPIRED' && '⏱ Expired'}
                </p>
              </div>
            )}

            {variant === 'admin' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                disabled={!canDeleteApproval || loading}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label={`Delete approval ${approval.id.slice(0, 8)}`}
              >
                <X className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}

        {/* Footer - Status info */}
        {!isPending && approval.respondedAt && (
          <div className="text-xs text-gray-500 text-right pt-1">
            {formatRelativeTime(new Date(approval.respondedAt))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
