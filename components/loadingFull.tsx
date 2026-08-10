import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex h-screen h-[100dvh] w-screen items-center justify-center bg-slate-900/20 backdrop-blur-[2px] transition-all">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/90 p-6 shadow-xl border border-slate-200/80 backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold tracking-wide uppercase text-slate-600">
          Memuat...
        </p>
      </div>
    </div>
  )
}