'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';
import {
  ArrowRight,
  Loader2,
  BarChart3,
  Store,
  CheckCircle2,
  Coffee,
  Shirt,
  Boxes,
  Zap,
  Menu as MenuIcon,
  X as CloseIcon
} from 'lucide-react';

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const businessTypes = [
    { name: 'Resto & Kafe', icon: Coffee },
    { name: 'Retail & Grosir', icon: Store },
    { name: 'Fashion & Distro', icon: Shirt },
    { name: 'Minimarket & UMKM', icon: Boxes },
    { name: 'Jasa & Servis', icon: Zap },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Kasir POS Super Cepat',
      desc: 'Transaksi instan dalam hitungan detik dengan dukungan cetak struk, QRIS, transfer bank, dan tunai.',
    },
    {
      icon: Boxes,
      title: 'Manajemen Stok & Produk',
      desc: 'Pantau sisa persediaan barang secara otomatis dan dapatkan notifikasi saat stok menipis.',
    },
    {
      icon: BarChart3,
      title: 'Laporan Keuangan Otomatis',
      desc: 'Analisis laba rugi, omzet harian, dan produk terlaris tanpa perlu rekap manual yang menyita waktu.',
    },
    {
      icon: Store,
      title: 'Multi Cabang & Outlet',
      desc: 'Kelola banyak cabang toko dan pisahkan hak akses karyawan dalam satu akun pusat yang terintegrasi.',
    },
  ];

  const benefits = [
    {
      title: 'Akses Dimanapun dan Kapanpun',
      desc: 'Akses data penjualan dan pantau toko dari HP, tablet, maupun laptop kapan saja.',
    },
    {
      title: 'Tanpa Install yang Rumit',
      desc: 'Langsung pakai via browser modern tanpa perlu konfigurasi server atau hardware khusus.',
    },
    {
      title: 'Keamanan Data Terjamin',
      desc: 'Database cloud terenkripsi memastikan catatan transaksi dan riwayat bisnis Anda selalu aman.',
    },
    {
      title: 'Mudah Dipelajari Karyawan',
      desc: 'Antarmuka kasir yang sederhana dan intuitif sehingga staf kasir siap jualan dalam 5 menit.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              alt={'logo'}
              width={40}
              height={40}
              src={'/logo.png'}
            />
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Trafina
              </span>
              <span className="text-[10px] tracking-wider font-medium text-slate-500 -mt-1">
                Transaction Finance (POS and financial system)
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-slate-900 transition-colors">Fitur</a>
            <a href="#keunggulan" className="hover:text-slate-900 transition-colors">Keunggulan</a>
            <Link href="/tutorial" className="hover:text-slate-900 transition-colors">Tutorial & Panduan</Link>
          </nav>

          {/* Nav Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isPending ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Memuat...</span>
              </div>
            ) : session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm shadow-blue-500/10 transition-all hover:translate-y-[-1px]"
              >
                Ke Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 border border-transparent transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm shadow-blue-500/10 transition-all hover:translate-y-[-1px]"
                >
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700 pt-2">
              <a 
                href="#fitur" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900"
              >
                Fitur
              </a>
              <a 
                href="#keunggulan" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900"
              >
                Keunggulan
              </a>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
              {session ? (
                <Link
                  href="/dashboard"
                  className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg"
                >
                  Ke Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full text-center py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm font-medium rounded-lg"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
                  >
                    Daftar Sekarang
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle Glows / Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-100/60 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-indigo-100/50 blur-[90px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 text-left space-y-6">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Satu Aplikasi Kasir untuk <span className="text-blue-600">Semua Jenis Toko</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Aplikasi kasir online berbasis cloud yang memudahkan operasional bisnis Anda. Catat penjualan dengan cepat, kelola stok barang, dan monitor omzet secara langsung.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  href={session ? "/dashboard" : "/register"}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]"
                >
                  {session ? "Buka Dashboard Kasir" : "Mulai Kelola Toko Gratis"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#fitur"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-base px-5 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm transition-colors"
                >
                  Lihat Fitur Lengkap
                </a>
              </div>

              {/* Business Categories Supported */}
              <div id="solusi" className="pt-6 border-t border-slate-200">
                <p className="text-xs font-medium tracking-wider text-slate-500 mb-3">
                  Cocok untuk berbagai sektor toko:
                </p>
                <div className="flex flex-wrap gap-2">
                  {businessTypes.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:border-blue-300 hover:text-blue-600 shadow-sm transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex items-center">
              {/* Subtle Ambient Glow behind image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-blue-200/40 blur-[100px] rounded-full pointer-events-none -z-10" />

              {/* Image */}
              <div
                className="
                  w-full
                  max-w-none
                  origin-top-left

                  /* Mobile */
                  translate-x-0
                  translate-y-0
                  scale-100
                  rotate-0

                  /* Desktop */
                  lg:w-[160%]
                  xl:w-[175%]
                  lg:translate-x-[15%]
                  xl:translate-x-[20%]
                  lg:-translate-y-[10%]
                  xl:-translate-y-[15%]
                  lg:scale-125
                  xl:scale-[1.35]
                  lg:-rotate-6

                  transition-transform duration-500
                  select-none
                  pointer-events-none
                "
              >
                <Image
                  src="/cashierpage.png"
                  alt="Preview Aplikasi Kasir Trafina POS"
                  width={1920}
                  height={1080}
                  priority
                  className="
                    w-full
                    h-auto
                    object-cover
                    rounded-xl
                    border
                    border-slate-200/80
                    shadow-xl
                    shadow-slate-300/50
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR SECTION */}
      <section id="fitur" className="py-20 lg:py-28 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-2xl mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Solusi Cerdas untuk Mengelola Penjualan Anda
            </h2>
            <p className="text-slate-600 text-base mt-3 leading-relaxed">
              Dirancang dengan antarmuka yang bersih dan mudah digunakan agar transaksi berjalan lancar tanpa hambatan teknis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50/80 border border-slate-200 hover:border-blue-300 rounded-2xl p-6 transition-all hover:translate-y-[-2px] hover:shadow-md group text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* KEUNGGULAN SECTION */}
      <section id="keunggulan" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 text-left space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Efisiensi Nyata Tanpa Kerumitan Sistem Lama
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Trafina dibuat agar pemilik bisnis dan kasir fokus melayani pelanggan dengan cepat, bukan terjebak dalam pembukuan yang berbelit-belit.
              </p>

              <div className="pt-2">
                <Link
                  href={session ? "/dashboard" : "/register"}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-3 rounded-lg shadow-sm transition-all"
                >
                  Coba Trafina Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
              {benefits.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 shadow-sm transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <h3 className="font-bold text-slate-900 text-base tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION (CTA) */}
      <section className="py-16 lg:py-24 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 sm:p-12 text-center overflow-hidden shadow-xl shadow-blue-500/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[70px] pointer-events-none" />
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 max-w-2xl mx-auto">
              Mulai Digitalisasi Toko Anda Bersama Trafina Hari Ini
            </h2>
            <p className="text-blue-100 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Daftarkan toko Anda sekarang dan rasakan kemudahan transaksi kasir serta pencatatan otomatis yang rapi.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={session ? "/dashboard" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-blue-600 font-semibold text-base px-8 py-3.5 rounded-xl shadow-md transition-all hover:translate-y-[-2px]"
              >
                {session ? "Masuk ke Dashboard" : "Buat Akun Sekarang"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              {!session && (
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center text-white hover:bg-white/10 text-base font-medium px-6 py-3.5 rounded-xl border border-white/30 transition-colors"
                >
                  Sudah Punya Akun? Masuk
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo & Brand Info */}
            <div className="flex items-center gap-3">
              <Image
                alt={'logo'}
                width={30}
                height={30}
                src={'/logo.png'}
              />
              <span className="text-slate-900 font-bold text-lg tracking-tight">Trafina</span>
              <span className="text-xs text-slate-500 ml-2">Point of Sale System</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm text-slate-600">
              <a href="#fitur" className="hover:text-slate-900 transition-colors">Fitur</a>
              <a href="#keunggulan" className="hover:text-slate-900 transition-colors">Keunggulan</a>
              <Link href="/login" className="hover:text-slate-900 transition-colors">Login Kasir</Link>
            </div>

            {/* Copyright */}
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} Trafina. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}