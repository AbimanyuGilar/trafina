import React from "react"
import { requirePermission } from "@/lib/auth-guard"
import { getTransactions } from "./actions"
import TransactionHistoryClient from "./TransactionHistoryClient"

const TransactionHistoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params

  await requirePermission("manage_transaction_history", slug)

  const result = await getTransactions()

  console.log("HASIL GET TRANSACTIONS:", result)

  return (
    <div>
      <TransactionHistoryClient
        transactions={result.success ? result.data : []}
      />
    </div>
  )
}

export default TransactionHistoryPage