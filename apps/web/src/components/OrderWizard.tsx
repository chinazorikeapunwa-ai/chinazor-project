import React, { useState } from 'react';
import { createOrder, clearCart } from '../db/orders';
import { createClient } from '../db/clients';
import { Card } from './Card';
import { Button } from './Button';
import { Input, Select, TextArea } from './FormInputs';
import { ClientSelect } from './ClientSelect';
import { ProductPicker } from './ProductPicker';
import { OrderReview } from './OrderReview';
import { AddClientDialog } from './AddClientDialog';
import { Order, OrderItem, Product, Client } from '../types';

type Step = 'client' | 'products' | 'review' | 'confirm';

interface OrderWizardProps {
  onComplete?: (order: Order) => void;
  userId: string;
}

export function OrderWizard({ onComplete, userId }: OrderWizardProps) {
  const [step, setStep] = useState<Step>('client');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [orderData, setOrderData] = useState<{
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = (product: Product, quantity: number) => {
    const itemTotal = product.unitPrice * quantity;
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        unitPrice: product.unitPrice,
        quantity,
        total: itemTotal,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddClientSubmit = async (clientData: Partial<Client>) => {
    try {
      const newClient = await createClient(clientData);
      setSelectedClient(newClient as Client);
      setShowAddClient(false);
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client');
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedClient || !orderData) {
      alert('Missing required information');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        clientId: selectedClient.id,
        createdBy: userId,
        items,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        discount: orderData.discount,
        total: orderData.total,
        status: 'submitted',
        paymentMethod,
        notes,
      });

      await clearCart();
      setStep('confirm');
      onComplete?.(order as Order);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('client');
    setSelectedClient(null);
    setItems([]);
    setOrderData(null);
    setPaymentMethod('cash');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Step Indicator */}
      <div className="flex gap-2 sticky top-16 bg-slate-50 p-4 z-10">
        {(['client', 'products', 'review', 'confirm'] as const).map((s, idx) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full ${
              step === s
                ? 'bg-blue-600'
                : (['client', 'products', 'review'].includes(s) &&
                    ['client', 'products', 'review', 'confirm'].indexOf(step) > idx)
                ? 'bg-green-600'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Select Client */}
      {step === 'client' && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Step 1: Select Client</h2>

          {selectedClient ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="font-medium text-slate-900">{selectedClient.name}</div>
              <div className="text-sm text-slate-600">{selectedClient.phone}</div>
              <Button
                variant="secondary"
                onClick={() => setSelectedClient(null)}
                className="mt-3 w-full"
              >
                Change Client
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <ClientSelect onSelect={(client) => setSelectedClient(client)} />
              <Button
                variant="secondary"
                onClick={() => setShowAddClient(true)}
                className="w-full"
              >
                + Add New Client
              </Button>
            </div>
          )}

          {selectedClient && (
            <Button
              variant="primary"
              onClick={() => setStep('products')}
              className="w-full mt-4"
            >
              Next: Add Products
            </Button>
          )}
        </Card>
      )}

      {/* Step 2: Add Products */}
      {step === 'products' && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Step 2: Add Products</h2>

          <ProductPicker onAddItem={handleAddItem} />

          {items.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Selected Items ({items.length})</h3>
              <div className="space-y-2 mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                    <div className="text-sm">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-slate-600">x{item.quantity} @ ₦{item.unitPrice.toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="primary"
                  onClick={() => setStep('review')}
                  className="flex-1"
                >
                  Next: Review Order
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setStep('client')}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Review Order */}
      {step === 'review' && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Step 3: Review Order</h2>
          <OrderReview
            items={items}
            onUpdate={(items, subtotal, tax, discount, total) => {
              setOrderData({ subtotal, tax, discount, total });
              setStep('confirm');
            }}
          />
        </Card>
      )}

      {/* Step 4: Confirm */}
      {step === 'confirm' && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Step 4: Confirm Order</h2>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Client</p>
              <p className="font-semibold text-slate-900">{selectedClient?.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Payment Method</label>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
                <option value="transfer">Transfer</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Notes</label>
              <TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>

            {orderData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">₦{orderData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-medium">₦{orderData.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2 pb-2 border-b border-blue-200">
                  <span className="text-slate-600">Discount</span>
                  <span className="font-medium">−₦{orderData.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-blue-600">₦{orderData.total.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="primary"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Order'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setStep('review')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </div>
        </Card>
      )}

      {showAddClient && (
        <AddClientDialog
          onSave={handleAddClientSubmit}
          onCancel={() => setShowAddClient(false)}
        />
      )}
    </div>
  );
}
