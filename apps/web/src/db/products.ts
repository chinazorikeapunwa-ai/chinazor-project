import { getDB } from './index';
import { Product } from '../types';

export async function saveProducts(products: Product[]) {
  const db = await getDB();
  const tx = db.transaction('products', 'readwrite');

  for (const product of products) {
    await tx.store.put({
      ...product,
      lastSynced: Date.now(),
    });
  }

  await tx.done;
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDB();
  return db.getAll('products');
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const db = await getDB();
  return db.get('products', id);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const db = await getDB();
  const products = await db.getAll('products');
  const lowerQuery = query.toLowerCase();

  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery) ||
      p.category?.toLowerCase().includes(lowerQuery)
  );
}

export async function getLowStockProducts(): Promise<Product[]> {
  const db = await getDB();
  const products = await db.getAll('products');
  return products.filter((p) => p.stockQuantity <= p.reorderLevel);
}
