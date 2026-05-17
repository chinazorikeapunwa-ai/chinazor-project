import React from 'react';

interface SyncStatusDotProps {
  status: 'synced' | 'pending' | 'error' | 'conflict';
  className?: string;
}

export function SyncStatusDot({ status, className = '' }: SyncStatusDotProps) {
  const dotClass = `sync-dot sync-dot-${status}`;
  return <span className={`${dotClass} ${className}`}></span>;
}

interface SyncStatusBadgeProps {
  status: 'synced' | 'pending' | 'error' | 'conflict';
  className?: string;
}

export function SyncStatusBadge({ status, className = '' }: SyncStatusBadgeProps) {
  const labels = {
    synced: 'Synced',
    pending: 'Pending',
    error: 'Error',
    conflict: 'Conflict',
  };

  const badgeClass = `sync-status-${status} rounded-full px-2.5 py-0.5 text-xs font-medium`;
  return <span className={`${badgeClass} ${className}`}>{labels[status]}</span>;
}
