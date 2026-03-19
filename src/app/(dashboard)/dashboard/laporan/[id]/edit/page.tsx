"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import type { LaporanLaundry } from "@/types/database";
import { 
  BarChart, 
  Trash2, 
  Calendar, 
  Lock, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  CheckCircle2, 
  XCircle,
  Undo2,
  Save,
  Loader2
} from "lucide-react";

export default function EditLaporanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [item, setItem] = useState<LaporanLaundry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // States for automatic fields
  const [periodeAwal, setPeriodeAwal] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalPesanan, setTotalPesanan] = useState(0);
  const [totalSepatu, setTotalSepatu] = useState(0);
  const [pesananSelesai, setPesananSelesai] = useState(0);
  const [pesananBatal, setPesananBatal] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("laporan_laundries").select("*").eq("id", id).single();
    if (data) {
      const l = data as LaporanLaundry;
      setItem(l);
      setPeriodeAwal(l.periode_awal);
      setPeriodeAkhir(l.periode_akhir);
      setTotalPendapatan(l.total_pendapatan);
      setTotalPesanan(l.total_pesanan);
      setTotalSepatu(l.total_sepatu);
      setPesananSelesai(l.pesanan_selesai);
      setPesananBatal(l.pesanan_batal);
      setTotalPengeluaran(l.total_pengeluaran);
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Automated calculation logic
  const updateStats = useCallback(async (start: string, end: string) => {
    if (!start || !end) return;
    setCalculating(true);
    
    // Fetch orders in range
    const { data: orders } = await supabase
      .from("pesanans")
      .select("id, total_harga, status, detail_pesanans(jumlah_pasang)")
      .gte("tanggal_pesanan", start)
      .lte("tanggal_pesanan", end);

    if (orders) {
      const income = orders.reduce((sum, o) => sum + (o.total_harga || 0), 0);
      const ordersCount = orders.length;
      const sepatuCount = orders.reduce((sum, o) => {
        const details = o.detail_pesanans as any[];
        return sum + (details?.reduce((s, d) => s + (d.jumlah_pasang || 0), 0) || 0);
      }, 0);
      const finished = orders.filter(o => ['completed', 'delivered', 'ready'].includes(o.status)).length;
      const cancelled = orders.filter(o => o.status === 'cancelled').length;

      setTotalPendapatan(income);
      setTotalPesanan(ordersCount);
      setTotalSepatu(sepatuCount);
      setPesananSelesai(finished);
      setPesananBatal(cancelled);
    }
    setCalculating(false);
  }, [supabase]);

  // Trigger update when dates change
  useEffect(() => {
    if (periodeAwal && periodeAkhir) {
      updateStats(periodeAwal, periodeAkhir);
    }
  }, [periodeAwal, periodeAkhir, updateStats]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    
    const payload = {
      periode_awal: periodeAwal,
      periode_akhir: periodeAkhir,
      total_pendapatan: totalPendapatan,
      total_pengeluaran: totalPengeluaran,
      total_profit: totalPendapatan - totalPengeluaran,
      total_pesanan: totalPesanan,
      total_sepatu: totalSepatu,
      pesanan_selesai: pesananSelesai,
      pesanan_batal: pesananBatal,
    };

    await supabase.from("laporan_laundries").update(payload).eq("id", id);
    setSaving(false);
    router.push("/dashboard/laporan");
  }

  async function handleDelete() {
    if (!confirm("Hapus laporan ini?")) return;
    await supabase.from("laporan_laundries").delete().eq("id", id);
    router.push("/dashboard/laporan");
  }

  function formatCurrency(v: number) {
    return Number(v).toLocaleString("id-ID");
  }

  if (loading) return <div className="p-8 animate-pulse text-gray-400 font-bold">Loading...</div>;
  if (!item) return <div className="p-8 text-red-500 font-bold">Laporan tidak ditemukan</div>;

  return (
    <div className="max-w-5xl space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Laporan</h1>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          Hapus Laporan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden shadow-2xl shadow-gray-100/50">
          {/* Card Header */}
          <div className="bg-orange-500 px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart className="w-6 h-6 text-white" />
              <h2 className="text-lg font-black text-white tracking-wide">Detail Statistik Periode</h2>
            </div>
            {calculating && (
              <div className="flex items-center gap-2 text-white text-xs font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengkalkulasi...
              </div>
            )}
          </div>

          <div className="p-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              {/* Left Column: Dates */}
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Periode Awal</label>
                  <div className="relative group">
                    <input
                      name="periode_awal"
                      type="date"
                      required
                      value={periodeAwal}
                      onChange={(e) => setPeriodeAwal(e.target.value)}
                      className="w-full pl-6 pr-12 py-4 text-sm font-bold border-2 border-gray-100 rounded-2xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all appearance-none"
                    />
                    <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Periode Akhir</label>
                  <div className="relative group">
                    <input
                      name="periode_akhir"
                      type="date"
                      required
                      value={periodeAkhir}
                      onChange={(e) => setPeriodeAkhir(e.target.value)}
                      className="w-full pl-6 pr-12 py-4 text-sm font-bold border-2 border-gray-100 rounded-2xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all appearance-none"
                    />
                    <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Column: Financials */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-gray-900 tracking-tight">Total Pendapatan (Otomatis)</label>
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">Rp</div>
                    <div className="w-full pl-16 pr-6 py-4 text-sm font-black border-2 border-gray-100 rounded-2xl bg-white text-gray-400">
                      {formatCurrency(totalPendapatan)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-900 tracking-tight">Total Pengeluaran</label>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-white/80">Rp</div>
                    <input
                      name="total_pengeluaran"
                      type="number"
                      required
                      value={totalPengeluaran}
                      onChange={(e) => setTotalPengeluaran(Number(e.target.value))}
                      className="w-full pl-16 pr-6 py-4 text-sm font-black border-none rounded-2xl bg-red-400 text-white placeholder:text-white/50 focus:outline-none ring-offset-4 focus:ring-2 focus:ring-red-400 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-gray-900 tracking-tight">Total Profit (Otomatis)</label>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-600/60">Rp</div>
                    <div className="w-full pl-16 pr-6 py-4 text-sm font-black border-none rounded-2xl bg-emerald-50 text-emerald-600">
                      {formatCurrency(totalPendapatan - totalPengeluaran)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row Stats */}
            <div className="pt-10 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Total Pesanan</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <ShoppingCart className="w-4 h-4 text-gray-400" />
                  <div className="text-sm font-black text-gray-900">{totalPesanan}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Total Sepatu</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <Package className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center flex-1">
                    <div className="text-sm font-black text-gray-900">{totalSepatu}</div>
                    <span className="text-[10px] font-black text-gray-400 ml-1 whitespace-nowrap">Pasang</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Pesanan Selesai</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div className="text-sm font-black text-emerald-600 font-mono">{pesananSelesai}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Pesanan Batal</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-red-400/20 border border-red-400/30 rounded-xl">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <div className="text-sm font-black text-red-600 font-mono">{pesananBatal}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/laporan")}
              className="px-10 py-3 text-sm font-black text-orange-500 bg-white border-2 border-orange-500/20 rounded-2xl hover:bg-orange-50 transition-all flex items-center gap-2"
            >
              <Undo2 className="w-4 h-4" />
              Batalkan
            </button>
            <button
              type="submit"
              disabled={saving || calculating}
              className="px-10 py-3 text-sm font-black text-white bg-orange-500 rounded-2xl hover:bg-orange-600 shadow-xl shadow-orange-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
