-- ============================================
-- Feast.id Laundry - Supabase Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- 1. Users (Admin/Operator)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  total_points INT DEFAULT 0,
  membership_level VARCHAR(20) DEFAULT 'regular' CHECK (membership_level IN ('regular', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Layanans (Services)
CREATE TABLE IF NOT EXISTS layanans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nama_layanan VARCHAR(255) NOT NULL,
  kategori_layanan VARCHAR(20) NOT NULL CHECK (kategori_layanan IN ('basic', 'premium', 'deep', 'unyellowing', 'repaint', 'repair')),
  deskripsi TEXT,
  durasi_hari INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Jenis Sepatus (Shoe Types)
CREATE TABLE IF NOT EXISTS jenis_sepatus (
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
CREATE TABLE IF NOT EXISTS pesanans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS detail_pesanans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pesanan_id UUID REFERENCES pesanans(id) ON DELETE CASCADE,
  layanan_id UUID REFERENCES layanans(id) ON DELETE SET NULL,
  jenis_sepatu_id UUID REFERENCES jenis_sepatus(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS pembayarans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pesanan_id UUID REFERENCES pesanans(id) ON DELETE CASCADE,
  tanggal_pembayaran DATE NOT NULL DEFAULT CURRENT_DATE,
  jumlah_dibayar DECIMAL(12,2) DEFAULT 0,
  kembalian DECIMAL(12,2) DEFAULT 0,
  metode_pembayaran VARCHAR(20) DEFAULT 'cash' CHECK (metode_pembayaran IN ('cash', 'transfer', 'ewallet', 'qris', 'debit', 'credit')),
  status_pembayaran VARCHAR(20) DEFAULT 'pending' CHECK (status_pembayaran IN ('pending', 'partial', 'paid', 'refund', 'failed')),
  bukti_pembayaran TEXT,
  nomor_referensi VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Laporan Laundries (Reports)
CREATE TABLE IF NOT EXISTS laporan_laundries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE layanans ENABLE ROW LEVEL SECURITY;
ALTER TABLE jenis_sepatus ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesanans ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_pesanans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayarans ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_laundries ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write all tables (adjust for production)
CREATE POLICY "Allow all for authenticated" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON layanans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON jenis_sepatus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON pesanans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON detail_pesanans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON pembayarans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON laporan_laundries FOR ALL USING (true) WITH CHECK (true);
