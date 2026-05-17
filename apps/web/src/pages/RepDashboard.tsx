import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getProducts } from '../db/products';
import { getOrders, getCurrentCart, updateCart, getOrdersByStatus } from '../db/orders';
import { getClients } from '../db/clients';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SyncStatusDot } from '../components/SyncStatus';
import { Product, Client, Order } from '../types';

export function RepDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isOnline } = useSelector((state: RootState) => state.app);
  const [stats, setStats] = useState({ orders: 0, revenue: 0, clients: 0 });
  const [pendingItems, setPendingItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [orders, clients, products] = await Promise.all([
        getOrders(),
        getClients(),
        getProducts(),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(
        (o) => new Date(o.createdAt) >= today && o.createdBy === user?.id
      );

      const revenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
      const pendingSync = orders.filter((o) => (o as any).syncStatus === 'pending').length;

      setStats({
        orders: todayOrders.length,
        revenue,
        clients: clients.filter((c) => !c.deleted).length,
      });
      setPendingItems(pendingSync);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <h2 className="text-sm font-medium text-slate-500 mb-2">Today's Orders</h2>
          <p className="text-3xl font-semibold text-slate-900">{stats.orders}</p>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-slate-500 mb-2">Today's Revenue</h2>
          <p className="text-3xl font-semibold text-slate-900">₦{stats.revenue.toLocaleString()}</p>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-slate-500 mb-2">Active Clients</h2>
          <p className="text-3xl font-semibold text-slate-900">{stats.clients}</p>
        </Card>
      </div>

      {pendingItems > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2">
            <SyncStatusDot status="pending" />
            <span className="text-sm text-yellow-800">{pendingItems} items waiting to sync</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button variant="primary" className="w-full">
          New Order
        </Button>
        <Button variant="secondary" className="w-full">
          Add Client
        </Button>
      </div>
    </div>
  );
}
