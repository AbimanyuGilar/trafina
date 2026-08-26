import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Outer Container / Card Utama */}
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0 md:min-h-[580px]">
        
        {/* Kolom Kiri: Visual Branding & Editorial Content */}
        <div className="hidden md:flex md:col-span-5 bg-slate-50/80 p-8 md:p-10 flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
          <div className="h-full flex flex-col justify-center">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <Image
                alt="logo"
                width={36}
                height={36}
                src="/logo.png"
              />
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Trafina
                </span>
                <span className="text-[10px] tracking-wider font-medium text-slate-500 -mt-1">
                  POS & Financial System
                </span>
              </div>
            </Link>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug mb-3">
              Kelola Transaksi dan Toko Lebih Mudah
            </h2>
            
            <p className="text-slate-600 text-sm leading-relaxed">
              Platform kasir modern untuk pencatatan penjualan cepat, manajemen stok otomatis, dan pantauan omzet secara real-time.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} Trafina. All rights reserved.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Area Form */}
        <div className="col-span-12 md:col-span-7 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}