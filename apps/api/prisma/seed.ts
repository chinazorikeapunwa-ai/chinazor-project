import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

const NIGERIAN_SHOPS = [
  { name: 'Mama Ngozi Stores', area: 'Lekki', type: 'retail' },
  { name: 'Adebola Supermarket', area: 'Victoria Island', type: 'wholesale' },
  { name: 'Ikeja Mallmart', area: 'Ikeja', type: 'retail' },
  { name: 'Oshodi Express Mart', area: 'Oshodi', type: 'retail' },
  { name: 'Yaba Quick Shop', area: 'Yaba', type: 'retail' },
  { name: 'Surulere Choice Foods', area: 'Surulere', type: 'wholesale' },
  { name: 'Ajah Business Center', area: 'Ajah', type: 'restaurant' },
  { name: 'Ikoyi Premium Store', area: 'Ikoyi', type: 'retail' },
  { name: 'Mushin Market Plaza', area: 'Mushin', type: 'wholesale' },
  { name: 'Epe Trading Post', area: 'Epe', type: 'retail' },
  { name: 'Apapa Logistics Hub', area: 'Apapa', type: 'wholesale' },
  { name: 'Bariga Convenience Store', area: 'Bariga', type: 'retail' },
  { name: 'Ikoyi Grill House', area: 'Ikoyi', type: 'restaurant' },
  { name: 'Abule Egba Shop', area: 'Abule Egba', type: 'retail' },
  { name: 'Gbagada Mini Mart', area: 'Gbagada', type: 'retail' },
  { name: 'Magodo Store', area: 'Magodo', type: 'retail' },
  { name: 'Sangotedo Depot', area: 'Sangotedo', type: 'wholesale' },
  { name: 'Festac Point Shop', area: 'Festac', type: 'retail' },
  { name: 'Lbs Business Center', area: 'Lekki', type: 'restaurant' },
  { name: 'Covenant Gardens Store', area: 'Ikoyi', type: 'retail' },
];

const PRODUCTS = [
  // Beverages
  { name: 'Coca-Cola 50cl', sku: 'BEVO001', price: 250, stock: 500, category: 'Beverages', reorder: 50 },
  { name: 'Pepsi 50cl', sku: 'BEVO002', price: 250, stock: 400, category: 'Beverages', reorder: 50 },
  { name: 'Sprite 50cl', sku: 'BEVO003', price: 250, stock: 300, category: 'Beverages', reorder: 50 },
  { name: 'Fanta Orange 50cl', sku: 'BEVO004', price: 200, stock: 350, category: 'Beverages', reorder: 50 },
  { name: 'Pure Water (20 liters)', sku: 'BEVO005', price: 300, stock: 200, category: 'Beverages', reorder: 30 },
  
  // Snacks
  { name: 'Chin Chin (50g)', sku: 'SNCK001', price: 150, stock: 600, category: 'Snacks', reorder: 100 },
  { name: 'Plantain Chips (40g)', sku: 'SNCK002', price: 200, stock: 450, category: 'Snacks', reorder: 80 },
  { name: 'Popcorn (30g)', sku: 'SNCK003', price: 100, stock: 350, category: 'Snacks', reorder: 60 },
  { name: 'Biscuits (200g)', sku: 'SNCK004', price: 500, stock: 280, category: 'Snacks', reorder: 40 },
  { name: 'Peanuts (100g)', sku: 'SNCK005', price: 300, stock: 220, category: 'Snacks', reorder: 35 },
  
  // Household
  { name: 'Detergent Powder (1kg)', sku: 'HOUS001', price: 1500, stock: 150, category: 'Household', reorder: 20 },
  { name: 'Soap Bar (Pack of 3)', sku: 'HOUS002', price: 800, stock: 200, category: 'Household', reorder: 30 },
  { name: 'Bleach (1 liter)', sku: 'HOUS003', price: 600, stock: 120, category: 'Household', reorder: 20 },
  { name: 'Salt (1kg)', sku: 'HOUS004', price: 350, stock: 400, category: 'Household', reorder: 50 },
  { name: 'Sugar (1kg)', sku: 'HOUS005', price: 1200, stock: 180, category: 'Household', reorder: 25 },
  
  // Personal Care
  { name: 'Toothpaste (150g)', sku: 'CARE001', price: 450, stock: 320, category: 'Personal Care', reorder: 50 },
  { name: 'Deodorant Spray (150ml)', sku: 'CARE002', price: 800, stock: 180, category: 'Personal Care', reorder: 30 },
  { name: 'Hair Cream (200g)', sku: 'CARE003', price: 1200, stock: 140, category: 'Personal Care', reorder: 20 },
  { name: 'Body Lotion (200ml)', sku: 'CARE004', price: 1500, stock: 100, category: 'Personal Care', reorder: 15 },
  { name: 'Shampoo (500ml)', sku: 'CARE005', price: 1800, stock: 95, category: 'Personal Care', reorder: 15 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.syncLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fieldsales.com',
      username: 'admin',
      passwordHash: await bcryptjs.hash('admin123', 10),
      role: 'admin',
      name: 'Admin User',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@fieldsales.com',
      username: 'manager',
      passwordHash: await bcryptjs.hash('manager123', 10),
      role: 'manager',
      name: 'Manager User',
    },
  });

  const rep1 = await prisma.user.create({
    data: {
      email: 'rep1@fieldsales.com',
      username: 'rep1',
      passwordHash: await bcryptjs.hash('rep123', 10),
      role: 'rep',
      name: 'Sales Rep 1',
    },
  });

  const rep2 = await prisma.user.create({
    data: {
      email: 'rep2@fieldsales.com',
      username: 'rep2',
      passwordHash: await bcryptjs.hash('rep123', 10),
      role: 'rep',
      name: 'Sales Rep 2',
    },
  });

  console.log('✅ Users created');

  // Create clients
  const clients = await Promise.all(
    NIGERIAN_SHOPS.map((shop, i) =>
      prisma.client.create({
        data: {
          name: shop.name,
          phone: `+234${Math.random().toString().slice(2, 12)}`,
          email: `${shop.name.toLowerCase().replace(/\s+/g, '.')}@shop.com`,
          address: `${shop.area}, Lagos`,
          businessType: shop.type,
          assignedTo: i % 2 === 0 ? rep1.id : rep2.id,
          creditLimit: new Decimal(10000 + Math.random() * 40000),
          notes: `${shop.area} branch`,
        },
      })
    )
  );

  console.log('✅ Clients created');

  // Create products
  const products = await Promise.all(
    PRODUCTS.map((prod) =>
      prisma.product.create({
        data: {
          name: prod.name,
          sku: prod.sku,
          unitPrice: new Decimal(prod.price),
          stockQuantity: prod.stock,
          reorderLevel: prod.reorder,
          category: prod.category,
        },
      })
    )
  );

  console.log('✅ Products created');

  // Create sample orders
  for (let i = 0; i < 10; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 20) + 1;
      const itemTotal = Number(product.unitPrice) * quantity;
      subtotal += itemTotal;
      items.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.unitPrice,
        quantity,
        total: new Decimal(itemTotal),
      });
    }

    const tax = new Decimal(Math.floor(subtotal * 0.1));
    const total = new Decimal(subtotal) + tax;

    await prisma.order.create({
      data: {
        clientId: client.id,
        createdBy: i % 2 === 0 ? rep1.id : rep2.id,
        subtotal: new Decimal(subtotal),
        tax,
        discount: new Decimal(0),
        total,
        status: ['draft', 'submitted', 'processing', 'shipped'][Math.floor(Math.random() * 4)],
        paymentMethod: ['cash', 'credit', 'transfer'][Math.floor(Math.random() * 3)],
        items: {
          create: items,
        },
      },
    });
  }

  console.log('✅ Sample orders created');
  console.log('\n🎉 Database seeded successfully!');
}

import { Decimal } from '@prisma/client/runtime/library';

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
