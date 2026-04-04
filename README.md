
#  — Laundry Management System
# (https://github.com/Revyno/feasstid/blob/09816ba5c428cc22b5a6516a6f80d4ae811544e2/public/logo/1.jpg) 


Sistem manajemen laundry sepatu **Feast.id** dibangun dengan **Next.js 15**, **Tailwind CSS**, **Supabase**, **shadcn/ui**, dan **Radix UI**.

---

##  Design Figma
https://www.figma.com/design/eLFm18pmlttWMYocPyoerT/Laundry-Proposal?node-id=0-1&t=goWPhQCOD6gqe0TA-1

## 📋 Fitur

### Frontend (Public)

- **Home** — Hero, About, Services overview, Shoe Materials, Branch Locations, Customer Reviews, How to Order, Fresh Updates
- **Services** — Daftar harga lengkap (Sepatu, Tas, Additional Treatment, Topi/Helm/Koper)
- **Gallery** — Gallery foto before & after
- **Contact** — Info kontak dan form pesan

### Dashboard Admin (`/dashboard`)

- **Overview** — Statistik (Total Orders, Customers, Order Success Rate, Payment Success, dll.)
- **Pesanan** — CRUD pesanan dengan status tracking
- **Pelanggan** — CRUD pelanggan dengan membership level
- **Layanan** — CRUD layanan dengan auto-pricing & durasi
- **Pembayaran** — CRUD pembayaran dengan multiple metode
- **Jenis Sepatu** — CRUD jenis sepatu (merek, bahan)
- **Laporan** — Laporan periodik (pendapatan, profit, pesanan)
- **Users** — Manajemen admin/operator

### Dashboaed Customer

### Auth

- Login admin via Supabase Auth
- Register customer via Supabase Auth

---

## 🛠️ Tech Stack

| Layer            | Teknologi                           |
| ---------------- | ----------------------------------- |
| Framework        | Next.js 15 (App Router, TypeScript) |
| Styling          | Tailwind CSS v4                     |
| UI Components    | shadcn/ui                           |
| Icons            | Radix UI Icons                      |
| Backend/Database | Supabase (PostgreSQL + Auth)        |
| Charts           | Recharts                            |
| Date Utils       | date-fns                            |

---

## 🚀 Cara Menjalankan Project

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- Akun **Supabase** (gratis di [supabase.com](https://supabase.com))

### 1. Clone / Download Project

```bash
cd c:\laragon\www\laundry-nextjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Buat project baru, catat **Project URL** dan **Anon Key**
3. Buka **SQL Editor** di Supabase Dashboard
4. Copy & paste isi file `supabase/schema.sql` → klik **Run**
5. Buka **Authentication** → **Settings** → aktifkan Email provider

### 4. Konfigurasi Environment

Edit file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

### 6. Akses Dashboard

1. Buat user admin melalui **Supabase Dashboard** → **Authentication** → **Add User**
2. Buka **http://localhost:3000/login**
3. Masukkan email dan password
4. Dashboard akan terbuka di **http://localhost:3000/dashboard**

---

## 📁 Struktur Project

```
laundry-nextjs/
├── src/
│   ├── app/
│   │   ├── (frontend)/         # Public pages (Home, Services, Gallery, Contact)
│   │   ├── (dashboard)/        # Admin dashboard (sidebar layout)
│   │   │   └── dashboard/
│   │   │       ├── pesanan/    # Orders CRUD
│   │   │       ├── pelanggan/  # Customers CRUD
│   │   │       ├── layanan/    # Services CRUD
│   │   │       ├── pembayaran/ # Payments CRUD
│   │   │       ├── jenis-sepatu/ # Shoe Types CRUD
│   │   │       ├── laporan/    # Reports
│   │   │       └── users/      # Admin Users CRUD
│   │   └── (auth)/             # Login & Register
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── lib/supabase/           # Supabase client config
│   └── types/                  # TypeScript types
├── supabase/
│   └── schema.sql              # Database schema for Supabase
├── .env.local                  # Environment variables
└── README.md
```

---

## 🔒 Build Production

```bash
npm run build
npm start
```

---

## 📌 Notes

- Pastikan `.env.local` sudah diisi dengan URL dan Key Supabase yang benar sebelum menjalankan project
- Schema SQL harus dijalankan terlebih dahulu di Supabase SQL Editor
- Untuk menambah admin, gunakan Supabase Dashboard → Authentication → Users
