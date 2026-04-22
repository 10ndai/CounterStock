import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  // Beef
  { name: "Beef Ribeye", category: "Beef", pricePerKgUSD: 9.5, soldByWeight: true, stockKg: 15, lowStockThresholdKg: 2 },
  { name: "Beef Sirloin", category: "Beef", pricePerKgUSD: 8.5, soldByWeight: true, stockKg: 12, lowStockThresholdKg: 2 },
  { name: "Beef Mince", category: "Beef", pricePerKgUSD: 5.5, soldByWeight: true, stockKg: 20, lowStockThresholdKg: 3 },
  { name: "Beef Brisket", category: "Beef", pricePerKgUSD: 6.0, soldByWeight: true, stockKg: 10, lowStockThresholdKg: 2 },
  { name: "Beef Tripe", category: "Beef", pricePerKgUSD: 3.5, soldByWeight: true, stockKg: 8, lowStockThresholdKg: 2 },
  { name: "Oxtail", category: "Beef", pricePerKgUSD: 7.0, soldByWeight: true, stockKg: 5, lowStockThresholdKg: 1 },
  { name: "Commercial Stewing Beef", category: "Beef", pricePerKgUSD: 4.5, soldByWeight: true, stockKg: 20, lowStockThresholdKg: 2 },

  // Pork
  { name: "Pork Chops", category: "Pork", pricePerKgUSD: 5.0, soldByWeight: true, stockKg: 18, lowStockThresholdKg: 2 },
  { name: "Pork Belly", category: "Pork", pricePerKgUSD: 4.5, soldByWeight: true, stockKg: 10, lowStockThresholdKg: 2 },
  { name: "Pork Mince", category: "Pork", pricePerKgUSD: 4.0, soldByWeight: true, stockKg: 12, lowStockThresholdKg: 2 },
  { name: "Pork Ribs", category: "Pork", pricePerKgUSD: 5.5, soldByWeight: true, stockKg: 8, lowStockThresholdKg: 1.5 },

  // Poultry
  { name: "Whole Chicken", category: "Poultry", pricePerKgUSD: 3.5, soldByWeight: true, stockKg: 25, lowStockThresholdKg: 3 },
  { name: "Road Runner (Huku)", category: "Poultry", pricePerKgUSD: 5.0, soldByWeight: true, stockKg: 10, lowStockThresholdKg: 2 },
  { name: "Chicken Braai Pieces", category: "Poultry", pricePerKgUSD: 3.8, soldByWeight: true, stockKg: 20, lowStockThresholdKg: 3 },
  { name: "Chicken Livers", category: "Poultry", pricePerKgUSD: 2.5, soldByWeight: true, stockKg: 8, lowStockThresholdKg: 1.5 },
  { name: "Chicken Feet (Walkie Talkies)", category: "Poultry", pricePerKgUSD: 1.5, soldByWeight: true, stockKg: 10, lowStockThresholdKg: 2 },

  // Goat
  { name: "Goat Leg", category: "Goat", pricePerKgUSD: 7.5, soldByWeight: true, stockKg: 8, lowStockThresholdKg: 1.5 },
  { name: "Goat Chops", category: "Goat", pricePerKgUSD: 7.0, soldByWeight: true, stockKg: 6, lowStockThresholdKg: 1 },
  { name: "Goat Mince", category: "Goat", pricePerKgUSD: 6.0, soldByWeight: true, stockKg: 5, lowStockThresholdKg: 1 },

  // Processed
  { name: "Matemba (Dried Fish)", category: "Processed", pricePerKgUSD: 4.0, soldByWeight: true, stockKg: 10, lowStockThresholdKg: 1.5 },
  { name: "Boerewors", category: "Processed", pricePerKgUSD: 5.0, soldByWeight: true, stockKg: 15, lowStockThresholdKg: 2 },
  { name: "Polony (500g)", category: "Processed", pricePerKgUSD: 2.0, pricePerUnitUSD: 1.0, soldByWeight: false, stockKg: 10, lowStockThresholdKg: 2, unitWeightKg: 0.5 },
  { name: "Sausage Pack (6s)", category: "Processed", pricePerKgUSD: 4.5, pricePerUnitUSD: 2.5, soldByWeight: false, stockKg: 8, lowStockThresholdKg: 1.5, unitWeightKg: 0.55 },
  { name: "Bacon (250g)", category: "Processed", pricePerKgUSD: 8.0, pricePerUnitUSD: 2.0, soldByWeight: false, stockKg: 5, lowStockThresholdKg: 1, unitWeightKg: 0.25 },
];

async function main() {
  console.log("Seeding database...");

  await prisma.settings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", usdToZwgRate: 35.50 },
  });

  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        category: product.category,
        pricePerKgUSD: product.pricePerKgUSD,
        pricePerUnitUSD: product.pricePerUnitUSD ?? null,
        soldByWeight: product.soldByWeight,
        stockKg: product.stockKg,
        lowStockThresholdKg: product.lowStockThresholdKg,
        unitWeightKg: product.unitWeightKg ?? null,
      },
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
