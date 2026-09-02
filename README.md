<div align="center">
  
  # Trafina
  ### Aplikasi Kasir POS & Manajerial Bisnis UMKM Berbasis AI
  
  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-success?style=for-the-badge)](https://trafina.vercel.app)
  [![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/AbimanyuGilar/itechnocup26)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
  
  **Submission for ITECHNO CUP 2026 - Web Development**
  
</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Unggulan](#-fitur-unggulan)
- [Demo & Screenshot](#-demo--screenshot)
- [Teknologi](#️-teknologi)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Instalasi & Setup](#-instalasi--setup)
- [Penggunaan](#-penggunaan)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Tim Developer](#-tim-developer)
- [Lisensi](#-lisensi)

---

## 👥 Tim Developer

| Nama | Peran | GitHub |
|------|-------|--------|
| **Abimanyu** | Fullstack Developer | [GitHub](https://github.com/AbimanyuGilar) |
| **Bennaya** | Fullstack Developer | [GitHub](https://github.com/bennohan) |
| **Adzi** | Fullstack Developer | [GitHub](https://github.com/satrioadzi) |

---

## 🎯 Tentang Proyek

### Latar Belakang

Pelaku UMKM (Usaha Mikro, Kecil, dan Menengah) sering kali menghadapi tantangan dalam pencatatan transaksi kasir, pengelolaan persediaan barang (stok), serta rekapitulasi laporan keuangan bulanan. Pembukuan manual tidak hanya menyita waktu tetapi juga sangat rentan terhadap kesalahan *human error*, selisih kas, dan hilangnya data penting bisnis.

### Solusi yang Ditawarkan

**Trafina** hadir sebagai platform *Point of Sale* (POS) dan manajemen operasional bisnis berbasis cloud terintegrasi. Dilengkapi dengan **Asisten Bisnis berbasis AI**, Trafina memungkinkan pemilik bisnis dan kasir untuk mencatat transaksi dengan kilat, memantau persediaan stok secara real-time, mengelola multi-cabang/organisasi, serta mendapatkan analisis dan saran strategis bisnis secara otomatis.

### Tujuan Proyek

- 🎯 **Tujuan Utama**: Menyediakan platform POS & pencatatan keuangan modern yang cepat, mudah digunakan, dan terjangkau untuk skala usaha UMKM.
- 📊 **Target Pengguna**: Pemilik UMKM, Manajer Toko, dan Staf Kasir pada bidang Kuliner (Resto & Kafe), Retail, Fashion, Minimarket, hingga Jasa.
- 💡 **Value Proposition**: Kombinasi kasir POS super cepat, manajemen stok otomatis, multi-organisasi & otorisasi peran anggota, serta asisten cerdas berbasis AI untuk analisis pertumbuhan bisnis.

---

## ✨ Fitur Unggulan

### Fitur Utama

| Fitur | Deskripsi | Keunggulan |
|----------|--------------|---------------|
| **Kasir POS Super Cepat** | Sistem pencatatan kasir instan dengan dukungan berbagai metode pembayaran (Tunai, QRIS, Transfer Bank). | Mempercepat proses checkout dan meminimalkan antrean pelanggan. |
| **Manajemen Produk & Stok** | Pengelolaan katalog barang, kategori produk, dan pelacakan persediaan stok otomatis. | Mencegah kehabisan stok barang dan memberikan notifikasi stok menipis. |
| **AI Business Assistant** | Chatbot cerdas terintegrasi OpenRouter AI untuk analisis data transaksi & konsultasi strategi bisnis. | Memberikan wawasan bisnis mendalam tanpa perlu menyewa konsultan independen. |
| **Multi-Organisasi & Tim** | Pengelolaan cabang toko atau organisasi bisnis dalam satu akun beserta sistem undangan tim. | Kolaborasi efisien dengan pengaturan peran (*role*) dan hak akses yang fleksibel. |

### Fitur Tambahan

- **Laporan Keuangan & Kategori Transaksi** - Rekapitulasi pemasukan (*income*) dan pengeluaran (*expense*) otomatis.
- **Otentikasi Modern & Verifikasi Email** - Pengamanan akun dengan *Better Auth*, fitur lupa kata sandi, dan verifikasi email.
- **Metode Pembayaran Kustom** - Pengaturan metode pembayaran yang sesuai dengan kebutuhan operasional toko.
- **Antarmuka Responsif & Intuitif** - Tampilan visual modern yang responsif diakses dari PC, tablet, maupun smartphone.

---

## 📸 Demo & Screenshot

### Live Demo

🔗 **[Kunjungi Website Trafina](https://trafina.vercel.app)**

### Screenshot Aplikasi

<div align="center">
  <img src="images/homepage.png" alt="Homepage Trafina" height="400"/>
  <p><em>Homepage - Tampilan utama dan informasi platform Trafina</em></p>
  
  <img src="images/cashier.png" alt="Point of Sale Dashboard" height="400"/>
  <p><em>Sistem Kasir POS - Interface pencatatan transaksi cepat</em></p>
  
  <img src="images/product.png" alt="Manajemen Stok & Produk" height="400"/>
  <p><em>Manajemen Produk - Pengelolaan katalog dan stok barang</em></p>
  
  <img src="images/ai.png" alt="AI Business Assistant" height="400"/>
  <p><em>AI Assistant - Konsultasi & analisis keuangan bisnis berbasis AI</em></p>
</div>

---

## 🛠️ Teknologi

### Tech Stack

#### Frontend
```
Framework    : Next.js 16 (App Router)
Library      : React 19
UI & Styling : Tailwind CSS v4, Radix UI, Base UI
Icons & UI   : Lucide React, Sonner (Toast), Next TopLoader
```

#### Backend
```
Framework    : Next.js Server Actions & API Routes
Auth & Sec   : Better Auth
Database     : PostgreSQL (Supabase / `@prisma/adapter-pg`)
ORM          : Prisma ORM v7
Mail Service : Nodemailer
AI Engine    : OpenRouter API
```

#### DevOps & Tools
```
Deployment   : Vercel (https://trafina.vercel.app)
Version Ctrl : Git & GitHub
Package Mgmt : pnpm / npm / yarn
```

### Alasan Pemilihan Teknologi

| Teknologi | Alasan Pemilihan |
|-----------|------------------|
| **Next.js 16 & React 19** | Memberikan performa render yang cepat dengan Server Components & Server Actions untuk operasi kasir yang *seamless*. |
| **Prisma ORM v7 & PostgreSQL** | Memudahkan pengelolaan skema basis data terstruktur dengan *type-safety* tinggi serta skalabilitas data yang andal. |
| **OpenRouter API** | Pemrosesan bahasa alami yang responsif untuk menganalisis statistik bisnis dan menjawab pertanyaan manajerial secara cepat melalui OpenRouter. |
| **Better Auth** | Solusi otentikasi fleksibel dan aman yang mendukung manajemen sesi, verifikasi email, serta kontrol akses multi-organisasi. |

### Dependencies Utama

```json
{
  "dependencies": {
    "next": "16.2.12",
    "react": "19.2.4",
    "@prisma/client": "^7.9.0",
    "better-auth": "^1.6.25",
    "tailwind-merge": "^3.6.0",
    "lucide-react": "^1.30.0",
    "sonner": "^2.0.7",
    "nodemailer": "^9.0.3"
  }
}
```

---

## 🏗️ Arsitektur Sistem

### System Architecture

```mermaid
flowchart TD
    User([Pengguna / Kasir / Pemilik UMKM]) -->|Akses Browser| Client[Next.js 16 Frontend App]
    Client -->|Autentikasi & Sesi| Auth[Better Auth Management]
    Client -->|Server Actions & API Routes| Server[Next.js App Server]
    Server -->|ORM Queries| Prisma[Prisma ORM 7]
    Prisma -->|PostgreSQL Connection| DB[(PostgreSQL Database)]
    Server -->|Analisis & Prompt AI| OpenRouter[OpenRouter AI Engine]
    Server -->|Kirim Email Verifikasi| Mail[Nodemailer]
```

### Folder Structure

```
itechnocup26/
├── app/                  # Next.js App Router (Pages, Layouts & API)
│   ├── (auth)/           # Route Group: Sign In, Sign Up
│   ├── (manage)/         # Route Group: Manajemen Toko & Inventaris
│   ├── dashboard/        # Dashboard Kasir & Admin Panel
│   └── api/              # Endpoint API Server
├── components/           # Reusable UI & Business Components
│   ├── ui/               # Base UI Components (Buttons, Dialogs, Cards)
│   └── ai-chat-bubble.tsx # Asisten AI Business Chatbot
├── lib/                  # Utilities, Auth Config, & Client SDKs
├── prisma/               # Prisma Database Schema & Migration Seeds
│   └── schema.prisma     # Definisi Data Model (User, Org, Product, Transaction)
├── public/               # Asset Statis (Logo, Gambar)
└── generated/            # Output Prisma Client Generated
```

---

## ⚙️ Instalasi & Setup

### Prerequisites

Pastikan perangkat Anda telah terpasang:
- **Node.js** (v20.x atau lebih tinggi)
- **pnpm** / **npm** / **yarn**
- **PostgreSQL Database** (Lokal atau Cloud seperti Supabase)

### Langkah Instalasi

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/[username]/itechnocup26.git
cd itechnocup26
```

#### 2️⃣ Install Dependencies

```bash
pnpm install
# atau
npm install
```

#### 3️⃣ Setup Environment Variables

Salin file `.env.example` menjadi `.env` di direktori utama (*root directory*):

```bash
cp .env.example .env
```

Isi variabel lingkungan pada file `.env` sesuai dengan konfigurasi Anda:

```env
# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trafina_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/trafina_db?schema=public"

# ==========================================
# SUPABASE CONFIGURATION FOR IMAGES STORAGE
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your_url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ==========================================
# BETTER AUTH CONFIGURATION
# ==========================================
BETTER_AUTH_SECRET="your_better_auth_secret_key_min_32_chars"
BETTER_AUTH_URL="http://localhost:3000"

# ==========================================
# OPENROUTER AI CONFIGURATION
# ==========================================
OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_MODEL="openrouter/free"

# ==========================================
# EMAIL VERIFICATION
# ==========================================
EMAIL_SERVER_USER="your_email@gmail.com"
EMAIL_SERVER_PASSWORD="your_app_password"
```

#### 4️⃣ Setup Database & Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Sinkronkan skema database
npx prisma db push

# (Opsional) Jalankan Seeder
npx tsx prisma/seed.ts
```

#### 5️⃣ Run Development Server

```bash
pnpm dev
# atau
npm run dev
```

Buka browser dan akses halaman aplikasi di **`http://localhost:3000`**

---

## 🚀 Penggunaan

### Menjalankan Skrip Utama

```bash
# Mode Pengkodingan (Development)
npm run dev

# Build Aplikasi untuk Produksi
npm run build

# Menjalankan Server Produksi
npm run start

# Mengecek Kode (Linting)
npm run lint
```

### User Guide

#### Untuk Pengguna & Kasir

1. **Registrasi & Buat Organisasi**: Daftar akun baru, verifikasi email, dan buat nama usaha/toko Anda.
2. **Pencatatan Produk**: Tambahkan produk, kategori, harga jual, serta jumlah persediaan barang.
3. **Transaksi POS**: Pilih produk pelanggan, tentukan metode pembayaran (Tunai/QRIS/Bank), lalu konfirmasi transaksi.
4. **Tanya AI Business**: Klik ikon AI Bubble di sudut bawah layar untuk berdiskusi mengenai analisis omzet atau strategi promosi toko.

---

## 📚 API Documentation

### Base URL

```
Development: http://localhost:3000/api
Production:  https://trafina.vercel.app/api
```

### Endpoints Utama

#### Authentication (Better Auth)

```http
POST /api/auth/sign-in/email    # Login akun dengan email & password
POST /api/auth/sign-up/email    # Registrasi akun pengguna baru
POST /api/auth/sign-out         # Keluar dari akun saat ini
```

---

## 🧪 Testing

```bash
# Lakukan pengujian linting kode
npm run lint

# Verifikasi skema database
npx prisma validate
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE) - lihat file LICENSE untuk detail lebih lanjut.

---

<div align="center">

  **Made with ❤️ by 3Brothers.exe for ITECHNO CUP 2026**

</div>
