import prisma from "../prisma"
import { requireOrganization, requireAIPermission } from "../auth-guard"

export async function getSalesFromDB(startDate?: string, endDate?: string, isAllTime?: boolean) {
  const store = await requireOrganization()

  await requireAIPermission('manage_transactions', store?.slug)

  const whereClause: any = {
    organizationId: store?.id,
  }

  const fetchAllTime = isAllTime || (!startDate && !endDate);

  if (!fetchAllTime) {
    const todayStr = new Date().toISOString().split('T')[0]
    const finalStart = startDate || todayStr
    const finalEnd = endDate || todayStr

    const start = new Date(finalStart)
    start.setHours(0, 0, 0, 0)

    const end = new Date(finalEnd)
    end.setHours(23, 59, 59, 999)

    whereClause.createdAt = {
      gte: start,
      lte: end,
    }
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      totalPrice: true,
      transactionType: true,
      transactionCategory: true,
      paymentMethod: true,
      createdAt: true,
      detail: true,
    },
  })

  let periodLabel = "Keseluruhan (Semua Waktu)"
  if (!fetchAllTime) {
    const todayStr = new Date().toISOString().split('T')[0]
    const startStr = startDate || todayStr
    const endStr = endDate || todayStr
    periodLabel = startStr === endStr ? startStr : `${startStr} s/d ${endStr}`
  } else if (transactions.length > 0) {
    const dates = transactions.map((t) => new Date(t.createdAt).getTime())
    const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0]
    const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0]
    periodLabel = `Keseluruhan (${minDate} s/d ${maxDate})`
  }

  if (transactions.length === 0) {
    return {
      status: "NO_DATA",
      message: "Belum ada transaksi/data penjualan di database toko untuk periode ini.",
      period: periodLabel,
      totalSales: 0,
      totalTransactions: 0,
      averagePerTransaction: 0,
      transactions: [],
    }
  }

  const incomeTransactions = transactions.filter((t) => t.transactionType === 'INCOME')
  const totalSales = incomeTransactions.reduce((acc, t) => acc + t.totalPrice, 0)
  const totalTransactions = transactions.length
  const averagePerTransaction = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0

  return {
    status: "SUCCESS",
    period: periodLabel,
    totalSales,
    totalTransactions,
    averagePerTransaction,
    incomeTransactionCount: incomeTransactions.length,
    recentTransactionsSummary: transactions.slice(0, 50).map((t) => ({
      id: t.id,
      totalPrice: t.totalPrice,
      type: t.transactionType,
      category: t.transactionCategory,
      paymentMethod: t.paymentMethod,
      createdAt: t.createdAt.toISOString(),
      detail: t.detail,
    })),
  }
}

export async function getProductsFromDB() {
  const store = await requireOrganization()
  await requireAIPermission('manage_products', store?.slug)

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { organizationId: store?.id },
      select: { id: true, name: true, price: true, stock: true, unit: true, trackStock: true },
    }),
    prisma.productCategory.findMany({
      where: { organizationId: store?.id },
      select: { id: true, name: true },
    }),
  ])

  return { totalProducts: products.length, products, categories }
}

export async function getStaffFromDB() {
  const store = await requireOrganization()
  await requireAIPermission('manage_staff', store?.slug)

  const members = await prisma.member.findMany({
    where: { organizationId: store?.id },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: {
        select: { name: true, email: true, image: true },
      },
    },
  })

  return members.map((m) => ({
    memberId: m.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    joinedAt: m.createdAt,
  }))
}

export async function getTransactionsFromDB() {
  const store = await requireOrganization()
  await requireAIPermission('manage_transactions', store?.slug)

  const transactions = await prisma.transaction.findMany({
    where: { organizationId: store?.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      totalPrice: true,
      detail: true,
      paymentMethod: true,
      transactionCategory: true,
      transactionType: true,
      createdAt: true,
    },
  })

  return transactions
}

export async function getPaymentMethodsFromDB() {
  const store = await requireOrganization()
  await requireAIPermission('manage_transaction_method', store?.slug)

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { organizationId: store?.id },
    select: { id: true, name: true, createdAt: true },
  })

  return paymentMethods
}

export async function getUserInfoFromDB(query: string) {
  const store = await requireOrganization()
  await requireAIPermission('manage_staff', store?.slug)

  // Cari anggota toko berdasarkan nama atau email
  const member = await prisma.member.findFirst({
    where: {
      organizationId: store?.id,
      user: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    },
    select: {
      role: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  if (!member) {
    return { message: `Anggota/Pengguna dengan nama atau email "${query}" tidak ditemukan di toko ini.` }
  }

  return {
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    joinedAt: member.createdAt,
  }
}