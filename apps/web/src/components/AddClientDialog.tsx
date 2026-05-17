import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input, TextArea, Select } from './FormInputs';
import { Client } from '../types';

interface AddClientDialogProps {
  onSave: (client: Partial<Client>) => void;
  onCancel: () => void;
}

export function AddClientDialog({ onSave, onCancel }: AddClientDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    businessType: 'retail',
    creditLimit: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Client name is required');
      return;
    }
    onSave({
      ...formData,
      creditLimit: formData.creditLimit ? Number(formData.creditLimit) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Add New Client</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Business Name *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Mama Ngozi Stores"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Phone</label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234..."
              type="tel"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              type="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Address</label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Location/Area"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Business Type</label>
            <Select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
            >
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="restaurant">Restaurant</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Credit Limit (₦)</label>
            <Input
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleChange}
              placeholder="0"
              type="number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
            <TextArea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              Save Client
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
