import { requirePermission } from '@/lib/auth-guard'
import ManualTransaction from './ManualTransaction'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getCategories } from './actions'

const ManualTransactionPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  await requirePermission('manage_manual_transaction', slug)

  const session = await auth.api.getSession({
    headers: await headers()
  })

  const org = await auth.api.getFullOrganization({
    headers: await headers()
  })

  const categories = await getCategories()

  const dummyTransactions = [
    {
      id: 'tx_cuid_01',
      paymentMethodId: 'pm_qris_01',
      totalPrice: 1500000,
      detail: 'Pembayaran Project Landing Page Client A',
      receipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
      paymentMethod: 'QRIS',
      transactionCategory: 'Penjualan',
      transactionType: 'INCOME',
      organizationId: 'org_01',
      createdAt: new Date('2026-08-10T09:30:00Z'),
      updatedAt: new Date('2026-08-10T09:30:00Z'),
    },
    {
      id: 'tx_cuid_02',
      paymentMethodId: 'pm_bank_transfer_01',
      totalPrice: 350000,
      detail: 'Pembelian Kertas & Alat Tulis Kantor (ATK)',
      receipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
      paymentMethod: 'Transfer Bank - BCA',
      transactionCategory: 'Operasional',
      transactionType: 'EXPENSE',
      organizationId: 'org_01',
      createdAt: new Date('2026-08-11T14:15:00Z'),
      updatedAt: new Date('2026-08-11T14:15:00Z'),
    },
    {
      id: 'tx_cuid_03',
      paymentMethodId: 'pm_cash_01',
      totalPrice: 2500000,
      detail: 'Jasa Konsultasi IT & Maintenance Server',
      receipt: '', // Kosong jika tidak ada link struk
      paymentMethod: 'Tunai',
      transactionCategory: 'Jasa',
      transactionType: 'INCOME',
      organizationId: 'org_01',
      createdAt: new Date('2026-08-12T10:00:00Z'),
      updatedAt: new Date('2026-08-12T10:00:00Z'),
    },
    {
      id: 'tx_cuid_04',
      paymentMethodId: 'pm_credit_card_01',
      totalPrice: 850000,
      detail: 'Langganan Server Cloud & Domain Vercel',
      receipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
      paymentMethod: 'Kartu Kredit',
      transactionCategory: 'Langganan (SaaS)',
      transactionType: 'EXPENSE',
      organizationId: 'org_01',
      createdAt: new Date('2026-08-12T16:45:00Z'),
      updatedAt: new Date('2026-08-12T16:45:00Z'),
    },
    {
      id: 'tx_cuid_05',
      paymentMethodId: 'pm_qris_02',
      totalPrice: 200000,
      detail: 'Pembayaran DP Pembuatan Logo & Branding',
      receipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
      paymentMethod: 'QRIS',
      transactionCategory: 'Penjualan',
      transactionType: 'INCOME',
      organizationId: 'org_01',
      createdAt: new Date('2026-08-13T08:20:00Z'),
      updatedAt: new Date('2026-08-13T08:20:00Z'),
    },
  ]

  return (
    <>
      <ManualTransaction user={session?.user} initialTransactionCategories={categories} initialTransactions={dummyTransactions} organizationName={org?.name}/>
    </>
  )
}

export default ManualTransactionPage