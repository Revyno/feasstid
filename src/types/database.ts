export type UserRole = "super_admin" | "admin" | "operator";
export type MembershipLevel = "regular" | "silver" | "gold" | "platinum";
export type OrderStatus =
  | "pending"
  | "in_process"
  | "completed"
  | "ready"
  | "delivered"
  | "cancelled";
export type DeliveryMethod = "drop_off" | "pickup" | "delivery";
export type PaymentMethod =
  | "cash"
  | "transfer"
  | "ewallet"
  | "qris"
  | "debit"
  | "credit";
export type PaymentStatus =
  | "pending"
  | "partial"
  | "paid"
  | "refund"
  | "failed";
export type ShoeCondition = "ringan" | "sedang" | "berat";
export type ServiceCategory =
  | "basic"
  | "premium"
  | "deep"
  | "unyellowing"
  | "repaint"
  | "repair";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  password: string | null;
  phone: string | null;
  address: string | null;
  total_points: number;
  membership_level: MembershipLevel;
  created_at: string;
  updated_at: string;
}

export interface Layanan {
  id: string;
  user_id: string | null;
  nama_layanan: string;
  kategori_layanan: ServiceCategory;
  deskripsi: string | null;
  durasi_hari: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JenisSepatu {
  id: string;
  nama_jenis: string;
  merek: string | null;
  bahan: string | null;
  keterangan: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pesanan {
  id: string;
  customer_id: string;
  kode_pesanan: string;
  tanggal_pesanan: string;
  tanggal_selesai: string | null;
  total_harga: number;
  status: OrderStatus;
  metode_pengantaran: DeliveryMethod;
  alamat_pengantaran: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  customer?: Customer;
  detail_pesanans?: DetailPesanan[];
  pembayaran?: Pembayaran;
}

export interface DetailPesanan {
  id: string;
  pesanan_id: string;
  layanan_id: string;
  jenis_sepatu_id: string | null;
  jumlah_pasang: number;
  kondisi_sepatu: ShoeCondition;
  harga_satuan: number;
  biaya_tambahan: number;
  subtotal: number;
  catatan_khusus: string | null;
  foto_sebelum: string | null;
  foto_sesudah: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  layanan?: Layanan;
  jenis_sepatu?: JenisSepatu;
}

export interface Pembayaran {
  id: string;
  pesanan_id: string;
  tanggal_pembayaran: string;
  jumlah_dibayar: number;
  kembalian: number;
  metode_pembayaran: PaymentMethod;
  status_pembayaran: PaymentStatus;
  bukti_pembayaran: string | null;
  nomor_referensi: string | null;
  user_id: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  pesanan?: Pesanan;
  admin?: User;
}

export interface LaporanLaundry {
  id: string;
  user_id: string;
  periode_awal: string;
  periode_akhir: string;
  total_pendapatan: number;
  total_pengeluaran: number;
  total_profit: number;
  total_pesanan: number;
  total_sepatu: number;
  pesanan_selesai: number;
  pesanan_batal: number;
  layanan_terpopuler: string[] | null;
  created_at: string;
  updated_at: string;
}

// Price map for service categories
export const HARGA_KATEGORI: Record<ServiceCategory, number> = {
  basic: 50000,
  premium: 100000,
  deep: 150000,
  unyellowing: 75000,
  repaint: 200000,
  repair: 250000,
};

export const DURASI_HARI_KATEGORI: Record<ServiceCategory, number> = {
  basic: 1,
  premium: 2,
  deep: 3,
  unyellowing: 2,
  repaint: 4,
  repair: 5,
};
