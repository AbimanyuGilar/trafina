'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';
import {
  ArrowRight,
  Loader2,
  BookOpen,
  Store,
  PlusCircle,
  Edit,
  Package,
  CreditCard,
  ShoppingCart,
  Receipt,
  History,
  Users,
  Bot,
  Menu as MenuIcon,
  X as CloseIcon,
  ChevronRight
} from 'lucide-react';

export default function TutorialPage() {
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pendahuluan');

  const navigationItems = [
    { id: 'pendahuluan', label: '1. Pendahuluan', icon: BookOpen },
    { id: 'akses-login', label: '2. Akses & Login', icon: Store },
    { id: 'tambah-toko', label: '3.1. Tambah Toko', icon: PlusCircle },
    { id: 'edit-toko', label: '3.2. Edit Data Toko', icon: Edit },
    { id: 'tambah-produk', label: '3.3. Tambah Produk', icon: Package },
    { id: 'edit-produk', label: '3.4. Edit Produk', icon: Edit },
    { id: 'tambah-metode', label: '3.5. Tambah Metode Transaksi', icon: CreditCard },
    { id: 'edit-metode', label: '3.6. Edit Metode Transaksi', icon: Edit },
    { id: 'kasir', label: '3.7. Kasir & Transaksi', icon: ShoppingCart },
    { id: 'transaksi-manual', label: '3.8. Transaksi Manual', icon: Receipt },
    { id: 'riwayat-transaksi', label: '3.9. Riwayat Transaksi', icon: History },
    { id: 'manage-karyawan', label: '3.10. Manage Karyawan', icon: Users },
    { id: 'chatbot', label: '3.11. Penggunaan Chatbot', icon: Bot },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
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

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">Beranda</Link>
            <Link href="/tutorial" className="text-blue-600 font-semibold">Panduan</Link>
          </nav>

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

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700 pt-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                Beranda
              </Link>
              <Link href="/tutorial" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-semibold">
                Tutorial
              </Link>
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
      <section className="bg-white border-b border-slate-200 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
              Panduan Penggunaan Website Trafina
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              Pelajari cara mengelola toko, produk, metode transaksi, kasir POS, laporan riwayat, hingga bantuan AI Chatbot Trafina dengan mudah dan cepat.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA WITH SIDEBAR */}
      <section className="py-8 lg:py-12 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SIDEBAR NAVIGATION */}
            <aside className="lg:col-span-3">
              <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Daftar Isi</p>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 opacity-60 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* CONTENT BODY */}
            <main className="lg:col-span-9 space-y-12">
              
              {/* 1. Pendahuluan */}
              <article id="pendahuluan" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  1. Pendahuluan
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Trafina</strong>, merupakan aplikasi kasir online berbasis cloud yang memudahkan operasional bisnis Anda. Catat penjualan dengan cepat, kelola stok barang, dan monitor omzet secara langsung.
                </p>
              </article>

              {/* 2. Akses & Login */}
              <article id="akses-login" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <Store className="w-6 h-6 text-blue-600" />
                  2. Akses & Login
                </h2>
                <p className="text-slate-700">Untuk mulai menggunakan website ini, ikuti langkah-langkah berikut:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
                  <li>Buka web browser dan akses tautan: <a href="https://trafina.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://trafina.vercel.app/</a></li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-awal.png"
                    alt="Tampilan Awal Halaman Trafina"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- TAMPILAN AWAL HALAMAN TRAFINA ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
                  <li>Klik tombol <strong>&quot;Login&quot;</strong> atau <strong>&quot;Masuk&quot;</strong>.</li>
                  <li>Masukkan Username/Email dan Password Anda, lalu tekan tombol <strong>&quot;Masuk ke Akun&quot;</strong>.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-login.png"
                    alt="Halaman Login Trafina"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- HALAMAN LOGIN ---</p>
                </div>
              </article>

              {/* SECTION HEADER FOR FITUR UTAMA */}
              <div className="pt-4 border-t border-slate-200">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">3. Fitur Utama</h2>
                <p className="text-slate-600 text-sm mt-1">Berikut adalah panduan untuk menggunakan fitur-fitur yang ada di dalam website:</p>
              </div>

              {/* 3.1. Tambah Toko */}
              <article id="tambah-toko" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  3.1. Tambah Toko
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pengguna untuk menambahkan Toko yang dikelola sesuai keinginan.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900 text-sm">Langkah-langkah:</p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                    <li>Pada halaman utama dashboard toko, tekan tombol <strong>&quot;Tambah Toko&quot;</strong>.</li>
                  </ol>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-dashboard.png"
                    alt="Halaman Dashboard Trafina"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- HALAMAN DASHBOARD ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Isikan data-data toko: Nama Toko, Nomor Telepon, dan Alamat Toko.</li>
                  <li>Tekan tombol <strong>&quot;Simpan Data&quot;</strong> untuk menyimpan toko baru.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-tambah-toko.png"
                    alt="Halaman Tambah Toko"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- HALAMAN TAMBAH TOKO ---</p>
                </div>
              </article>

              {/* 3.2. Edit Data Toko */}
              <article id="edit-toko" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <Edit className="w-5 h-5 text-blue-600" />
                  3.2. Edit Data Toko
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pengguna untuk melakukan perubahan / edit pada data dari toko terkait.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Pada Halaman Toko Saat Ini, tekan tombol <strong>&quot;Edit&quot;</strong>.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-toko-saat-ini.png"
                    alt="Halaman Toko Saat Ini"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- HALAMAN TOKO SAAT INI ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Pada halaman Edit Toko, Isikan data toko Nama Toko, Nomor Telepon, dan Alamat Toko dengan data yang baru.</li>
                  <li>Tekan tombol <strong>&quot;Simpan Data&quot;</strong> untuk menyimpan perubahan toko.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-edit-toko.png"
                    alt="Halaman Edit Toko"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- HALAMAN EDIT TOKO ---</p>
                </div>
              </article>

              {/* 3.3. Tambah Produk */}
              <article id="tambah-produk" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  3.3. Tambah Produk
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pengguna untuk menambahkan produk yang dijual pada toko mereka.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Masuk pada halaman Manajemen Produk, lalu tekan Tombol <strong>&quot;Tambah Produk&quot;</strong>.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-manajemen-produk.png"
                    alt="Halaman Manajemen Produk"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- HALAMAN MANAJEMEN PRODUK ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Setelah menekan tombol &quot;Tambah Produk&quot; akan terbuka Pop Up Dialog.</li>
                  <li>Pada Dialog Tambah Produk Baru, isikan data-data terkait dengan produk yang akan ditambahkan.</li>
                  <li>Tekan tombol <strong>&quot;Simpan&quot;</strong> untuk menyimpan data produk baru.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/dialog-tambah-produk-baru.png"
                    alt="Dialog Tambah Produk Baru"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- DIALOG TAMBAH PRODUK BARU ---</p>
                </div>
              </article>

              {/* 3.4. Edit Produk */}
              <article id="edit-produk" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <Edit className="w-5 h-5 text-blue-600" />
                  3.4. Edit Produk
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pengguna untuk melakukan perubahan data pada suatu produk yang sebelumnya sudah dibuat.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Masuk pada halaman Manajemen Produk, lalu tekan Tombol Aksi dengan icon <strong>&quot;Edit Produk&quot;</strong> pada salah satu produk di list produk.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/list-produk.png"
                    alt="List Produk Trafina"
                    width={1200}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- LIST PRODUK ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Setelah menekan tombol &quot;Edit Produk&quot; akan terbuka Pop Up Dialog.</li>
                  <li>Pada Dialog Edit Produk, isikan data-data terkait dengan produk yang akan diperbaharui.</li>
                  <li>Tekan tombol <strong>&quot;Simpan&quot;</strong> untuk menyimpan perubahan data.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/dialog-edit-produk.png"
                    alt="Dialog Edit Produk"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- DIALOG EDIT PRODUK ---</p>
                </div>
              </article>

              {/* 3.5. Tambah Metode Transaksi */}
              <article id="tambah-metode" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  3.5. Tambah Metode Transaksi
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pengguna untuk menambahkan metode transaksi yang digunakan dalam proses jual beli pada toko mereka.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Masuk pada halaman Transaksi Metode Transaksi, lalu tekan Tombol <strong>&quot;Tambah Metode&quot;</strong> untuk menambahkan metode transaksi.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-metode-transaksi.png"
                    alt="Halaman Metode Transaksi"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- HALAMAN METODE TRANSAKSI ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Setelah menekan tombol &quot;Tambah Metode&quot; akan terbuka Pop Up Dialog.</li>
                  <li>Pada Dialog Tambah Metode Transaksi, isikan Nama dari Metode Transaksi Tersebut.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/popup-metode-transaksi.png"
                    alt="Pop Up Metode Transaksi"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- POP UP METODE TRANSAKSI ---</p>
                </div>
              </article>

              {/* 3.6. Edit Metode Transaksi */}
              <article id="edit-metode" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <Edit className="w-5 h-5 text-blue-600" />
                  3.6. Edit Metode Transaksi
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pengguna untuk melakukan perubahan data pada metode transaksi yang sebelumnya sudah dibuat.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Masuk pada halaman Transaksi Metode Transaksi, lalu tekan Tombol Aksi dengan icon <strong>&quot;Ubah Nama&quot;</strong> pada salah satu item di list metode transaksi.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/list-metode-transaksi.png"
                    alt="List Metode Transaksi"
                    width={1200}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- LIST METODE TRANSAKSI ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Setelah menekan tombol &quot;Ubah Nama&quot; akan terbuka Pop Up Dialog.</li>
                  <li>Pada Dialog Ubah metode transaksi, isikan nama metode transaksi yang akan diperbaharui.</li>
                  <li>Tekan tombol <strong>&quot;Simpan&quot;</strong> untuk menyimpan perubahan data.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/dialog-ubah-metode-transaksi.png"
                    alt="Dialog Ubah Metode Transaksi"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- DIALOG UBAH METODE TRANSAKSI ---</p>
                </div>
              </article>

              {/* 3.7. Kasir */}
              <article id="kasir" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  3.7. Kasir & Transaksi
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pengguna untuk melakukan aktivitas transaksi kasir secara langsung.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Masuk pada halaman Transaksi Kasir, lalu tekan Tombol <strong>&quot;Tambah&quot;</strong> dengan icon ( <strong>+</strong> ) pada salah satu produk di list produk untuk memasukkan ke keranjang.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-kasir.png"
                    alt="Halaman Kasir Trafina"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- HALAMAN KASIR ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Setelah beberapa produk ditambahkan, tampilan keranjang akan menampilkan jumlah item dan total harga yang harus dibayarkan.</li>
                  <li>Kasir dapat melakukan perubahan jumlah item, dan memilih metode pembayaran sesuai dengan yang dipilih customer.</li>
                  <li>Untuk Metode tunai kasir harus menuliskan nominal Uang sesuai dengan yang diterima sebagai pembayaran, selanjutnya kasir dapat menekan tombol <strong>&quot;Selesaikan Transaksi&quot;</strong>.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50 max-w-sm mx-auto">
                  <Image
                    src="/tutorial/tampilan-keranjang.png"
                    alt="Tampilan Keranjang Belanja"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- TAMPILAN KERANJANG ---</p>
                </div>

                <ol start={5} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Setelah transaksi diterima system, muncul pop up menu yang menampilkan detail dari transaksi yang telah berhasil. Selain itu terdapat tombol <strong>&quot;Cetak Struk&quot;</strong> yang memungkinkan kasir untuk print out Struk Nota transaksi.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/tampilan-popup-transaksi-berhasil.png"
                    alt="Tampilan Pop Up Transaksi Berhasil"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- TAMPILAN POP UP TRANSAKSI BERHASIL ---</p>
                </div>

                <ol start={6} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Saat tombol <strong>&quot;Cetak Struk&quot;</strong> ditekan, selanjutnya akan muncul Window Tab baru yang memungkinkan kasir untuk langsung melakukan cetak Print dari Struk Transaksi.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/tampilan-cetak-nota.png"
                    alt="Tampilan Cetak Struk Nota"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- TAMPILAN CETAK NOTA ---</p>
                </div>
              </article>

              {/* 3.8. Transaksi Manual */}
              <article id="transaksi-manual" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  3.8. Transaksi Manual
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pengguna untuk melakukan aktivitas transaksi secara manual (pemasukan/pengeluaran luar kasir).
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Masuk pada halaman Transaksi Manual, tekan tombol <strong>&quot;Tambah Transaksi&quot;</strong> untuk menambahkan transaksi.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/tampilan-transaksi-manual.png"
                    alt="Tampilan Transaksi Manual"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- TAMPILAN TRANSAKSI MANUAL ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Saat tombol <strong>&quot;Tambah Transaksi&quot;</strong> ditekan akan muncul Pop up Tambah Transaksi Baru yang memungkinkan user meng-input detail transaksi seperti: Tipe Transaksi, Kategori Nominal transaksi, beserta lampiran dari bukti Transaksi Tersebut.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/popup-transaksi-baru.png"
                    alt="Pop Up Transaksi Baru"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- POP UP TRANSAKSI BARU ---</p>
                </div>

                <ol start={3} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Setelah data transaksi terisi, pengguna dapat menekan tombol <strong>&quot;Simpan Transaksi&quot;</strong> untuk menyimpan transaksi, dan akan muncul pesan &quot;Berhasil membuat Transaksi&quot; serta transaksi tercatat dalam list.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/tampilan-setelah-transaksi-berhasil.png"
                    alt="Tampilan Setelah Berhasil Transaksi"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- TAMPILAN SETELAH BERHASIL TRANSAKSI ---</p>
                </div>
              </article>

              {/* 3.9. Riwayat Transaksi */}
              <article id="riwayat-transaksi" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <History className="w-5 h-5 text-blue-600" />
                  3.9. Riwayat Transaksi
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pengguna untuk melihat catatan dari semua transaksi yang sudah terjadi pada toko.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Masuk pada halaman Transaksi Riwayat Transaksi, maka akan menampilkan seluruh catatan dari transaksi yang sudah terjadi.</li>
                  <li>Pengguna juga dapat memanfaatkan fitur search dan filter untuk mencari maupun mengurutkan transaksi berdasarkan Jenis, Kategori, maupun tanggal transaksi.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-riwayat-transaksi.png"
                    alt="Halaman Riwayat Transaksi"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- HALAMAN RIWAYAT TRANSAKSI ---</p>
                </div>
              </article>

              {/* 3.10. Manage Karyawan */}
              <article id="manage-karyawan" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  3.10. Manage Karyawan
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pemilik toko untuk dapat menambahkan, merubah, dan memanajemen terkait Karyawan toko tersebut.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Masuk pada halaman Manajemen Karyawan, maka akan tampil List Karyawan yang ada di toko tersebut.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/halaman-manajemen-karyawan.png"
                    alt="Halaman Manajemen Karyawan"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- HALAMAN MANAJEMEN KARYAWAN ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Untuk menambahkan Karyawan, pemilik dapat menekan tombol <strong>&quot;Undang Karyawan&quot;</strong>, dan pop up yang tersedia pemilik dapat menuliskan alamat email karyawan yang akan menerima undangan, lalu menekan <strong>&quot;Kirim Undangan&quot;</strong> untuk mengirim undangan via Email.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/tampilan-undang-karyawan.png"
                    alt="Tampilan Undang Karyawan Baru"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- TAMPILAN UNDANG KARYAWAN BARU ---</p>
                </div>

                <ol start={3} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Pada List Karyawan terdapat tombol aksi <strong>&quot;Edit Karyawan&quot;</strong>, yang akan membuka pop up menu Edit Izin Akses memungkinkan pemilik memanage izin akses terhadap akun karyawannya.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <Image
                    src="/tutorial/tampilan-edit-izin-karyawan.png"
                    alt="Tampilan Edit Izin Karyawan"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- TAMPILAN EDIT IZIN KARYAWAN ---</p>
                </div>

                <ol start={4} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Serta pada List Karyawan terdapat tombol aksi <strong>&quot;Delete&quot;</strong>, yang memungkinkan pemilik untuk menghapus akun karyawan dari tokonya.</li>
                </ol>
              </article>

              {/* 3.11. Penggunaan Chatbot */}
              <article id="chatbot" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-3">
                  <Bot className="w-5 h-5 text-blue-600" />
                  3.11. Penggunaan Chatbot AI
                </h3>
                <p className="text-slate-700">
                  Pada fitur ini memungkinkan pengguna untuk menggunakan Chatbot untuk bertanya terkait beberapa hal di tokonya.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Masuk pada salah satu halaman di website Trafina, akan muncul icon Chatbot di pojok kanan bawah untuk pengguna yang ingin mengakses chatbot.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50 max-w-sm mx-auto">
                  <Image
                    src="/tutorial/tampilan-tombol-chatbot.png"
                    alt="Tampilan Tombol Chatbot"
                    width={400}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- TAMPILAN TOMBOL CHATBOT ---</p>
                </div>

                <ol start={2} className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                  <li>Saat diklik, akan terbuka menu Chat dengan Bot di kanan bawah tampilan, yang memungkinkan pengguna mendapatkan info terkait Tokonya (misalnya: total penjualan harian, maupun daftar lainnya), hanya dengan mengetik pesan chat-nya.</li>
                </ol>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50 max-w-sm mx-auto">
                  <Image
                    src="/tutorial/tampilan-chatbot.png"
                    alt="Tampilan Chatbot AI Trafina"
                    width={1200}
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  <p className="text-center text-xs font-semibold text-slate-500 py-2 border-t border-slate-200 bg-white">--- TAMPILAN CHATBOT ---</p>
                </div>
              </article>

            </main>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image alt={'logo'} width={30} height={30} src={'/logo.png'} />
            <span className="text-slate-900 font-bold text-lg">Trafina</span>
            <span className="text-xs text-slate-500">Panduan Pengguna</span>
          </div>
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} Trafina. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
