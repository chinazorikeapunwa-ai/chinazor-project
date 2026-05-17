import React, { useState } from 'react';
import { getProducts, searchProducts } from '../db/products';
import { Product } from '../types';
import { Card } from './Card';
import { Input } from './FormInputs';
import { Button } from './Button';

interface ProductPickerProps {
  onAddItem: (product: Product, quantity: number) => void;
}

export function ProductPicker({ onAddItem }: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  React.useEffect(() => {
    loadProducts();
  }, []);

  const handleSearch = async (value: string) => {
    setSearch(value);
    if (value.trim()) {
      const results = await searchProducts(value);
      setFilteredProducts(results);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleAdd = () => {
    if (selectedProduct && quantity > 0) {
      onAddItem(selectedProduct, quantity);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Product</label>
        <Input
          type="text"
          placeholder="Search product name or SKU..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {filteredProducts.length > 0 && !selectedProduct && (
        <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-slate-900">{product.name}</div>
                  <div className="text-xs text-slate-500">SKU: {product.sku}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₦{product.unitPrice.toLocaleString()}</div>
                  <div className={`text-xs ${
                    product.stockQuantity <= 0
                      ? 'text-red-600'
                      : product.stockQuantity <= product.reorderLevel
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}>
                    Stock: {product.stockQuantity}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedProduct && (
        <Card className="bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-slate-900 mb-3">{selectedProduct.name}</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 mb-1">Unit Price: ₦{selectedProduct.unitPrice.toLocaleString()}</p>
              <p className="text-sm text-slate-600">Stock: {selectedProduct.stockQuantity}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 border border-slate-300 rounded"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-12 text-center border border-slate-300 rounded py-1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 border border-slate-300 rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                variant="primary"
                className="flex-1"
              >
                Add to Order
              </Button>
              <Button
                onClick={() => setSelectedProduct(null)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
