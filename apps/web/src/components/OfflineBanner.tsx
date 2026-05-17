import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setOnlineStatus, setSyncing } from '../store/appSlice';
import { syncEngine } from '../services/syncEngine';

interface OfflineBannerProps {
  onSync?: () => void;
}

export function OfflineBanner({ onSync }: OfflineBannerProps) {
  const dispatch = useDispatch();
  const { isOnline, isSyncing } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
      console.log('Back online - attempting sync');
      syncEngine.startSync().catch(console.error);
    };

    const handleOffline = () => {
      dispatch(setOnlineStatus(false));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  if (isOnline && !isSyncing) {
    return null;
  }

  return (
    <div className="offline-banner">
      {!isOnline ? (
        <>
          <span className="sync-dot sync-dot-error"></span>
          <span>No internet connection</span>
        </>
      ) : isSyncing ? (
        <>
          <span className="sync-dot sync-dot-pending"></span>
          <span>Syncing...</span>
        </>
      ) : null}
      {!isOnline && onSync && (
        <button
          onClick={onSync}
          className="ml-auto text-xs font-medium underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
