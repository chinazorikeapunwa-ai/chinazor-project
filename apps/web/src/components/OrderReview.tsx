import React, { useState } from 'react';
import { OrderItem } from '../types';
import { Card } from './Card';
import { Button } from './Button';

interface OrderReviewProps {
  items: OrderItem[];
  onUpdate: (items: OrderItem[], subtotal: number, tax: number, discount: number, total: number) => void;
}

export function OrderReview({ items, onUpdate }: OrderReviewProps) {
  const [taxRate, setTaxRate] = useState(10);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = Math.round((subtotal * taxRate) / 100);
  const finalTotal = subtotal + tax - discount;

  const handleUpdate = () => {
    onUpdate(items, subtotal, tax, discount, finalTotal);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Order Items</h3>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-slate-700">
                {item.productName} x {item.quantity}
              </span>
              <span className="font-medium">₦{item.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">₦{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="text-slate-600">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-16 border border-slate-300 rounded px-2 py-1 text-right"
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tax</span>
            <span className="font-medium">₦{tax.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="text-slate-600">Discount (₦)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-20 border border-slate-300 rounded px-2 py-1 text-right"
            />
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="font-semibold text-lg text-blue-600">₦{finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      <Button
        onClick={handleUpdate}
        variant="primary"
        className="w-full"
      >
        Review Order
      </Button>
    </div>
  );
}
