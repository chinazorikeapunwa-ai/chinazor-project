import React, { useState, useEffect } from 'react';
import { getClients, searchClients } from '../db/clients';
import { Client } from '../types';
import { Card } from './Card';
import { Input } from './FormInputs';
import { Button } from './Button';

interface ClientSelectProps {
  onSelect: (client: Client) => void;
}

export function ClientSelect({ onSelect }: ClientSelectProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await getClients();
      const active = data.filter((c) => !c.deleted);
      setClients(active);
      setFilteredClients(active);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleSearch = async (value: string) => {
    setSearch(value);
    if (value.trim()) {
      const results = await searchClients(value);
      setFilteredClients(results);
    } else {
      setFilteredClients(clients);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search clients..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && filteredClients.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => {
                onSelect(client);
                setSearch('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
            >
              <div className="font-medium text-slate-900">{client.name}</div>
              <div className="text-xs text-slate-500">{client.phone}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
