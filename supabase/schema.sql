-- ============================================
-- Feast.id Laundry - Supabase Database Schema
-- Perbaikan: idempotent RLS policy (DROP IF EXISTS -> CREATE)
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- 1. Users (Admin/Operator)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  total_points INT DEFAULT 0,
  membership_level VARCHAR(20) DEFAULT 'regular' CHECK (membership_level IN ('regular', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Layanans (Services)
CREATE TABLE IF NOT EXISTS public.layanans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  nama_layanan VARCHAR(255) NOT NULL,
  kategori_layanan VARCHAR(20) NOT NULL CHECK (kategori_layanan IN ('basic', 'premium', 'deep', 'unyellowing', 'repaint', 'repair')),
  deskripsi TEXT,
  durasi_hari INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Jenis Sepatus (Shoe Types)
CREATE TABLE IF NOT EXISTS public.jenis_sepatus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_jenis VARCHAR(255) NOT NULL,
  merek VARCHAR(255),
  bahan VARCHAR(255),
  keterangan TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Pesanans (Orders)
CREATE TABLE IF NOT EXISTS public.pesanans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  kode_pesanan VARCHAR(50) UNIQUE NOT NULL,
  tanggal_pesanan DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_selesai DATE,
  total_harga DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_process', 'completed', 'ready', 'delivered', 'cancelled')),
  metode_pengantaran VARCHAR(20) DEFAULT 'drop_off' CHECK (metode_pengantaran IN ('drop_off', 'pickup', 'delivery')),
  alamat_pengantaran TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Detail Pesanans (Order Items)
CREATE TABLE IF NOT EXISTS public.detail_pesanans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pesanan_id UUID REFERENCES public.pesanans(id) ON DELETE CASCADE,
  layanan_id UUID REFERENCES public.layanans(id) ON DELETE SET NULL,
  jenis_sepatu_id UUID REFERENCES public.jenis_sepatus(id) ON DELETE SET NULL,
  jumlah_pasang INT DEFAULT 1,
  kondisi_sepatu VARCHAR(20) DEFAULT 'ringan' CHECK (kondisi_sepatu IN ('ringan', 'sedang', 'berat')),
  harga_satuan DECIMAL(12,2) DEFAULT 0,
  biaya_tambahan DECIMAL(12,2) DEFAULT 0,
  subtotal DECIMAL(12,2) DEFAULT 0,
  catatan_khusus TEXT,
  foto_sebelum TEXT,
  foto_sesudah TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Pembayarans (Payments)
CREATE TABLE IF NOT EXISTS public.pembayarans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pesanan_id UUID REFERENCES public.pesanans(id) ON DELETE CASCADE,
  tanggal_pembayaran DATE NOT NULL DEFAULT CURRENT_DATE,
  jumlah_dibayar DECIMAL(12,2) DEFAULT 0,
  kembalian DECIMAL(12,2) DEFAULT 0,
  metode_pembayaran VARCHAR(20) DEFAULT 'cash' CHECK (metode_pembayaran IN ('cash', 'transfer', 'ewallet', 'qris', 'debit', 'credit')),
  status_pembayaran VARCHAR(20) DEFAULT 'pending' CHECK (status_pembayaran IN ('pending', 'partial', 'paid', 'refund', 'failed')),
  bukti_pembayaran TEXT,
  nomor_referensi VARCHAR(255),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Laporan Laundries (Reports)
CREATE TABLE IF NOT EXISTS public.laporan_laundries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  periode_awal DATE NOT NULL,
  periode_akhir DATE NOT NULL,
  total_pendapatan DECIMAL(12,2) DEFAULT 0,
  total_pengeluaran DECIMAL(12,2) DEFAULT 0,
  total_profit DECIMAL(12,2) DEFAULT 0,
  total_pesanan INT DEFAULT 0,
  total_sepatu INT DEFAULT 0,
  pesanan_selesai INT DEFAULT 0,
  pesanan_batal INT DEFAULT 0,
  layanan_terpopuler JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layanans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jenis_sepatus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesanans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detail_pesanans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembayarans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_laundries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies: Drop if exists, then create
-- Note: policies allow role "authenticated" to perform all ops.
-- Adjust for production stricter rules as needed.
-- ============================================

-- users
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.users;
CREATE POLICY "Allow all for authenticated"
  ON public.users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- customers
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.customers;
CREATE POLICY "Allow all for authenticated"
  ON public.customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- layanans
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.layanans;
CREATE POLICY "Allow all for authenticated"
  ON public.layanans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- jenis_sepatus
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.jenis_sepatus;
CREATE POLICY "Allow all for authenticated"
  ON public.jenis_sepatus
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- pesanans
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.pesanans;
CREATE POLICY "Allow all for authenticated"
  ON public.pesanans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- detail_pesanans
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.detail_pesanans;
CREATE POLICY "Allow all for authenticated"
  ON public.detail_pesanans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- pembayarans
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.pembayarans;
CREATE POLICY "Allow all for authenticated"
  ON public.pembayarans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- laporan_laundries
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.laporan_laundries;
CREATE POLICY "Allow all for authenticated"
  ON public.laporan_laundries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);