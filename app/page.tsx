'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client'; // Sesuaikan path auth-client project kamu
import { 
  ArrowRight,
  Loader2 
} from 'lucide-react';

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 flex flex-col font-sans">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-slate-900">
              FinansialApp
            </span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-4">
            {isPending ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Memuat...</span>
              </div>
            ) : session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl">
          Kendalikan Arus Finansialmu dalam Satu Dashboard
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Platform manajemen keuangan modern yang membantu memantau pengeluaran, menyusun anggaran, dan menganalisis laporan.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-white font-semibold">
            FinansialApp
          </div>
          <p>© {new Date().getFullYear()} FinansialApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}