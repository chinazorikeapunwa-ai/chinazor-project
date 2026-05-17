import React, { useState, useEffect } from 'react';
import { clearAllData } from '../db';
import { syncEngine } from '../services/syncEngine';
import { getQueueItems, clearQueue } from '../db/orders';
import { Card } from './Card';
import { Button } from './Button';
import { SyncQueueItem } from '../types';

export function DevTools() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadQueueItems();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadQueueItems = async () => {
    try {
      const items = await getQueueItems();
      setQueueItems(items);
    } catch (error) {
      console.error('Error loading queue:', error);
    }
  };

  const toggleOnline = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    const event = new Event(newState ? 'online' : 'offline');
    window.dispatchEvent(event);
    addLog(`Network toggled to ${newState ? 'ONLINE' : 'OFFLINE'}`);
  };

  const handleManualSync = async () => {
    addLog('Starting manual sync...');
    try {
      const result = await syncEngine.startSync();
      addLog(`Sync complete: ${result?.processed || 0} processed, ${result?.failed || 0} failed`);
      await loadQueueItems();
    } catch (error) {
      addLog(`Sync error: ${(error as Error).message}`);
    }
  };

  const handleClearQueue = async () => {
    if (confirm('Clear entire sync queue?')) {
      await clearQueue();
      await loadQueueItems();
      addLog('Sync queue cleared');
    }
  };

  const handleClearDB = async () => {
    if (confirm('Clear all local data? This cannot be undone.')) {
      await clearAllData();
      addLog('All local data cleared');
    }
  };

  const addLog = (message: string) => {
    setSyncLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 49),
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg"
      >
        🛠️
      </button>

      {expanded && (
        <Card className="fixed bottom-20 right-4 w-96 max-h-[80vh] overflow-y-auto shadow-xl">
          <h2 className="text-lg font-bold text-purple-600 mb-4">Dev Tools</h2>

          <div className="mb-4 p-3 bg-slate-100 rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}></span>
              <span className="font-semibold">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <Button
              variant="secondary"
              onClick={toggleOnline}
              className="w-full text-xs"
            >
              Toggle Network
            </Button>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 mb-2">Sync Queue ({queueItems.length})</h3>
            <div className="bg-slate-50 rounded p-2 max-h-32 overflow-y-auto text-xs space-y-1">
              {queueItems.length === 0 ? (
                <p className="text-slate-600">Queue is empty</p>
              ) : (
                queueItems.map((item) => (
                  <div key={item.id} className="text-xs text-slate-700 border-b border-slate-200 pb-1">
                    <strong>{item.operation}</strong> {item.table}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-1 mt-2">
              <Button
                variant="primary"
                onClick={handleManualSync}
                className="flex-1 text-xs py-1"
              >
                Sync
              </Button>
              <Button
                variant="danger"
                onClick={handleClearQueue}
                className="flex-1 text-xs py-1"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 mb-2">Logs</h3>
            <div className="bg-slate-900 text-green-400 rounded p-2 max-h-40 overflow-y-auto text-xs font-mono">
              {syncLogs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>

          <Button
            variant="danger"
            onClick={handleClearDB}
            className="w-full text-xs mb-2"
          >
            Clear All Data
          </Button>

          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-slate-600 hover:text-slate-900 underline"
          >
            Close
          </button>
        </Card>
      )}
    </div>
  );
}
