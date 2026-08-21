import prisma from "../lib/prisma";
import "dotenv/config";

const products = [
  { name: "Kopi Susu Gula Aren", price: 18000, stock: 50, organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Americano Cold Brew", price: 22000, stock: 35, organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Matcha Latte Ice", price: 25000, stock: 20, organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Roti Bakar Cokelat Keju", price: 15000, stock: 15, organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "French Fries Classic", price: 12000, stock: 40, organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Nasi Goreng Spesial", price: 28000, stock: 25, organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Chicken Katsu Don", price: 32000, stock: 18, organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Earle Grey Milk Tea", price: 20000, stock: 30, organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Croissant Almond", price: 24000, stock: 12, organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Air Mineral 600ml", price: 5000, stock: 100, organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
];

const categories = [
  { name: "Kopi & Espresso", organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Non-Kopi & Tea", organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Makanan Berat", organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Camilan & Snack", organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Pastry & Bakery", organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Minuman Dingin", organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Dessert", organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Paket Hemat", organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Toping & Extra", organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
  { name: "Minuman Kemasan", organizationId: "oS5Qwc77rMM1Pi7GsD9KLAYw7ximGzZI" },
];

// Mapping relasi berdasarkan Nama Produk -> Nama Kategori
const productCategoryRelations: Record<string, string[]> = {
  "Kopi Susu Gula Aren": ["Kopi & Espresso", "Minuman Dingin"],
  "Americano Cold Brew": ["Kopi & Espresso", "Minuman Dingin"],
  "Matcha Latte Ice": ["Non-Kopi & Tea", "Minuman Dingin"],
  "Roti Bakar Cokelat Keju": ["Camilan & Snack", "Dessert"],
  "French Fries Classic": ["Camilan & Snack"],
  "Nasi Goreng Spesial": ["Makanan Berat"],
  "Chicken Katsu Don": ["Makanan Berat"],
  "Earle Grey Milk Tea": ["Non-Kopi & Tea", "Minuman Dingin"],
  "Croissant Almond": ["Pastry & Bakery"],
  "Air Mineral 600ml": ["Minuman Kemasan", "Minuman Dingin"],
};

async function main() {
  // 1. Insert Products dan Categories
  await prisma.product.createMany({ data: products });
  await prisma.productCategory.createMany({ data: categories });

  // 2. Fetch data dari database untuk mengambil ID-nya
  const dbProducts = await prisma.product.findMany({
    select: { id: true, name: true },
  });
  const dbCategories = await prisma.productCategory.findMany({
    select: { id: true, name: true },
  });

  // Buat Map/Dictionary agar pencarian ID berdasarkan Nama lebih cepat (O(1))
  const productMap = new Map(dbProducts.map((p) => [p.name, p.id]));
  const categoryMap = new Map(dbCategories.map((c) => [c.name, c.id]));

  // 3. Susun array relation untuk ProductHasCategory
  const relationsData: { productId: string; categoryId: string }[] = [];

  for (const [productName, categoryNames] of Object.entries(productCategoryRelations)) {
    const productId = productMap.get(productName);

    if (!productId) continue;

    for (const categoryName of categoryNames) {
      const categoryId = categoryMap.get(categoryName);
      if (categoryId) {
        relationsData.push({ productId, categoryId });
      }
    }
  }

  // 4. Insert data pivot/junction table
  await prisma.productHasCategory.createMany({
    data: relationsData,
    skipDuplicates: true, // Mencegah error jika composite primary key (productId, categoryId) sudah ada
  });

  console.log("Seeding berhasil!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });